import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || "";
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("[lemon-webhook] LEMONSQUEEZY_WEBHOOK_SECRET is not configured.");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // 1. Verify HMAC-SHA256 signature
    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const sigBuffer = Buffer.from(signature, "utf8");

    if (digest.length !== sigBuffer.length || !crypto.timingSafeEqual(digest, sigBuffer)) {
      console.error("[lemon-webhook] Invalid signature received.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Parse payload
    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const orderData = payload.data?.attributes;

    if (!eventName || !orderData) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    const customerEmail = (orderData.user_email || orderData.customer_email)?.trim().toLowerCase();
    const customerName = orderData.user_name || orderData.customer_name || "";
    const orderId = String(payload.data.id || "");
    const orderStatus = orderData.status;

    console.log(`[lemon-webhook] Received event: ${eventName} for ${customerEmail} (Status: ${orderStatus})`);

    const auth = adminAuth();
    const db = adminDb();

    // 3. Handle order_created (Successful purchase)
    if (eventName === "order_created") {
      if (orderStatus === "paid" || !orderStatus) {
        let userRecord = null;
        try {
          userRecord = await auth.getUserByEmail(customerEmail);
        } catch (e) {
          // User has not logged in with Google yet
          console.log(`[lemon-webhook] User ${customerEmail} not found in Firebase Auth yet. Adding to pending_pro.`);
        }

        if (userRecord) {
          // Existing user -> upgrade to PRO immediately
          await db.collection("users").doc(userRecord.uid).set(
            {
              isPro: true,
              email: customerEmail,
              lemonSqueezyOrderId: orderId,
              proActivatedAt: new Date().toISOString(),
              proActivationSource: "lemonsqueezy_webhook",
            },
            { merge: true }
          );
          console.log(`[lemon-webhook] User ${userRecord.uid} (${customerEmail}) upgraded to PRO!`);
        } else {
          // New/unregistered user -> queue in pending_pro
          await db.collection("pending_pro").doc(customerEmail).set({
            email: customerEmail,
            name: customerName,
            lemonSqueezyOrderId: orderId,
            createdAt: new Date().toISOString(),
          });
        }

        // Save order log for admin records
        await db.collection("lemon_orders").doc(orderId).set({
          orderId,
          email: customerEmail,
          name: customerName,
          total: orderData.total_formatted || orderData.total || "",
          status: orderStatus,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // 4. Handle order_refunded (Revoke PRO if refunded)
    if (eventName === "order_refunded") {
      let userRecord = null;
      try {
        userRecord = await auth.getUserByEmail(customerEmail);
      } catch (e) {
        // User not in auth
      }

      if (userRecord) {
        await db.collection("users").doc(userRecord.uid).set(
          {
            isPro: false,
            refundedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        console.log(`[lemon-webhook] User ${userRecord.uid} PRO revoked due to refund.`);
      }

      // Also remove from pending_pro if was there
      await db.collection("pending_pro").doc(customerEmail).delete().catch(() => {});
    }

    return NextResponse.json({ success: true, event: eventName });
  } catch (err: any) {
    console.error("[lemon-webhook] Error processing webhook:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
