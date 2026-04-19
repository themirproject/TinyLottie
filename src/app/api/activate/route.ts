import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    // --- 1. Extract token from Authorization: Bearer <token> header ---
    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!idToken) {
      return NextResponse.json(
        { error: "Authentication required. No token provided." },
        { status: 401 }
      );
    }

    // --- 2. Extract coupon code from body ---
    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Coupon code is required." },
        { status: 400 }
      );
    }

    // --- 3. Verify the Firebase ID Token server-side ---
    let uid: string;
    try {
      const decoded = await adminAuth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch (tokenErr: any) {
      // Log the real reason so Vercel logs show the actual error
      console.error("[activate] verifyIdToken failed:", tokenErr);
      return NextResponse.json(
        { error: `Invalid or expired session. Please log in again. Details: ${tokenErr.message}` },
        { status: 401 }
      );
    }

    const normalizedCode = code.trim().toUpperCase();
    const db = adminDb();

    // --- 4. Look up the coupon in Firestore ---
    const snapshot = await db
      .collection("coupons")
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

    // --- 5. Atomic updates: burn the coupon + elevate the user ---
    const batch = db.batch();

    batch.update(couponDoc.ref, {
      used: true,
      redeemedBy: uid,
      redeemedAt: new Date().toISOString(),
    });

    const userRef = db.collection("users").doc(uid);
    batch.set(userRef, { isPro: true }, { merge: true });

    await batch.commit();

    console.log(`[activate] UID ${uid} successfully upgraded to PRO with code ${normalizedCode}`);
    return NextResponse.json({ success: true, message: "PRO activated successfully." });
  } catch (err: any) {
    console.error("[activate] Unexpected error:", err);
    return NextResponse.json(
      { error: `An unexpected error occurred: ${err.message || String(err)}` },
      { status: 500 }
    );
  }
}
