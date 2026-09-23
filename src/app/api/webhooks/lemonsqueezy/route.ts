import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

function getWelcomeProEmailHtml(params: {
  customerName: string;
  customerEmail: string;
  actionUrl: string;
  orderId: string;
}) {
  const { customerName, customerEmail, actionUrl, orderId } = params;
  const firstName = customerName ? customerName.split(" ")[0] : "there";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Welcome to TinyLottie PRO</title>
  <style>
    :root {
      color-scheme: light;
      supported-color-schemes: light;
    }
    body {
      background-color: #f8fafc !important;
      color: #0f172a !important;
    }
    .btn-mint {
      background-color: #00DDB3 !important;
      background-image: linear-gradient(#00DDB3, #00DDB3) !important;
      color: #ffffff !important;
    }
    .btn-mint span {
      color: #ffffff !important;
    }
    [data-ogsc] .btn-mint,
    [data-ogsb] .btn-mint {
      background-color: #00DDB3 !important;
      background-image: linear-gradient(#00DDB3, #00DDB3) !important;
      color: #ffffff !important;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px 32px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          <!-- Logo & Brand Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 10px;">
                    <img src="https://tinylottie.com/logo-icon.png" width="36" height="36" alt="TinyLottie Logo" style="display: block; width: 36px; height: 36px; border-radius: 10px;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">TinyLottie</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PRO Badge & Welcome Message -->
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <div style="display: inline-block; background-color: #E6FAF5; border: 1px solid rgba(0, 221, 179, 0.4); border-radius: 20px; padding: 5px 14px; font-size: 12px; font-weight: 700; color: #00A685; letter-spacing: 0.5px; text-transform: uppercase;">
                ★ PRO LIFETIME MEMBER
              </div>
              <h1 style="margin: 16px 0 8px 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                You're officially PRO! 🎉
              </h1>
              <p style="margin: 0; font-size: 15px; line-height: 24px; color: #475569;">
                Hi ${firstName}, thank you for supporting TinyLottie! Your PRO plan is active for <strong style="color: #0f172a;">${customerEmail}</strong>.
              </p>
            </td>
          </tr>

          <!-- What's Unlocked Card -->
          <tr>
            <td style="padding-bottom: 28px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px 20px 14px 20px;">
                <p style="margin: 0 0 14px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px;">
                  What's Unlocked on Your Account
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding-bottom: 12px; vertical-align: top; width: 28px; font-size: 16px;">⚡</td>
                    <td style="padding-bottom: 12px; vertical-align: top; font-size: 14px; line-height: 20px; color: #334155;">
                      <strong style="color: #0f172a;">Unlimited File Size:</strong> Compress heavy and complex animations without any size caps.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px; vertical-align: top; width: 28px; font-size: 16px;">📦</td>
                    <td style="padding-bottom: 12px; vertical-align: top; font-size: 14px; line-height: 20px; color: #334155;">
                      <strong style="color: #0f172a;">Bulk Optimization:</strong> Drag & drop dozens of files and download them in a batch.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px; vertical-align: top; width: 28px; font-size: 16px;">🎯</td>
                    <td style="padding-bottom: 12px; vertical-align: top; font-size: 14px; line-height: 20px; color: #334155;">
                      <strong style="color: #0f172a;">Max Compression:</strong> Deep precision float optimization and unused metadata stripping.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 6px; vertical-align: top; width: 28px; font-size: 16px;">🚀</td>
                    <td style="padding-bottom: 6px; vertical-align: top; font-size: 14px; line-height: 20px; color: #334155;">
                      <strong style="color: #0f172a;">Priority Processing:</strong> Fast-lane server priority for instant processing.
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <a href="${actionUrl}" target="_blank" class="btn-mint" style="display: inline-block; background-color: #00DDB3 !important; background-image: linear-gradient(0deg, #00DDB3, #00DDB3) !important; color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 40px; border-radius: 12px; box-shadow: 0 4px 14px 0 rgba(0, 221, 179, 0.45); -webkit-text-size-adjust: none;">
                <span style="color: #ffffff !important; font-weight: 700; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);">Start Using TinyLottie PRO &rarr;</span>
              </a>
            </td>
          </tr>

          <!-- Order Summary & Friendly note -->
          <tr>
            <td style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">
                ${orderId ? `Order Reference: <strong>#${orderId}</strong> &bull; ` : ""}Lifetime License
              </p>
              <p style="margin: 0; font-size: 13px; line-height: 20px; color: #64748b;">
                Need help or have a feature idea? Simply reply to this email &mdash; we read every message!
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" style="max-width: 520px; margin-top: 20px;">
          <tr>
            <td align="center" style="font-size: 12px; color: #94a3b8;">
              &copy; ${new Date().getFullYear()} TinyLottie. High performance Lottie optimization.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

async function sendWelcomeEmail({
  customerEmail,
  customerName,
  orderId,
}: {
  customerEmail: string;
  customerName: string;
  orderId: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn("[lemon-webhook] RESEND_API_KEY missing, skipping welcome email.");
    return;
  }

  const resend = new Resend(resendApiKey);

  // Generate a direct 1-click login link to /profile if possible
  let actionUrl = "https://tinylottie.com/profile";
  try {
    const magicLink = await adminAuth().generateSignInWithEmailLink(customerEmail, {
      url: "https://tinylottie.com/profile?pro=activated",
      handleCodeInApp: true,
    });
    if (magicLink) {
      actionUrl = magicLink;
    }
  } catch (err) {
    console.warn(
      "[lemon-webhook] Could not generate magic link for welcome email, falling back to profile URL:",
      err
    );
  }

  const fromEmail =
    process.env.RESEND_WELCOME_FROM_EMAIL || "TinyLottie <welcome@tinylottie.com>";

  try {
    let { data, error } = await resend.emails.send({
      from: fromEmail,
      to: customerEmail,
      replyTo: "emir.kalayci@gmail.com",
      subject: "Welcome to TinyLottie PRO! 🎉",
      html: getWelcomeProEmailHtml({
        customerName,
        customerEmail,
        actionUrl,
        orderId,
      }),
    });

    if (error && fromEmail.includes("@tinylottie.com")) {
      console.warn(
        "[lemon-webhook] Resend error with custom domain, retrying with onboarding@resend.dev:",
        error
      );
      const fallback = await resend.emails.send({
        from: "TinyLottie <onboarding@resend.dev>",
        to: customerEmail,
        replyTo: "emir.kalayci@gmail.com",
        subject: "Welcome to TinyLottie PRO! 🎉",
        html: getWelcomeProEmailHtml({
          customerName,
          customerEmail,
          actionUrl,
          orderId,
        }),
      });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.error("[lemon-webhook] Failed to send welcome email:", error);
    } else {
      console.log(
        `[lemon-webhook] Welcome email sent to ${customerEmail} (ID: ${data?.id})`
      );
    }
  } catch (err) {
    console.error("[lemon-webhook] Error sending welcome email:", err);
  }
}

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

        // 3.4 Send branded PRO welcome email with 1-click direct access
        await sendWelcomeEmail({
          customerEmail,
          customerName,
          orderId,
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
