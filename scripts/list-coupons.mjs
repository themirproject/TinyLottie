#!/usr/bin/env node
/**
 * TinyLottie Coupon Lister & Tracker
 *
 * Usage:
 *   node scripts/list-coupons.mjs
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
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

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID?.replace(/^"|"$/g, "").trim();
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.replace(/^"|"$/g, "").trim();
const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!projectId || !clientEmail || !rawKey) {
  console.error("\n❌  .env.local dosyasında Firebase Admin anahtarları bulunamadı.\n");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: formatPrivateKey(rawKey),
    }),
  });
}

const db = getFirestore();

(async () => {
  const snapshot = await db.collection("coupons").get();
  
  const unused = [];
  const used = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    const item = {
      id: doc.id,
      code: data.code,
      used: !!data.used,
      rawCreatedAt: data.createdAt || "",
      rawRedeemedAt: data.redeemedAt || "",
      createdAt: data.createdAt ? new Date(data.createdAt).toLocaleString("tr-TR") : "-",
      redeemedAt: data.redeemedAt ? new Date(data.redeemedAt).toLocaleString("tr-TR") : "-",
      redeemedBy: data.redeemedBy || "-",
      note: data.note || "-"
    };
    if (item.used) {
      used.push(item);
    } else {
      unused.push(item);
    }
  });

  unused.sort((a, b) => b.rawCreatedAt.localeCompare(a.rawCreatedAt));
  used.sort((a, b) => b.rawRedeemedAt.localeCompare(a.rawRedeemedAt));

  console.log("\n========================================================");
  console.log(`🎟️  TINYLOTTIE KUPON RAPORU (Toplam: ${snapshot.size})`);
  console.log("========================================================\n");

  console.log(`🟢 KULLANILABİLİR (AKTİF) KUPONLAR (${unused.length} adet):`);
  console.log("--------------------------------------------------------");
  if (unused.length === 0) {
    console.log("   (Kullanılabilir kupon kalmadı)");
  } else {
    unused.forEach((c, idx) => {
      console.log(` ${String(idx + 1).padStart(2, " ")}. Kod: ${c.code.padEnd(14)} | Oluşturuldu: ${c.createdAt} | Not: ${c.note}`);
    });
  }

  console.log(`\n🔴 KULLANILMIŞ KUPONLAR (${used.length} adet):`);
  console.log("--------------------------------------------------------");
  if (used.length === 0) {
    console.log("   (Henüz kullanılmış kupon yok)");
  } else {
    used.forEach((c, idx) => {
      console.log(` ${String(idx + 1).padStart(2, " ")}. Kod: ${c.code.padEnd(14)} | Kullanıldı: ${c.redeemedAt} | Kullanıcı: ${c.redeemedBy.slice(0, 10)}...`);
    });
  }
  console.log("\n========================================================\n");
  process.exit(0);
})();
