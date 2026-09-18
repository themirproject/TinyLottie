#!/usr/bin/env node
/**
 * TinyLottie Registered Users & PRO Status Lister
 *
 * Usage:
 *   npm run users:list
 *   node scripts/list-users.mjs
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
  const authUsersResult = await auth.listUsers(500);
  const authUsers = authUsersResult.users;

  const usersSnap = await db.collection("users").get();
  const proMap = new Map();
  usersSnap.forEach(doc => {
    proMap.set(doc.id, doc.data().isPro === true);
  });

  const list = authUsers.map(u => ({
    uid: u.uid,
    email: u.email || "E-posta Yok",
    name: u.displayName || "-",
    isPro: proMap.get(u.uid) === true,
    createdAt: u.metadata.creationTime ? new Date(u.metadata.creationTime).toLocaleString("tr-TR") : "-",
    rawCreated: new Date(u.metadata.creationTime || 0).getTime()
  }));

  list.sort((a, b) => b.rawCreated - a.rawCreated);

  console.log("\n=========================================================================================");
  console.log(`👥  TINYLOTTIE KAYITLI KULLANICILAR (Toplam: ${list.length})`);
  console.log("=========================================================================================\n");

  list.forEach((u, i) => {
    const proBadge = u.isPro ? "⭐ [PRO] " : "   [FREE]";
    const num = String(i + 1).padStart(2, " ");
    console.log(`${num}. ${proBadge} | ${u.email.padEnd(35)} | ${u.name.padEnd(20)} | Kayıt: ${u.createdAt}`);
  });

  console.log("\n=========================================================================================\n");
  process.exit(0);
})();
