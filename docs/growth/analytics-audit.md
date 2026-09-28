# TinyLottie Analytics Integrity & Funnel Audit
**Growth Sprint 01 — Technical Documentation**  
**Date:** September 2026  
**Status:** Completed & Verified

---

## 1. Executive Summary & Verified Baseline State

At the inception of this growth sprint, the TinyLottie Admin Dashboard displayed the following usage and telemetry statistics:

| Metric | Displayed Value | Underlying Source | Time Range |
| :--- | :--- | :--- | :--- |
| **Total Optimizations** | 141 (now 142) | Firestore `usage_logs` | Lifetime (Apr 25, 2026 – present) |
| **Unique Logged-In Users** | 12 | Firestore `usage_logs` (`userId` set) | Lifetime |
| **Total Bytes Saved** | 1638.46 MB | Firestore `usage_logs` calculation | Lifetime |
| **Original Cumulative Size**| 1944.24 MB | Firestore `usage_logs` calculation | Lifetime |
| **Average Compression** | 62% | Firestore `usage_logs` mean ratio | Lifetime |
| **Best Compression** | 92% | Firestore `usage_logs` max ratio | Lifetime |
| **Registered Auth Users** | 34 | Firebase Authentication | Lifetime |
| **Active PRO Accounts** | 9 | Firestore `users` (`isPro: true`) | Lifetime |
| **Free Tier Users** | 25 | Derived (34 - 9) | Lifetime |

### The Telemetry Card Discrepancy
The dashboard featured 6 KPI cards under the title **"GA4 Event Tracking"**:
- `file_loaded`: 61
- `paywall_hit`: 19
- `upgrade_click`: 0
- `paywall_dismissed`: 17
- `optimization_complete`: 58
- `optimized_file_download`: 45

---

## 2. Root Cause Analysis: 141 Lifetime vs. 58 "optimization_complete"

A core investigation goal was identifying why the dashboard reported 141 optimizations alongside 58 `optimization_complete` events.

### Finding 1: Two Entirely Different Collections and Time Ranges
1. **Total Optimizations (141):** Sourced from the Firestore `usage_logs` collection.
   - `usage_logs` only stores records when an **authenticated/logged-in user** completes an optimization.
   - The total collection size at audit time was 142 documents dating back to **April 25, 2026**.
   - Because the query had `limit(200)`, it loaded the entire 5-month lifetime history of logged-in user optimizations.
2. **"GA4 Event Tracking" Cards (58 optimizations):** Sourced from the Firestore `analytics_events` collection.
   - The query in `src/app/admin/page.tsx` was:
     ```typescript
     const eq = query(
       collection(db, "analytics_events"),
       orderBy("timestamp", "desc"),
       limit(200)
     );
     ```
   - Total documents in `analytics_events` all-time was **4,270 documents** (including anonymous users and repeat actions).
   - Because `limit(200)` was hardcoded, the dashboard only retrieved the **most recent 200 events**, which spanned merely **4 days (September 24, 2026 to September 28, 2026)**.

### Finding 2: The Exact Math of the 200-Event Buffer
Examining the sum of the event counts in that 200-record slice reveals:
$$\text{file\_loaded} (61) + \text{paywall\_hit} (19) + \text{upgrade\_click} (0) + \text{paywall\_dismissed} (17) + \text{optimization\_complete} (58) + \text{optimized\_file\_download} (45) = 200$$

Every single event in that dashboard panel was part of a rolling 200-event buffer, **not** lifetime data, and **not** pulled from the Google Analytics 4 API.

### Finding 3: Misleading Labeling
The card was labeled "GA4 Event Tracking" with a green "Live" badge, leading viewers to assume GA4 reported only 58 optimizations. In reality:
- It was client-side telemetry written to Firestore by `logToFirestore()`.
- GA4 is a separate third-party system affected by browser ad-blockers, tracking prevention, and its own reporting latency.
- In all-time Firestore `analytics_events`, there were **1,334 `optimization_complete` events**, not 58.

---

## 3. PRO Membership Origin Investigation (9 PRO Accounts)

The database was audited to determine whether the 9 PRO accounts originated from verified payments, manual admin grants, promotional codes, or legacy migrations.

