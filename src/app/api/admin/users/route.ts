import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

const ADMIN_EMAILS = ["emir.kalayci@gmail.com", "kalayci.emir@gmail.com"];

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return null;

  try {
    const decoded = await adminAuth().verifyIdToken(idToken);
    if (decoded.email && ADMIN_EMAILS.includes(decoded.email.toLowerCase())) {
      return decoded;
    }
    return null;
  } catch (e) {
    console.error("[admin-users-api] Token verification failed:", e);
    return null;
  }
}

// GET: List all users with their PRO status
export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const auth = adminAuth();
    const db = adminDb();

    // 1. Fetch Firebase Auth users
    const authUsersResult = await auth.listUsers(500);
    const authUsers = authUsersResult.users;

    // 2. Fetch Firestore users collection
    const usersSnap = await db.collection("users").get();
    const proMap = new Map<string, { isPro: boolean; email?: string }>();
    usersSnap.forEach((doc) => {
      const data = doc.data();
      proMap.set(doc.id, {
        isPro: data.isPro === true,
        email: data.email,
      });
    });

    const userList = authUsers.map((u) => {
      const firestoreData = proMap.get(u.uid);
      return {
        uid: u.uid,
        email: u.email || "",
        displayName: u.displayName || "",
        photoURL: u.photoURL || "",
        isPro: firestoreData ? firestoreData.isPro : false,
        createdAt: u.metadata.creationTime || "",
        lastSignInTime: u.metadata.lastSignInTime || "",
      };
    });

    userList.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

    return NextResponse.json({ users: userList });
  } catch (err: any) {
    console.error("[admin-users-api] GET error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST: Toggle PRO status for a user
export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { uid, isPro } = body;

    if (!uid || typeof isPro !== "boolean") {
      return NextResponse.json(
        { error: "uid and isPro (boolean) are required." },
        { status: 400 }
      );
    }

    const db = adminDb();
    const userRef = db.collection("users").doc(uid);

    await userRef.set(
      {
        isPro,
        updatedAt: new Date().toISOString(),
        updatedBy: admin.email,
      },
      { merge: true }
    );

    console.log(
      `[admin-users-api] User ${uid} PRO status updated to ${isPro} by ${admin.email}`
    );

    return NextResponse.json({ success: true, uid, isPro });
  } catch (err: any) {
    console.error("[admin-users-api] POST error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update PRO status" },
      { status: 500 }
    );
  }
}
