# TinyLottie — Growth Sprint 02 Planning & Technical Roadmap
**Growth Sprint 01 Deliverable**  
**Date:** September 2026  
**Status:** Ready for Review (DO NOT start automatically)

---

## 1. Sprint 02 Focus & Objectives

Following the data integrity, privacy hardening, and funnel fixes established in Sprint 01, Sprint 02 focuses on **organic traffic expansion, conversion funnel completion, and historical data hygiene**.

### Target Milestones
1. **Dedicated SEO Route Rollout:** Deploy `/lottie-compressor` to capture targeted organic search volume from Google Search Console queries.
2. **Historical Data Anonymization Migration:** Execute the documented safe migration on historical `usage_logs` to remove legacy filenames.
3. **End-to-End Monetization Attribution:** Complete checkout conversion tracking from `upgrade_click` to post-purchase redirect.
4. **GA4 Custom Dimensions Registration:** Ensure all custom event parameters are indexed in Google Analytics 4 reporting tables.

---

## 2. Work Streams & Technical Specifications

### Work Stream 1: Dedicated `/lottie-compressor` Landing Page

- **Objective:** Capture the #1 Search Console query ("lottie compressor") with a dedicated, highly relevant landing page without diluting homepage authority.
- **Route:** `src/app/lottie-compressor/page.tsx`
- **Technical Architecture:**
  - Modularize the client optimization engine (`src/components/OptimizationEngine.tsx`) so both `/` and `/lottie-compressor` share identical in-browser processing logic.
  - Implement unique static editorial content targeting compression mechanics:
    - Path coordinate precision trimming.
    - Bodymovin metadata stripping.
    - WebP conversion of raster assets.
    - dotLottie ZIP container bundling.
  - Metadata & Canonical:
    - Title: `Free Lottie Compressor — Compress Lottie JSON & dotLottie up to 98%`
    - Canonical: `https://tinylottie.com/lottie-compressor`
  - Sitemap: Add to `src/app/sitemap.ts` with priority `0.9`.

### Work Stream 2: Historical `usage_logs` Anonymization Migration

- **Objective:** Permanently remove raw client filenames from all 142 historical `usage_logs` documents.
- **Execution Plan:**
  1. **Backup Phase:** Run `scripts/backup-firestore.mjs` to export the full `usage_logs` collection to an encrypted JSON archive.
  2. **Dry Run Phase:** Execute `scripts/migrate-anonymize-logs.mjs --dry-run` to verify that 100% of documents with `fileName` are identified without touching sizes or ratios.
  3. **Batch Commit Phase:** Run atomic batches using `FieldValue.delete()` to purge `fileName` and set `format` and `fileNameAnonymized: true`.
  4. **Verification:** Query Firestore to confirm zero documents contain raw strings.

### Work Stream 3: End-to-End Checkout Attribution

- **Objective:** Bridge the tracking gap between clicking "Upgrade to Pro" and the arrival of the Lemon Squeezy webhook.
- **Implementation:**
  - Pass the current user's UID or anonymous session ID to the Lemon Squeezy checkout link as a custom query parameter:
    `https://tiny-lottie.lemonsqueezy.com/checkout/buy/c070366c-2fb4-41bf-ad9a-4af0cc94fab8?checkout[custom][uid]=${user?.uid || 'anon'}`
  - Configure the post-checkout redirect URL in Lemon Squeezy to navigate users back to `https://tinylottie.com/checkout/success?order_id=[order_id]`.
  - Create a lightweight success landing page (`src/app/checkout/success/page.tsx`) that:
    1. Fires GA4 `purchase` event with transaction value and currency.
    2. Calls `/api/auth/sync` to immediately activate PRO in the client state without requiring manual page refreshes.

### Work Stream 4: Google Analytics 4 Custom Dimensions Configuration

- **Objective:** Enable reporting on custom parameters sent by TinyLottie client events.
- **Required Custom Dimensions in GA4 Admin:**
  1. `source` (Event scope) — Identifies whether an upgrade click originated from "modal", "pricing_section", or "header".
  2. `file_extension` (Event scope) — Tracks ".json" vs ".lottie" format distribution.
  3. `download_format` (Event scope) — Tracks user preference for JSON vs dotLottie downloads.
  4. `user_tier` (Event scope) — Segments optimization events by "anonymous", "free", or "pro".
  5. `compression_ratio_pct` (Event scope, Numeric metric) — Tracks average compression efficiency in GA4 dashboards.

---

## 3. Strict Guardrails for Sprint 02

To maintain codebase stability and adhere to project architecture:
- ❌ **DO NOT** replace the client-side optimization engine with server-side processing.
- ❌ **DO NOT** introduce heavy charting or analytics libraries (e.g. Chart.js, Recharts) to the Admin Dashboard.
- ❌ **DO NOT** create multiple thin doorway pages; limit new routes strictly to high-volume validated queries.
- ❌ **DO NOT** modify existing user PRO entitlements without verified administrative instruction.
- ❌ **DO NOT** run database migrations without completing an verified local or cloud backup.

---

## 4. Definition of Done for Sprint 02

- [ ] `/lottie-compressor` builds cleanly and is indexed in `sitemap.xml`.
- [ ] Historical `usage_logs` collection contains zero unhashed client filenames.
- [ ] A test purchase through Lemon Squeezy passes custom metadata and fires a verified `purchase` event.
- [ ] GA4 custom dimensions are verified in the GA4 Exploration Builder.
- [ ] Full regression testing confirms no regressions in client-side compression speed or privacy.