### Detailed Account Audit

| # | User Email | UID | PRO Source | Date Activated | Origin Classification |
| :- | :--- | :--- | :--- | :--- | :--- |
| 1 | `emir.kalayci@gmail.com` | `Py3GTwTWhLbY1bVHmVLtoqjYDdP2` | Coupon `PRO-0001` | 2026-04-19 | **Internal / Founder** |
| 2 | `kalayci.emir@gmail.com` | `HYgHmkE0OqOqrAZD2q6N2KZEA7m1` | Coupon `PRO-2340D0FE` | 2026-06-05 | **Internal / Founder** |
| 3 | `michaelwalden1980@gmail.com` | `iYpYv1TO8IPbn79Zw22l9sRF9rQ2` | Coupon `PRO-5695B9C1` | 2026-06-05 | **Promotional Grant** |
| 4 | `roy.cockram@stashcook.com` | `7psOwiqs7TfYmhKsEBLYOGGq7OG3` | Coupon `PRO-6BF3EB70` | 2026-06-15 | **Promotional Grant** |
| 5 | `timguomail@gmail.com` | `XMQnz9t4V1N67BgGHliFs3WxKWX2` | Coupon `PRO-85A5B3B2` | 2026-07-02 | **Promotional Grant** |
| 6 | `allenhi@126.com` | `xhicYWLdzcgWw21palOY3fESsjw1` | Coupon `PRO-98AAAAB8` | 2026-08-27 | **Promotional Grant** |
| 7 | `isissi525@gmail.com` | `OLInWfeItBgCp0LfHT5R4SanMOI3` | Coupon `PRO-0E80F9FA` | 2026-09-18 | **Promotional Grant** |
| 8 | `griw222@gmail.com` | `2x7ud7tTlOa1FZFNHB07Fw0N1mx2` | Admin Manual Grant | 2026-09-18 | **Manual Admin Grant** |
| 9 | `michael@epicstudios.ai` | `wI5VCcUCU1SvgUmmCOSy3mjVHVt1` | Admin Manual Grant | 2026-09-18 | **Manual Admin Grant** |

### Orders & Webhook Status
- `lemon_orders` collection contains **1 document**: `test_order_live_001` for `dinamenucom@gmail.com` (Total: $19.00, Status: paid, Date: 2026-09-18). This was a developer sandbox webhook verification test.
- `pending_pro` collection: **0 documents**.
- **Conclusion:** **0 of the 9 active PRO accounts are organic paid external customers.** 7 originated from promotional campaign coupon codes (2 of which belong to the founder), and 2 were directly granted PRO via the Admin Dashboard.
- **Action Taken:** In accordance with sprint guidelines, no entitlements were modified or revoked.

---

## 4. Funnel Review & Defect Identification

### Funnel Metrics (Last 200 Telemetry Buffer vs All-Time Firestore)

```
[ File Loaded ] ───────────────────────── 61 (Buffer) / 1,260 (All-time)
       │
       ├─ [ Optimization Complete ] ───── 58 (Buffer) / 1,334 (All-time)
       │         │
       │         └─ [ File Download ] ─── 45 (Buffer) / 663 (All-time)
       │
       └─ [ Paywall Hit (>3MB) ] ──────── 19 (Buffer) / 581 (All-time)
                 │
                 ├─ [ Paywall Dismissed ] 17 (Buffer) / 426 (All-time)
                 │
                 └─ [ Upgrade Click ] ───  0 (Buffer) / 6 (All-time)
```

### Defect Identified: Why `upgrade_click` was 0
1. **Missing Event Tracking on Key CTAs:**
   - In `src/app/page.tsx` (Homepage Pricing Section, line 772):
     ```tsx
     <a href="https://tiny-lottie.lemonsqueezy.com/checkout/buy/..." target="_blank">
       Upgrade to Pro
     </a>
     ```
     This link navigated directly to Lemon Squeezy without triggering `trackPaywallUpgradeClick("pricing_section")`.
   - In `src/app/profile/page.tsx` (User Profile Upgrade CTA, line 240):
     Navigated directly without triggering `trackPaywallUpgradeClick("pricing_section")`.
   - Only `src/components/PricingModal.tsx` was calling `trackPaywallUpgradeClick("modal")`.
