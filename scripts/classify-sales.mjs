#!/usr/bin/env node
/**
 * TinyLottie - Historical Sales Classification Script
 * ----------------------------------------------------
 * Safely tags verified historical customer sales, internal test accounts,
 * and leaves unverified manual grants as "unknown".
 *
 * DOES NOT modify isPro status or revoke any entitlement.
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

// 5 verified historical sales fulfilled via manual coupon
const HISTORICAL_SALES_UIDS = [
  { uid: "iYpYv1TO8IPbn79Zw22l9sRF9rQ2", email: "michaelwalden1980@gmail.com", coupon: "PRO-5695B9C1" },
  { uid: "7psOwiqs7TfYmhKsEBLYOGGq7OG3", email: "roy.cockram@stashcook.com", coupon: "PRO-6BF3EB70" },
  { uid: "XMQnz9t4V1N67BgGHliFs3WxKWX2", email: "timguomail@gmail.com", coupon: "PRO-85A5B3B2" },
  { uid: "xhicYWLdzcgWw21palOY3fESsjw1", email: "allenhi@126.com", coupon: "PRO-98AAAAB8" },
  { uid: "OLInWfeItBgCp0LfHT5R4SanMOI3", email: "isissi525@gmail.com", coupon: "PRO-0E80F9FA" },
];

// Internal founder / test accounts
const INTERNAL_TEST_UIDS = [
  { uid: "Py3GTwTWhLbY1bVHmVLtoqjYDdP2", email: "emir.kalayci@gmail.com" },
  { uid: "HYgHmkE0OqOqrAZD2q6N2KZEA7m1", email: "kalayci.emir@gmail.com" },
];

// Unverified manual admin grants (not counted as sales unless independently verified)
const UNVERIFIED_UIDS = [
  { uid: "2x7ud7tTlOa1FZFNHB07Fw0N1mx2", email: "griw222@gmail.com" },
  { uid: "wI5VCcUCU1SvgUmmCOSy3mjVHVt1", email: "michael@epicstudios.ai" },
];

async function main() {
  console.log("=== Classifying TinyLottie Historical Sales & Entitlements ===");
  const batch = db.batch();
  const now = new Date().toISOString();

  // 1. Tag 5 historical sales
  for (const s of HISTORICAL_SALES_UIDS) {
    const ref = db.collection("users").doc(s.uid);
    batch.set(
      ref,
      {
        proOrigin: "historical_manual_sale",
        proOriginNotes: `Verified customer payment fulfilled via manual coupon (${s.coupon})`,
        proOriginVerifiedAt: now,
        proOriginVerifiedBy: "admin",
      },
      { merge: true }
    );
    console.log(`[Historical Sale] Tagged ${s.email} (${s.uid})`);
  }

  // 2. Tag internal test accounts
  for (const t of INTERNAL_TEST_UIDS) {
    const ref = db.collection("users").doc(t.uid);
    batch.set(
      ref,
      {
        proOrigin: "internal_test",
        proOriginNotes: "Founder / internal developer account",
        proOriginVerifiedAt: now,
        proOriginVerifiedBy: "admin",
      },
      { merge: true }
    );
    console.log(`[Internal Test] Tagged ${t.email} (${t.uid})`);
  }

  // 3. Tag unverified accounts
  for (const u of UNVERIFIED_UIDS) {
    const ref = db.collection("users").doc(u.uid);
    batch.set(
      ref,
      {
        proOrigin: "unknown",
        proOriginNotes: "Manual admin grant — pending independent verification of payment vs complimentary",
        proOriginVerifiedAt: now,
        proOriginVerifiedBy: "admin",
      },
      { merge: true }
    );
    console.log(`[Unverified Origin] Tagged ${u.email} (${u.uid})`);
  }

  await batch.commit();
  console.log("\n✅ Successfully updated entitlement origins in Firestore without altering isPro entitlements.");
}

main().catch(console.error);
