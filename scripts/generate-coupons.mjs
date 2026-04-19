#!/usr/bin/env node
/**
 * TinyLottie Coupon Generator
 *
 * Usage:
 *   node scripts/generate-coupons.mjs <count> <path-to-service-account.json>
 *
 * Example:
 *   node scripts/generate-coupons.mjs 10 ~/Downloads/serviceAccount.json
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore }         from "firebase-admin/firestore";
import { randomBytes }          from "crypto";
import { readFileSync }         from "fs";
import { resolve }              from "path";

// --- Parse arguments ---
const count       = parseInt(process.argv[2] ?? "10", 10);
const serviceAccountPath = process.argv[3];

if (!serviceAccountPath) {
  console.error(
    "\n❌  Kullanım: node scripts/generate-coupons.mjs <adet> <serviceAccount.json-yolu>\n" +
    "   Örnek:    node scripts/generate-coupons.mjs 10 ~/Downloads/serviceAccount.json\n"
  );
  process.exit(1);
}

// --- Load service account JSON ---
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(resolve(process.cwd(), serviceAccountPath), "utf8"));
} catch (e) {
  console.error(`\n❌  Dosya okunamadı: ${serviceAccountPath}\n`, e.message, "\n");
  process.exit(1);
}

// --- Initialize Firebase Admin ---
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

function generateCode() {
  return "PRO-" + randomBytes(4).toString("hex").toUpperCase();
}

(async () => {
  const batch = db.batch();
  const codes = [];

  for (let i = 0; i < count; i++) {
    const code = generateCode();
    codes.push(code);
    batch.set(db.collection("coupons").doc(), {
      code,
      used: false,
      createdAt: new Date().toISOString(),
    });
  }

  await batch.commit();

  console.log(`\n✅  ${count} adet kupon Firestore'a yazıldı:\n`);
  codes.forEach(c => console.log("   ", c));
  console.log("\n📧  Bu kodları ödeme sonrası müşteriye e-posta ile ilet.\n");
  process.exit(0);
})();