2. **False Dismissal Spike in Modal:**
   - When users clicked "Upgrade to Pro" in `PricingModal.tsx`, the Lemon Squeezy checkout opened in a new tab while the modal remained open.
   - When the user later clicked outside or clicked the "X" button to close the modal, `trackPaywallDismissed()` was fired, artificially inflating the dismissal rate.

### Fix Implemented:
1. Attached `onClick={() => trackPaywallUpgradeClick("pricing_section")}` to both the homepage and profile upgrade buttons.
2. Updated `PricingModal.tsx` with an `upgradedRef` flag that closes the modal upon clicking upgrade and suppresses the false `paywall_dismissed` event.

---

## 5. Standardized Event Taxonomy

| Event Name | Trigger Location | Purpose | Key Parameters |
| :--- | :--- | :--- | :--- |
| `file_loaded` | `LottieDropZone` / `handleFileSelect` | Measures file upload intent | `file_size_kb`, `file_extension` |
| `paywall_hit` | `handleFileSelect` (>3MB for free tier) | Top of monetization funnel | `file_size_kb`, `file_size_mb`, `limit_mb` |
| `upgrade_click` | `PricingModal`, `/#pricing`, `/profile` | Purchase intent & checkout exit | `source` ("modal" \| "pricing_section" \| "header"), `plan` |
| `paywall_dismissed` | `PricingModal` onClose (without upgrade) | Measures paywall friction | none |
| `optimization_complete`| `handleOptimize` (completion) | Core value delivery metric | `original_size_kb`, `optimized_size_kb`, `compression_ratio_pct`, `already_optimized`, `user_tier` |
| `optimization_error` | `handleOptimize` (catch block) | Reliability monitoring | none |
| `optimized_file_download`| `handleDownload` | Conversion completion | `download_format`, `optimized_size_kb`, `compression_ratio_pct` |
| `login` / `sign_up` | `AuthModal` / `AuthContext` | Account creation & login | `method` ("google" \| "email") |

---

## 6. What Was Changed vs Left Unchanged

### What Already Worked
- Google Analytics 4 tracking script via `@next/third-parties/google` in `layout.tsx`.
- Client-side event dispatching via `window.gtag` in `src/lib/analytics.ts`.
- Core optimization engine running 100% offline in browser (zero file uploads).
- Stripe / LemonSqueezy webhook signature verification in `/api/webhooks/lemonsqueezy`.

### What Was Incorrect
- Admin dashboard titled the rolling 200 Firestore events buffer as "GA4 Event Tracking".
- Homepage and profile page upgrade links did not track `upgrade_click`.
- `PricingModal` tracked false dismissals after an upgrade click.
- 14-day optimization chart collapsed to 0 when date filters ("24h", "7d") were selected.
- Personal admin email addresses were hardcoded in frontend components.

### What Was Changed
- Created `src/lib/config/internal-accounts.ts` to manage test and admin UIDs securely.
- Replaced frontend hardcoded emails in `admin/page.tsx` with `isAdminUser(user.uid)`.
- Added Activity Segment filter (`All`, `External`, `Internal / Testing`) in Admin Dashboard.
- Decoupled the 14-day chart from the short-window table filter and enhanced visual bar scaling.
- Clarified dashboard labels to distinguish between Firestore Client Telemetry and all-time `usage_logs`.
- Added missing click tracking to all upgrade buttons and eliminated false dismissals.

### What Was Deliberately Left Unchanged
- Historical Firestore records in `usage_logs` and `analytics_events` (zero records deleted or modified).
- Existing user PRO entitlements (all 9 accounts preserved).
- Production GA4 event names (preserved complete backward compatibility).
- Core Lemon Squeezy checkout integration.

### What Requires Manual Verification
- In production GA4 realtime debug view, verify that clicking "Upgrade to Pro" from `https://tinylottie.com/#pricing` triggers the `upgrade_click` event with `source: "pricing_section"`.
- Verify in Google Search Console that indexing status for `https://tinylottie.com/` updates following heading and meta description adjustments.
