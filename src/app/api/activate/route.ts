import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { code, idToken } = await req.json();

    // --- 1. Validate inputs ---
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Coupon code is required." }, { status: 400 });
    }
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    // --- 2. Verify the Firebase ID Token server-side ---
    let uid: string;
    try {
      const decoded = await adminAuth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: "Invalid or expired session. Please log in again." }, { status: 401 });
    }

    const normalizedCode = code.trim().toUpperCase();
    const db = adminDb();

    // --- 3. Look up the coupon in Firestore ---
    const couponsRef = db.collection("coupons");
    const snapshot = await couponsRef
      .where("code", "==", normalizedCode)
      .where("used", "==", false)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "Invalid or already redeemed coupon code." },
        { status: 404 }
      );
    }

    const couponDoc = snapshot.docs[0];

    // --- 4. Atomic updates: burn the coupon + elevate the user ---
    const batch = db.batch();

    // Mark coupon as used
    batch.update(couponDoc.ref, {
      used: true,
      redeemedBy: uid,
      redeemedAt: new Date().toISOString(),
    });

    // Elevate user to PRO (upsert-safe)
    const userRef = db.collection("users").doc(uid);
    batch.set(userRef, { isPro: true }, { merge: true });

    await batch.commit();

    return NextResponse.json({ success: true, message: "PRO activated successfully." });
  } catch (err) {
    console.error("[activate] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
