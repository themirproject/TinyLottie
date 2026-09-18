#!/usr/bin/env node
/**
 * TinyLottie - Make User PRO by Email or UID
 *
 * Usage:
 *   node scripts/make-user-pro.mjs <email-or-uid> [couponCode]
 *
 * Example:
 *   node scripts/make-user-pro.mjs user@example.com
 *   node scripts/make-user-pro.mjs user@example.com PRO-0E80F9FA
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
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

const target = process.argv[2];
const couponCode = process.argv[3];

if (!target) {
  console.error("\n❌  Kullanım: node scripts/make-user-pro.mjs <email-veya-uid> [kuponKodu]\n");
  process.exit(1);
}

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID?.replace(/^"|"$/g, "").trim();
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.replace(/^"|"$/g, "").trim();
const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: formatPrivateKey(rawKey),
    }),
  });
}

const auth = getAuth();
const db = getFirestore();

(async () => {
  let userRecord;
  try {
    if (target.includes("@")) {
      userRecord = await auth.getUserByEmail(target.trim());
    } else {
      userRecord = await auth.getUser(target.trim());
    }
  } catch (err) {
    console.error(`\n❌  Kullanıcı Firebase Auth üzerinde bulunamadı (${target}).`);
    console.error("   Kullanıcı henüz siteye Google ile en az bir kez giriş yapmış mı?\n");
    process.exit(1);
  }

  const uid = userRecord.uid;
  console.log(`\n👤 Kullanıcı bulundu:`);
  console.log(`   Email: ${userRecord.email}`);
  console.log(`   İsim : ${userRecord.displayName || "-"}`);
  console.log(`   UID  : ${uid}`);

  const batch = db.batch();
  const userRef = db.collection("users").doc(uid);
  batch.set(userRef, {
    isPro: true,
    email: userRecord.email,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  if (couponCode) {
    const codeSnap = await db.collection("coupons")
      .where("code", "==", couponCode.trim().toUpperCase())
      .limit(1)
      .get();
    if (!codeSnap.empty) {
      batch.update(codeSnap.docs[0].ref, {
        used: true,
        redeemedBy: uid,
        redeemedAt: new Date().toISOString()
      });
      console.log(`🎟️  Kupon (${couponCode.trim().toUpperCase()}) bu kullanıcı için kullanıldı olarak işaretlendi.`);
    }
  }

  await batch.commit();

  console.log(`\n🎉 BAŞARILI: ${userRecord.email} kullanıcısı TinyLottie PRO yapıldı!\n`);
  process.exit(0);
})();
