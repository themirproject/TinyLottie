#!/usr/bin/env node
/**
 * TinyLottie Coupon Generator
 * Usage: node scripts/generate-coupons.mjs <count>
 * Example: node scripts/generate-coupons.mjs 10
 *
 * Requires env vars: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY
 * Or place a .env.local file in the project root.
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { randomBytes } from "crypto";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local if present
try {
  const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of env.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
} catch { /* no .env.local, that's fine */ }

const count = parseInt(process.argv[2] ?? "10", 10);

const app = initializeApp({
  credential: cert({
    projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey:  (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore(app);

function generateCode() {
  // PRO-XXXXXXXX  (8 hex chars → 32-bit entropy)
  return "PRO-" + randomBytes(4).toString("hex").toUpperCase();
}

(async () => {
  const batch = db.batch();
  const codes = [];

  for (let i = 0; i < count; i++) {
    const code = generateCode();
    codes.push(code);
    const ref = db.collection("coupons").doc();
    batch.set(ref, {
      code,
      used: false,
      createdAt: new Date().toISOString(),
    });
  }

  await batch.commit();

  console.log(`\n✅ ${count} coupon(s) written to Firestore:\n`);
  codes.forEach(c => console.log(" ", c));
  console.log("\nSend these codes to customers after purchase via email.\n");
  process.exit(0);
})();
