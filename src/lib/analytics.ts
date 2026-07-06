/**
 * TinyLottie Analytics Utility
 * --------------------------------
 * Thin wrapper around Google Analytics (gtag) that fires custom events.
 * All events are anonymous — no file content, no PII is sent.
 *
 * GA4 event names follow snake_case convention.
 * Custom dimensions visible in GA4 → Reports → Custom → Event parameters.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

function gtag(...args: any[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

// ─── File Upload ────────────────────────────────────────────────────────────

/**
 * Fired when a user successfully loads a valid Lottie file into the editor.
 */
export function trackFileLoaded(params: {
  fileSizeKb: number;
  fileExtension: string; // "json" | "lottie"
}) {
  gtag("event", "file_loaded", {
    file_size_kb: Math.round(params.fileSizeKb),
    file_extension: params.fileExtension,
  });
}

// ─── Paywall ────────────────────────────────────────────────────────────────

/**
 * Fired when a free user uploads a file that exceeds the 3MB limit.
 * This is the primary paywall conversion funnel event.
 */
export function trackPaywallHit(params: {
  fileSizeKb: number;
  fileSizeMb: string; // human-readable, e.g. "4.2 MB"
}) {
  gtag("event", "paywall_hit", {
    file_size_kb: Math.round(params.fileSizeKb),
    file_size_mb: params.fileSizeMb,
    limit_mb: 3,
  });
}

/**
 * Fired when a user clicks "Upgrade to Pro" from the paywall modal.
 */
export function trackPaywallUpgradeClick(source: "modal" | "pricing_section" | "header") {
  gtag("event", "upgrade_click", {
    source,
    plan: "lifetime_pro",
  });
}

/**
 * Fired when the paywall pricing modal is dismissed without upgrading.
 */
export function trackPaywallDismissed() {
  gtag("event", "paywall_dismissed");
}

// ─── Optimization ───────────────────────────────────────────────────────────

/**
 * Fired when optimization completes successfully.
 * Captures compression stats for funnel analysis.
 */
export function trackOptimizationComplete(params: {
  originalSizeKb: number;
  optimizedSizeKb: number;
  compressionRatioPct: number; // e.g. 78 for 78%
  isAlreadyOptimized: boolean; // true = file was already tiny, reverted to original
  userTier: "free" | "pro" | "anonymous";
}) {
  gtag("event", "optimization_complete", {
    original_size_kb: Math.round(params.originalSizeKb),
    optimized_size_kb: Math.round(params.optimizedSizeKb),
    compression_ratio_pct: params.compressionRatioPct,
    already_optimized: params.isAlreadyOptimized,
    user_tier: params.userTier,
  });
}

/**
 * Fired when the optimization fails (parse error, runtime error etc.).
 */
export function trackOptimizationError() {
  gtag("event", "optimization_error");
}

// ─── Download ───────────────────────────────────────────────────────────────

/**
 * Fired when the user downloads the optimized file.
 */
export function trackDownload(params: {
  format: "json" | "lottie"; // dotLottie
  optimizedSizeKb: number;
  compressionRatioPct: number;
}) {
  gtag("event", "optimized_file_download", {
    download_format: params.format,
    optimized_size_kb: Math.round(params.optimizedSizeKb),
    compression_ratio_pct: params.compressionRatioPct,
  });
}

// ─── Auth ────────────────────────────────────────────────────────────────────

/**
 * Fired when a user signs in.
 */
export function trackSignIn(method: "google" | "email") {
  gtag("event", "login", { method });
}

/**
 * Fired when a new account is created.
 */
export function trackSignUp(method: "google" | "email") {
  gtag("event", "sign_up", { method });
}
