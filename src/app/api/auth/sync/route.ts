import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!idToken) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = await adminAuth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email?.toLowerCase();

    const db = adminDb();
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    let isPro = false;

    if (userSnap.exists) {
      isPro = userSnap.data()?.isPro === true;
    }

    // If user is not yet PRO, check if they bought on Lemon Squeezy before logging in
    if (!isPro && email) {
      const pendingSnap = await db.collection("pending_pro").doc(email).get();
      if (pendingSnap.exists) {
        const pendingData = pendingSnap.data();
        isPro = true;
        await userRef.set(
          {
            email,
            displayName: decoded.name || "",
            isPro: true,
            lemonSqueezyOrderId: pendingData?.lemonSqueezyOrderId || "",
            proActivatedAt: new Date().toISOString(),
            proActivationSource: "lemonsqueezy_pending",
          },
          { merge: true }
        );
        // Clean up pending queue
        await pendingSnap.ref.delete().catch(() => {});
        console.log(`[auth-sync] Auto-elevated user ${email} (${uid}) to PRO from pending_pro!`);
      }
    }

    // Ensure email is written on the user document
    if (email && (!userSnap.exists || !userSnap.data()?.email)) {
      await userRef.set(
        {
          email,
          displayName: decoded.name || "",
          createdAt: userSnap.exists ? undefined : new Date().toISOString(),
        },
        { merge: true }
      );
    }

    return NextResponse.json({ success: true, uid, isPro });
  } catch (err: any) {
    console.error("[auth-sync] Error syncing user:", err);
    return NextResponse.json(
      { error: err.message || "Failed to sync" },
      { status: 500 }
    );
  }
}
