#!/usr/bin/env node
/**
 * TinyLottie Coupon Generator
 *
 * Usage:
 *   node scripts/generate-coupons.mjs [count] [note] [path-to-service-account.json]
 *
 * Examples:
 *   node scripts/generate-coupons.mjs 10
 *   node scripts/generate-coupons.mjs 5 "Twitter Kampanyası"
 *   node scripts/generate-coupons.mjs 10 "Özel Müşteriler" ~/Downloads/serviceAccount.json
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { randomBytes } from "crypto";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnvLocal();

function formatPrivateKey(key) {
  if (!key) return "";
  let formatted = key.replace(/"/g, "").replace(/\\n/g, "\n");
  if (!formatted.includes("\n")) {
    formatted = formatted.replace(/-----BEGIN PRIVATE KEY-----\s*/g, "-----BEGIN PRIVATE KEY-----\n");
    formatted = formatted.replace(/\s*-----END PRIVATE KEY-----/g, "\n-----END PRIVATE KEY-----");
    const parts = formatted.split("\n");
    if (parts.length === 3) {
      parts[1] = parts[1].replace(/\s+/g, "");
      formatted = parts.join("\n");
    }
  }
  return formatted;
}

// --- Parse arguments ---
const count = parseInt(process.argv[2] ?? "10", 10);
const noteArg = process.argv[3];
const serviceAccountPath = process.argv[4] || (noteArg && noteArg.endsWith(".json") ? noteArg : undefined);
const note = noteArg && !noteArg.endsWith(".json") ? noteArg : undefined;

let credential;

if (serviceAccountPath) {
  try {
    const serviceAccount = JSON.parse(readFileSync(resolve(process.cwd(), serviceAccountPath), "utf8"));
    credential = cert(serviceAccount);
  } catch (e) {
    console.error(`\n❌  Dosya okunamadı: ${serviceAccountPath}\n`, e.message, "\n");
    process.exit(1);
  }
} else {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID?.replace(/^"|"$/g, "").trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.replace(/^"|"$/g, "").trim();
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawKey) {
    console.error(
      "\n❌  Firebase Admin anahtarları bulunamadı (.env.local kontrol edin veya serviceAccount.json belirtin).\n"
    );
    process.exit(1);
  }

  credential = cert({
    projectId,
    clientEmail,
    privateKey: formatPrivateKey(rawKey),
  });
}

if (!getApps().length) {
  initializeApp({ credential });
}

const db = getFirestore();

function generateCode() {
  return "PRO-" + randomBytes(4).toString("hex").toUpperCase();
}

(async () => {
  const batch = db.batch();
  const codes = [];
  const now = new Date().toISOString();

  for (let i = 0; i < count; i++) {
    const code = generateCode();
    codes.push(code);
    const data = {
      code,
      used: false,
      createdAt: now,
    };
    if (note) {
      data.note = note;
    }
    batch.set(db.collection("coupons").doc(), data);
  }

  await batch.commit();

  console.log(`\n✅  ${count} adet kupon başarıyla Firestore'a eklendi:\n`);
  codes.forEach(c => console.log("   ", c));
  if (note) console.log(`\n📝  Not/Etiket: "${note}"`);
  console.log("\n📧  Bu kodları müşterilere veya kullanıcılara iletebilirsin.\n");
  process.exit(0);
})();
