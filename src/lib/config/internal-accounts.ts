/**
 * Internal and Test Account Configuration
 * ----------------------------------------------------
 * Configurable list of explicit internal / developer test accounts.
 * Identified strictly by Firebase UID — NO personal email addresses
 * are exposed in the client-side bundle.
 */

export const INTERNAL_TEST_UIDS: readonly string[] = [
  "Py3GTwTWhLbY1bVHmVLtoqjYDdP2", // Primary admin/founder
  "HYgHmkE0OqOqrAZD2q6N2KZEA7m1", // Secondary admin/founder
  "LxepkaUwVff8aiLX4v5mM5mTsWr2", // Personal test account
  "6y1WOyj24aUm2zctIteijyFvtux2", // Sandbox / test order account
];

export const ADMIN_UIDS: readonly string[] = [
  "Py3GTwTWhLbY1bVHmVLtoqjYDdP2",
  "HYgHmkE0OqOqrAZD2q6N2KZEA7m1",
];

export type ActivitySegment = "all" | "external" | "internal";

export type UserActivityType = "external" | "internal" | "unknown";

export type ProOriginType =
  | "historical_manual_sale"  // Verified customer payment fulfilled manually (via coupon/transfer)
  | "automated_sale"          // Verified customer payment processed automatically (Lemon Squeezy)
  | "complimentary_grant"     // Promotional / courtesy / partner / free lifetime grant
  | "internal_test"           // Founder / developer / internal testing account
  | "unknown";                // Unverified historical origin (requires manual verification)

export const PRO_ORIGIN_CONFIG: Record<
  ProOriginType,
  { label: string; shortLabel: string; badgeColor: string; description: string; isSale: boolean }
> = {
  historical_manual_sale: {
    label: "Historical Manual Sale",
    shortLabel: "Manual Sale",
    badgeColor: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60",
    description: "Verified customer payment fulfilled via manually issued coupon",
    isSale: true,
  },
  automated_sale: {
    label: "Automated Sale",
    shortLabel: "Auto Sale",
    badgeColor: "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700/60",
    description: "Automated payment checkout processed via Lemon Squeezy",
    isSale: true,
  },
  complimentary_grant: {
    label: "Complimentary / Promo",
    shortLabel: "Promo",
    badgeColor: "bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700/60",
    description: "Promotional, courtesy, or partner access grant",
    isSale: false,
  },
  internal_test: {
    label: "Internal / Test",
    shortLabel: "Test",
    badgeColor: "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60",
    description: "Internal developer or founder test account",
    isSale: false,
  },
  unknown: {
    label: "Unknown Origin",
    shortLabel: "Unverified",
    badgeColor: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700",
    description: "Historical PRO entitlement requiring admin classification",
    isSale: false,
  },
};

/**
 * Checks whether a given Firebase UID belongs to an explicitly identified internal/test account.
 */
export function isInternalUser(userId?: string | null): boolean {
  if (!userId || userId === "unknown" || userId === "anonim") return false;
  return INTERNAL_TEST_UIDS.includes(userId);
}

/**
 * Classifies an activity record based on user ID:
 * - "internal": Explicitly in INTERNAL_TEST_UIDS list
 * - "external": Known user ID not in internal test list
 * - "unknown": Missing, unauthenticated, or anonymous
 */
export function classifyUserActivity(userId?: string | null): UserActivityType {
  if (!userId || userId === "unknown" || userId === "anonim") return "unknown";
  return INTERNAL_TEST_UIDS.includes(userId) ? "internal" : "external";
}

/**
 * Checks whether a given Firebase UID has admin privileges.
 */
export function isAdminUser(userId?: string | null): boolean {
  if (!userId) return false;
  return ADMIN_UIDS.includes(userId);
}
