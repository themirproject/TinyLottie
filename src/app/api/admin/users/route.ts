import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import {
  isInternalUser,
  ProOriginType,
} from "@/lib/config/internal-accounts";

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

// GET: List all users with their PRO status and entitlement origin
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
    const proMap = new Map<
      string,
      {
        isPro: boolean;
        email?: string;
        proOrigin?: ProOriginType;
        proOriginNotes?: string;
        proOriginVerifiedAt?: string;
        proOriginVerifiedBy?: string;
        lemonSqueezyOrderId?: string;
      }
    >();

    usersSnap.forEach((doc) => {
      const data = doc.data();
      const isPro = data.isPro === true;
      let proOrigin: ProOriginType | undefined = data.proOrigin;

      // Default fallback if not yet manually classified in Firestore:
      if (isPro && !proOrigin) {
        if (isInternalUser(doc.id)) {
          proOrigin = "internal_test";
        } else if (
          data.lemonSqueezyOrderId &&
          data.proActivationSource?.startsWith("lemonsqueezy") &&
          data.lemonSqueezyOrderId !== "test_order_live_001"
        ) {
          proOrigin = "automated_sale";
        } else {
          // Do not infer payment or complimentary automatically
          proOrigin = "unknown";
        }
      }

      proMap.set(doc.id, {
        isPro,
        email: data.email,
        proOrigin,
        proOriginNotes: data.proOriginNotes,
        proOriginVerifiedAt: data.proOriginVerifiedAt,
        proOriginVerifiedBy: data.proOriginVerifiedBy,
        lemonSqueezyOrderId: data.lemonSqueezyOrderId,
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
        proOrigin: firestoreData?.proOrigin,
        proOriginNotes: firestoreData?.proOriginNotes || "",
        proOriginVerifiedAt: firestoreData?.proOriginVerifiedAt || "",
        proOriginVerifiedBy: firestoreData?.proOriginVerifiedBy || "",
        lemonSqueezyOrderId: firestoreData?.lemonSqueezyOrderId || "",
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

// POST: Toggle PRO status OR classify entitlement origin
export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { uid, isPro, proOrigin, notes } = body;

    if (!uid) {
      return NextResponse.json(
        { error: "uid is required." },
        { status: 400 }
      );
    }

    const db = adminDb();
    const userRef = db.collection("users").doc(uid);

    // Operation A: Update Entitlement Origin classification (Safe classification mechanism)
    if (proOrigin) {
      const allowedOrigins: ProOriginType[] = [
        "historical_manual_sale",
        "automated_sale",
        "complimentary_grant",
        "internal_test",
        "unknown",
      ];

      if (!allowedOrigins.includes(proOrigin)) {
        return NextResponse.json(
          {
            error: `Invalid proOrigin. Must be one of: ${allowedOrigins.join(", ")}`,
          },
          { status: 400 }
        );
      }

      await userRef.set(
        {
          proOrigin,
          proOriginNotes: typeof notes === "string" ? notes.trim() : "",
          proOriginVerifiedAt: new Date().toISOString(),
          proOriginVerifiedBy: admin.email || admin.uid,
        },
        { merge: true }
      );

      console.log(
        `[admin-users-api] User ${uid} PRO origin updated to '${proOrigin}' by ${admin.email}`
      );

      return NextResponse.json({
        success: true,
        uid,
        proOrigin,
        proOriginNotes: notes || "",
      });
    }

    // Operation B: Toggle PRO status
    if (typeof isPro === "boolean") {
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
    }

    return NextResponse.json(
      { error: "Either isPro (boolean) or proOrigin (string) must be provided." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[admin-users-api] POST error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update user" },
      { status: 500 }
    );
  }
}
