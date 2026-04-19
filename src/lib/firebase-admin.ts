import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let adminApp: App;

// Aggressively format the private key to fix any Vercel copy-paste mangling
function formatPrivateKey(key: string | undefined): string {
  if (!key) return "";
  
  // 1. Remove ANY literal quotes
  let formatted = key.replace(/"/g, "");
  
  // 2. Replace escaped `\n` to actual newlines
  formatted = formatted.replace(/\\n/g, "\n");
  
  // 3. Fix single-line collapse (when pasted into Vercel plain text without newlines)
  if (!formatted.includes("\n")) {
    formatted = formatted.replace(/-----BEGIN PRIVATE KEY-----\s*/g, "-----BEGIN PRIVATE KEY-----\n");
    formatted = formatted.replace(/\s*-----END PRIVATE KEY-----/g, "\n-----END PRIVATE KEY-----");
    // Remove all spaces in the base64 signature
    const parts = formatted.split("\n");
    if (parts.length === 3) {
      parts[1] = parts[1].replace(/\s+/g, "");
      formatted = parts.join("\n");
    }
  }
  
  return formatted;
}

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Vercel UI or .env files might accidentally inject literal quotes
  const projectId   = process.env.FIREBASE_ADMIN_PROJECT_ID?.replace(/^"|"$/g, "")?.trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.replace(/^"|"$/g, "")?.trim();
  const rawKey      = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawKey) {
    console.error(
      "[firebase-admin] Missing env vars:",
      { projectId: !!projectId, clientEmail: !!clientEmail, privateKey: !!rawKey }
    );
    throw new Error("Firebase Admin SDK env vars not configured on this server.");
  }

  const privateKey = formatPrivateKey(rawKey);

  adminApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });

  console.log("[firebase-admin] Initialized for project:", projectId);
  return adminApp;
}

export const adminDb   = () => getFirestore(getAdminApp());
export const adminAuth = () => getAuth(getAdminApp());
