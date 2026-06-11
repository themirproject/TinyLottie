# TinyLottie — Product Documentation

> **Blazing Fast Lottie & dotLottie Optimizer**  
> Compress animation file sizes up to 98% — entirely in your browser.

---

## What is TinyLottie?

TinyLottie is a **100% browser-based Lottie animation optimizer** built for designers and developers who care about performance. Upload a Lottie JSON or dotLottie file, and TinyLottie instantly compresses it — without ever sending your file to a server.

**Live at:** [tinylottie.com](https://tinylottie.com)

---

## Core Features

### 🗜️ Smart Compression Engine
- Removes redundant metadata (`nm`, `mn`, `hd`, `cl` properties)
- Rounds floating-point numbers to 3 decimal precision to eliminate bloat
- Converts embedded base64 **PNG/JPEG/GIF images to WebP** format (80% quality) using the HTML5 Canvas API
- Achieves up to **98% file size reduction** on image-heavy Lottie files

### 📁 Universal Format Support
| Input | Output |
|---|---|
| Lottie JSON (`.json`) | Lottie JSON (minified) |
| dotLottie (`.lottie`) | dotLottie (zipped package) |

### 🔒 Zero-Upload Privacy
- **All processing is done locally in your browser** — files never touch any server
- No file size limits on optimization (PRO: unlimited; Free: up to 5 MB)
- Zero network requests during optimization

### 📊 Before & After Preview
- Side-by-side live animation playback (Original vs. Optimized)
- File size comparison with exact savings in KB/MB
- Animated progress bar showing % size reduction

### 💾 One-Click Download
- Download optimized file instantly as `.json` or `.lottie`
- dotLottie output is a proper zipped archive with a `manifest.json`

### 🌗 Dark Mode
- Full light/dark mode support with smooth transitions
- Respects system preference by default

---

## Pricing

| Plan | Price | File Size Limit |
|---|---|---|
| **Free** | $0 | Up to 5 MB |
| **PRO** | **$39** — One-Time Payment (Lifetime) | Unlimited |

PRO is activated via a coupon code purchased at [tiny-lottie.lemonsqueezy.com](https://tiny-lottie.lemonsqueezy.com/checkout/buy/c070366c-2fb4-41bf-ad9a-4af0cc94fab8). No subscriptions. No renewals. Pay once, use forever.

---

## Authentication

- Sign in with **Google** (optional — required only for PRO activation)
- PRO status is stored in **Firebase Firestore** and persists across devices and sessions
- Secure server-side token verification via **Firebase Admin SDK**

---

## Technical Architecture

```
Browser (Client)
├── Next.js 15 (App Router)
├── Lottie cleanup — pure JavaScript (JSON parsing + property removal)
├── Image optimization — HTML5 Canvas API → WebP (no server)
├── Format packaging — fflate (zip) for dotLottie output
└── Firebase Auth (Google sign-in)

Server (Vercel Serverless / Edge)
├── /api/activate — validates Firebase ID token + redeems Firestore coupon
└── /api/optimize — (legacy, now unused; optimization is 100% client-side)

Database
└── Firebase Firestore
    ├── coupons/{id} — { code, used, redeemedBy, redeemedAt }
    └── users/{uid}  — { isPro: true }

Infrastructure
├── Hosting: Vercel
├── Domain: tinylottie.com
├── Auth: Firebase Authentication
└── Analytics: Google Analytics + Vercel Analytics
```

---

## SEO & Discoverability

- Dynamic `opengraph-image.tsx` (1200×630) generated with Next.js Image Response API
- Full `robots.ts` — allows all major AI/LLM crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.)
- `sitemap.xml` auto-generated at `/sitemap.xml`
- JSON-LD structured data (Organization + SoftwareApplication schemas)
- `lang="en"`, semantic HTML5, single `<h1>` per page

---

## Pages

| Route | Description |
|---|---|
| `/` | Main optimizer — hero, drop zone, optimization view, features, FAQ, blog |
| `/profile` | Account page — PRO status, coupon activation, logout |
| `/privacy` | Privacy Policy |

---

## Support

📧 **emir.kalayci@gmail.com**

---

## Coupon Generation

PRO coupon codes are generated locally using a Node.js script and written directly to Firestore:

```bash
node scripts/generate-coupons.mjs <count> <serviceAccount.json>
# Example: node scripts/generate-coupons.mjs 10 ~/Downloads/serviceAccount.json
```

Each code follows the format `PRO-XXXXXXXX` (8 hex characters, e.g. `PRO-98AAAAB8`).

---

## Environment Variables (Vercel)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase client SDK API key |
| `FIREBASE_ADMIN_PROJECT_ID` | Firebase project ID (Admin SDK) |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Service account email (Admin SDK) |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Service account private key (Admin SDK) |
