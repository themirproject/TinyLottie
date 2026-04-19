import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let adminApp: App;

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId   = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawKey      = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawKey) {
    console.error(
      "[firebase-admin] Missing env vars:",
      { projectId: !!projectId, clientEmail: !!clientEmail, privateKey: !!rawKey }
    );
    throw new Error("Firebase Admin SDK env vars not configured on this server.");
  }

  // Vercel stores the key with literal \n — convert them back to real newlines
  const privateKey = rawKey.replace(/\\n/g, "\n");

  adminApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });

  console.log("[firebase-admin] Initialized for project:", projectId);
  return adminApp;
}

export const adminDb   = () => getFirestore(getAdminApp());
export const adminAuth = () => getAuth(getAdminApp());
