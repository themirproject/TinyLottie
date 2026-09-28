"use client";

import React, { useMemo, useState } from "react";
import { ExportReportModal } from "@/components/admin/ExportReportModal";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  Download,
  AlertCircle,
  Receipt,
  ArrowRight,
  Clock,
  ArrowUpRight,
  HelpCircle,
  Info,
  Sparkles,
  Share2,
  FileJson,
  CheckCircle2,
  ExternalLink,
  UserCheck,
} from "lucide-react";
import { isInternalUser, ProOriginType } from "@/lib/config/internal-accounts";

export interface UsageLog {
  id: string;
  userId: string;
  fileName?: string;
  format?: string;
  originalSize: string;
  optimizedSize: string;
  compressionRatio: number;
  status?: string;
  timestamp: any;
}

export interface AnalyticsEventLog {
  id: string;
  event: string;
  timestamp: any;
  action?: string;
  userId?: string;
  [key: string]: any;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isPro: boolean;
  proOrigin?: ProOriginType;
  proOriginNotes?: string;
  proOriginVerifiedAt?: string;
  proOriginVerifiedBy?: string;
  lemonSqueezyOrderId?: string;
  createdAt: string;
  lastSignInTime: string;
}

interface GrowthInsightsViewProps {
  logs: UsageLog[];
  events: AnalyticsEventLog[];
  adminUsers: AdminUser[];
  salesMetrics: {
    totalVerifiedSales: number;
    historicalManualSales: number;
    automatedSales: number;
    complimentaryGrants: number;
    internalTests: number;
    unknownOrigins: number;
  };
  shareCounts: {
    pngDownloaded: number;
    captionCopied: number;
    nativeShareCompleted: number;
    nativeShareCancelled: number;
    totalInitiated: number;
  };
  loading?: boolean;
}

interface MetricComparison {
  current: number;
  prior: number;
  diff: number;
  pctChange: number | null;
  isLowSample: boolean;
  status: "increase" | "decrease" | "neutral";
}

function compareMetrics(
  current: number,
  prior: number,
  minSampleThreshold = 10
): MetricComparison {
  const diff = current - prior;
  const isLowSample =
    current < minSampleThreshold && prior < minSampleThreshold;

  if (prior === 0) {
    return {
      current,
      prior,
      diff,
      pctChange: null,
      isLowSample: true,
      status: current > 0 ? "increase" : "neutral",
    };
  }

  const pct = Math.round((diff / prior) * 100);
  return {
    current,
    prior,
    diff,
    pctChange: isLowSample ? null : pct,
    isLowSample,
    status: diff > 0 ? "increase" : diff < 0 ? "decrease" : "neutral",
  };
}

export function GrowthInsightsView({
  logs,
  events,
  adminUsers,
  salesMetrics,
  shareCounts,
  loading = false,
}: GrowthInsightsViewProps) {
  const [showExportModal, setShowExportModal] = useState(false);

  // ─── 1. Determine Consistent Reporting Periods (UTC) ────────────────────
  const periods = useMemo(() => {
    const now = new Date();
    // Complete UTC midnight boundary for strict daily comparisons
    const todayMidnightUTC = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0,
        0
      )
    );

    const currentPeriodStart = new Date(
      todayMidnightUTC.getTime() - 7 * 86400000
    );
    const currentPeriodEnd = todayMidnightUTC;

    const priorPeriodStart = new Date(
      todayMidnightUTC.getTime() - 14 * 86400000
    );
    const priorPeriodEnd = currentPeriodStart;

    const formatDate = (d: Date) =>
      d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });

    const currentLabel = `${formatDate(currentPeriodStart)} – ${formatDate(
      new Date(currentPeriodEnd.getTime() - 1)
    )} (UTC)`;
    const priorLabel = `${formatDate(priorPeriodStart)} – ${formatDate(
      new Date(priorPeriodEnd.getTime() - 1)
    )} (UTC)`;

    return {
      currentStart: currentPeriodStart.getTime(),
      currentEnd: currentPeriodEnd.getTime(),
      priorStart: priorPeriodStart.getTime(),
      priorEnd: priorPeriodEnd.getTime(),
      currentLabel,
      priorLabel,
    };
  }, []);

  // ─── 2. Calculate Weekly Metrics (Excluding Internal Test Accounts) ───────
  const metrics = useMemo(() => {
    const getTimestamp = (val: any): number => {
      if (!val) return 0;
      if (val.toDate && typeof val.toDate === "function") {
        return val.toDate().getTime();
      }
      return new Date(val).getTime() || 0;
    };

    // Helper: is non-internal user
    const isExternalUserId = (uid?: string): boolean => {
      if (!uid || uid === "unknown" || uid === "anonim") return false;
      return !isInternalUser(uid);
    };

    // Optimizations in periods
    let optCurrent = 0;
    let optPrior = 0;
    const optUsersCurrent = new Set<string>();
    const optUsersPrior = new Set<string>();

    logs.forEach((l) => {
      if (isInternalUser(l.userId)) return;
      const t = getTimestamp(l.timestamp);
      if (t >= periods.currentStart && t < periods.currentEnd) {
        optCurrent++;
        if (isExternalUserId(l.userId)) {
          optUsersCurrent.add(l.userId);
        }
      } else if (t >= periods.priorStart && t < periods.priorEnd) {
        optPrior++;
        if (isExternalUserId(l.userId)) {
          optUsersPrior.add(l.userId);
        }
      }
    });

    // Event counts in periods
    const eventCountsCurrent: Record<string, number> = {
      file_loaded: 0,
      optimization_complete: 0,
      optimized_file_download: 0,
      paywall_hit: 0,
      upgrade_click: 0,
      paywall_dismissed: 0,
    };
    const eventCountsPrior: Record<string, number> = {
      file_loaded: 0,
      optimization_complete: 0,
      optimized_file_download: 0,
      paywall_hit: 0,
      upgrade_click: 0,
      paywall_dismissed: 0,
    };

    events.forEach((e) => {
      if (e.userId && isInternalUser(e.userId)) return;
      const t = getTimestamp(e.timestamp);
      if (t >= periods.currentStart && t < periods.currentEnd) {
        if (e.event in eventCountsCurrent) {
          eventCountsCurrent[e.event]++;
        }
      } else if (t >= periods.priorStart && t < periods.priorEnd) {
        if (e.event in eventCountsPrior) {
          eventCountsPrior[e.event]++;
        }
      }
    });

    // Active external users in period (distinct logged-in accounts)
    const activeUsersCurrent = new Set<string>(optUsersCurrent);
    const activeUsersPrior = new Set<string>(optUsersPrior);

    adminUsers.forEach((u) => {
      if (isInternalUser(u.uid)) return;
      const t = new Date(u.createdAt || 0).getTime();
      if (t >= periods.currentStart && t < periods.currentEnd) {
        activeUsersCurrent.add(u.uid);
      } else if (t >= periods.priorStart && t < periods.priorEnd) {
        activeUsersPrior.add(u.uid);
      }
    });

    // Verified automated sales (Lemon Squeezy sales with creation/verification timestamp in period)
    let autoSalesCurrent = 0;
    let autoSalesPrior = 0;
    adminUsers.forEach((u) => {
      if (u.proOrigin !== "automated_sale") return;
      const t = new Date(
        u.proOriginVerifiedAt || u.createdAt || 0
      ).getTime();
      if (t >= periods.currentStart && t < periods.currentEnd) {
        autoSalesCurrent++;
      } else if (t >= periods.priorStart && t < periods.priorEnd) {
        autoSalesPrior++;
      }
    });

    // Successful optimizations: Prefer Firestore logs count or optimization_complete events
    const optimizationsCountCurrent = Math.max(
      optCurrent,
      eventCountsCurrent.optimization_complete
    );
    const optimizationsCountPrior = Math.max(
      optPrior,
      eventCountsPrior.optimization_complete
    );

    return {
      activeUsers: compareMetrics(
        activeUsersCurrent.size,
        activeUsersPrior.size
      ),
      optimizations: compareMetrics(
        optimizationsCountCurrent,
        optimizationsCountPrior
      ),
      optimizingUsers: compareMetrics(
        optUsersCurrent.size,
        optUsersPrior.size
      ),
      downloads: compareMetrics(
        eventCountsCurrent.optimized_file_download,
        eventCountsPrior.optimized_file_download
      ),
      paywallHits: compareMetrics(
        eventCountsCurrent.paywall_hit,
        eventCountsPrior.paywall_hit
      ),
      upgradeClicks: compareMetrics(
        eventCountsCurrent.upgrade_click,
        eventCountsPrior.upgrade_click
      ),
      automatedSales: compareMetrics(autoSalesCurrent, autoSalesPrior),
      funnel: {
        fileLoaded: eventCountsCurrent.file_loaded,
        optimizationComplete: optimizationsCountCurrent,
        downloads: eventCountsCurrent.optimized_file_download,
        paywallHits: eventCountsCurrent.paywall_hit,
        upgradeClicks: eventCountsCurrent.upgrade_click,
        automatedSales: autoSalesCurrent,
      },
    };
  }, [logs, events, adminUsers, periods]);

  // ─── 3. Generate Rule-Based Actionable Insights ───────────────────────────
  const actionableInsights = useMemo(() => {
    const list: Array<{
      id: string;
      category: string;
      title: string;
      observation: string;
      possibleExplanation: string;
      recommendation: string;
      tone: "teal" | "blue" | "amber" | "emerald";
      isLowSample: boolean;
    }> = [];

    const {
      optimizations,
      downloads,
      paywallHits,
      upgradeClicks,
      automatedSales,
      funnel,
    } = metrics;

    // Rule 1: Asset Retrieval Follow-Through (Strictly distinguishes retrieval from satisfaction)
    if (optimizations.current > 0) {
      list.push({
        id: "asset-retrieval-volume",
        category: "Workflow Completion",
        title: "Asset Retrieval Follow-Through",
        observation: `${downloads.current} download event(s) were recorded alongside ${optimizations.current} completed optimization(s) during this period.`,
        possibleExplanation:
          "Users complete the retrieval step to inspect or integrate the asset into their projects. Note: Downloading reflects asset delivery only, not confirmed visual satisfaction, quality acceptance, or post-download retention.",
        recommendation:
          "Evaluate qualitative satisfaction through community feedback, voluntary 1200×630 social shares, or direct customer interviews.",
        tone: downloads.current > 0 ? "emerald" : "amber",
        isLowSample: optimizations.isLowSample,
      });
    }

    // Rule 2: Optimization Volume Trend
    if (!optimizations.isLowSample && optimizations.pctChange !== null) {
      if (optimizations.pctChange > 0) {
        list.push({
          id: "opt-increase",
          category: "Usage Trend",
          title: "Increased Optimization Activity",
          observation: `Successful optimizations grew by ${optimizations.pctChange}% (${optimizations.prior} → ${optimizations.current}) week-over-week (UTC).`,
          possibleExplanation:
            "Increased tool activity observed across registered and anonymous sessions. Possible factors include returning visitors, direct referral traffic, or search impression fluctuations (requires Search Console verification).",
          recommendation:
            "Check Google Search Console impressions and queries for '/lottie-compressor' to verify whether organic search traffic drove this volume before concluding SEO growth.",
          tone: "teal",
          isLowSample: false,
        });
      } else if (optimizations.pctChange < 0) {
        list.push({
          id: "opt-decrease",
          category: "Usage Trend",
          title: "Softening Optimization Volume",
          observation: `Weekly optimizations contracted by ${Math.abs(
            optimizations.pctChange
          )}% (${optimizations.prior} → ${optimizations.current}) week-over-week (UTC).`,
          possibleExplanation:
            "Potential variation in search impression volume, seasonal demand, or tool drop-off.",
          recommendation:
            "Check Google Search Console impression trends and test the homepage upload area to ensure zero drag-and-drop friction.",
          tone: "amber",
          isLowSample: false,
        });
      }
    } else {
      list.push({
        id: "low-sample-volume",
        category: "Sample Size Context",
        title: "Early-Stage Activity Volume",
        observation: `${optimizations.current} successful optimizations were completed in the current 7-day UTC period (vs ${optimizations.prior} in the prior week).`,
        possibleExplanation:
          "With early organic traffic, weekly totals have naturally high percentage volatility.",
        recommendation:
          "Rely on directional trends rather than percentage shifts until sample sizes consistently exceed 25 optimizations/week.",
        tone: "blue",
        isLowSample: true,
      });
    }

    // Rule 3: Paywall & Monetization Intent
    if (paywallHits.current > 0 && upgradeClicks.current === 0) {
      list.push({
        id: "paywall-no-click",
        category: "Monetization Friction",
        title: "Paywall Viewed Without Upgrade Clicks",
        observation: `${paywallHits.current} paywall hit(s) occurred this week (UTC), but 0 users clicked the $99 Lifetime PRO upgrade button.`,
        possibleExplanation:
          "Users encountered the 3 MB limit without clicking upgrade. Possible factors include: immediate one-off compression needs where a workaround was chosen, hesitation regarding the pricing tier, or modal copy not sufficiently highlighting the 50 MB allowance and lifetime value.",
        recommendation:
          "Review the paywall modal presentation, ensure the 50 MB limit and lifetime value proposition are clear, and monitor whether hit volume increases before considering pricing changes.",
        tone: "amber",
        isLowSample: paywallHits.isLowSample,
      });
    } else if (upgradeClicks.current > 0 && automatedSales.current === 0) {
      list.push({
        id: "upgrade-click-no-sale",
        category: "Checkout Intent",
        title: "Upgrade Clicks Without Completed Sales",
        observation: `${upgradeClicks.current} user(s) clicked 'Upgrade to PRO', but no automated Lemon Squeezy sales were completed.`,
        possibleExplanation:
          "High intent at the modal level, but drop-off occurs on the Lemon Squeezy checkout page (e.g. currency conversion, payment method hesitation, or purchase reconsideration).",
        recommendation:
          "Perform a test purchase on Lemon Squeezy to verify checkout redirect and currency display integrity.",
        tone: "blue",
        isLowSample: upgradeClicks.isLowSample,
      });
    } else if (paywallHits.current === 0) {
      list.push({
        id: "no-paywall-hits",
        category: "Tier Boundaries",
        title: "Zero Paywall Friction Observed",
        observation: `0 paywall hits recorded during the 7-day UTC period.`,
        possibleExplanation:
          "Most uploaded animations are comfortably below the 3 MB Free limit.",
        recommendation:
          "Track median uploaded file size to determine whether feature-based PRO gating (e.g. batch compression or SVG export) will be more effective than size gating alone.",
        tone: "blue",
        isLowSample: true,
      });
    }

    // Rule 4: Organic Sharing & Word-of-Mouth
    if (shareCounts.totalInitiated > 0) {
      list.push({
        id: "sharing-activity",
        category: "Organic Distribution",
        title: "Share Result Modal Activity",
        observation: `${shareCounts.totalInitiated} local share/export action(s) recorded all-time (${shareCounts.pngDownloaded} PNGs downloaded, ${shareCounts.captionCopied} captions copied, ${shareCounts.nativeShareCompleted} native share sheets opened). Identified internal test accounts are excluded; unverified external shares cannot be confirmed as published social posts.`,
        possibleExplanation:
          "Users generated shareable assets or copied captions locally. These actions indicate local distribution intent, but do not confirm external posts were published or reached audiences.",
        recommendation:
          "Search social channels (LinkedIn, Twitter/X) for 'tinylottie.com' or compression cards to identify confirmed public social posts.",
        tone: "teal",
        isLowSample: shareCounts.totalInitiated < 10,
      });
    }

    return list;
  }, [metrics, shareCounts]);

  return (
    <div className="space-y-8">
      {/* ─── Header & Period Notice ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#00DDB3]/10 text-[#00DDB3]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Weekly Growth & Product Insights
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Automated comparative analysis for the founder · Last 7 complete days
            vs Preceding 7 days
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col sm:items-end text-xs">
            <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#00DDB3]" />
              <span>Current: {periods.currentLabel}</span>
            </div>
            <span className="text-[11px] text-gray-400 mt-0.5">
              Prior: {periods.priorLabel}
            </span>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00DDB3] hover:bg-[#00c5a0] text-gray-900 font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
            title="Export AI-Ready Brief (.md / Copy to Clipboard)"
          >
            <Sparkles className="w-3.5 h-3.5 text-gray-900" />
            <span>Export AI Brief</span>
          </button>
        </div>
      </div>

      {/* ─── Section 1: Weekly Comparison Cards ────────────────────────────── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              1. Weekly Overview (Last 7 Days vs Preceding 7 Days — UTC)
            </h3>
            <p className="text-[11px] text-gray-500">
              Comparative activity metrics with explicit sample size & attribution scope
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20">
              Registered external
            </span>
            <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold border border-teal-500/20">
              Anonymous / unattributed
            </span>
            <span className="px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-500 dark:text-gray-400 font-semibold border border-gray-500/20">
              Internal / test excluded
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Registered External Active Users */}
          <OverviewCard
            label="Registered External Active Users"
            current={metrics.activeUsers.current}
            prior={metrics.activeUsers.prior}
            pctChange={metrics.activeUsers.pctChange}
            isLowSample={metrics.activeUsers.isLowSample}
            icon={<Users className="w-4 h-4 text-blue-500" />}
            color="blue"
            subtext="Registered accounts only · Anonymous visitors excluded"
            tooltip="Distinct verified registered external accounts active in this period. (Anonymous optimization activity and GA4 visitors are separate)."
          />

          {/* Card 2: Successful Optimizations */}
          <OverviewCard
            label="Successful Optimizations"
            current={metrics.optimizations.current}
            prior={metrics.optimizations.prior}
            pctChange={metrics.optimizations.pctChange}
            isLowSample={metrics.optimizations.isLowSample}
            icon={<Zap className="w-4 h-4 text-[#00DDB3]" />}
            color="teal"
            subtext="Scope: Registered + Anonymous · Internal excluded"
            tooltip="Files successfully compressed in the 7-day period. (136 optimization_complete events in analytics_events; 22 logged in usage_logs for authenticated users). Internal test accounts excluded."
          />

          {/* Card 3: Unique Optimizing Users */}
          <OverviewCard
            label="Unique Optimizing Users"
            current={metrics.optimizingUsers.current}
            prior={metrics.optimizingUsers.prior}
            pctChange={metrics.optimizingUsers.pctChange}
            isLowSample={metrics.optimizingUsers.isLowSample}
            icon={<UserCheck className="w-4 h-4 text-indigo-500" />}
            color="indigo"
            subtext="Scope: Logged-in accounts only"
            tooltip="Distinct logged-in users who performed at least one optimization."
          />

          {/* Card 4: Optimized File Downloads */}
          <OverviewCard
            label="Optimized File Downloads"
            current={metrics.downloads.current}
            prior={metrics.downloads.prior}
            pctChange={metrics.downloads.pctChange}
            isLowSample={metrics.downloads.isLowSample}
            icon={<Download className="w-4 h-4 text-purple-500" />}
            color="purple"
            subtext="Scope: Asset delivery · Not confirmed satisfaction"
            tooltip="Users downloading their finished Lottie file after optimization. Reflects file retrieval, not confirmed visual satisfaction."
          />

          {/* Card 5: Paywall Hits */}
          <OverviewCard
            label="Paywall Hits"
            current={metrics.paywallHits.current}
            prior={metrics.paywallHits.prior}
            pctChange={metrics.paywallHits.pctChange}
            isLowSample={metrics.paywallHits.isLowSample}
            icon={<AlertCircle className="w-4 h-4 text-amber-500" />}
            color="amber"
            subtext="Scope: All sessions · Internal excluded"
            tooltip="Users uploading files exceeding the 3 MB Free tier limit."
          />

          {/* Card 6: Upgrade Clicks */}
          <OverviewCard
            label="Upgrade Clicks"
            current={metrics.upgradeClicks.current}
            prior={metrics.upgradeClicks.prior}
            pctChange={metrics.upgradeClicks.pctChange}
            isLowSample={metrics.upgradeClicks.isLowSample}
            icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
            color="emerald"
            subtext="Scope: All sessions · Internal excluded"
            tooltip="Clicks on 'Upgrade to PRO' ($99 lifetime) from the paywall modal."
          />

          {/* Card 7: Verified Automated Sales */}
          <OverviewCard
            label="Verified Automated Sales"
            current={metrics.automatedSales.current}
            prior={metrics.automatedSales.prior}
            pctChange={metrics.automatedSales.pctChange}
            isLowSample={metrics.automatedSales.isLowSample}
            icon={<Receipt className="w-4 h-4 text-emerald-600" />}
            color="emerald"
            subtext={`All-time: ${salesMetrics.totalVerifiedSales} sales (${salesMetrics.historicalManualSales} historical manual)`}
            tooltip="Automated customer orders verified via Lemon Squeezy during this period. Historical manual coupon sales are excluded from weekly revenue."
          />

          {/* Card 8: Share Intent Actions */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                  <Share2 className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  All-Time
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400" title="Voluntary user-initiated export actions from the Share Result modal. Does not represent confirmed published posts.">
                Share Result Actions
              </p>
              <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                {shareCounts.totalInitiated}
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800/60">
              <p className="text-[10px] text-gray-400">
                {shareCounts.pngDownloaded} PNG · {shareCounts.captionCopied} copy ·{" "}
                {shareCounts.nativeShareCompleted} share
              </p>
              <p className="text-[9px] text-gray-400/90 mt-0.5">
                Local exports · Internal excluded · Not confirmed published posts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Section 2: Product Activity — Event Counts ─────────────────── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 gap-2 mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              2. Product Activity — Event Counts (Current 7 Days — UTC)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Aggregate event volumes across product touchpoints · Unlinked telemetry (Events are not tied to single user attempts and do not form a sequential user funnel)
            </p>
          </div>

          <a
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#00DDB3] hover:underline inline-flex items-center gap-1 font-semibold"
          >
            Open GA4 Console <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Activity Touchpoints (Preserved cards and layout) */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2.5">
          {/* Touchpoint 1: Site Traffic */}
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Touchpoint 1
              </span>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                Site Traffic
              </p>
              <div className="mt-2 text-xs font-semibold text-gray-500">
                Not measurable in DB
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-3">
              Tracked in GA4 (Sessions)
            </p>
          </div>

          {/* Touchpoint 2: File Ingestion */}
          <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
                Touchpoint 2
              </span>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                Files Loaded
              </p>
              <div className="mt-2 text-xl font-extrabold text-blue-600 dark:text-blue-400">
                {metrics.funnel.fileLoaded}
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-mono mt-3">
              event: file_loaded
            </p>
          </div>

          {/* Touchpoint 3: Core Utility */}
          <div className="p-3.5 rounded-xl bg-[#00DDB3]/5 border border-[#00DDB3]/20 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#00DDB3] uppercase tracking-wider block mb-1">
                Touchpoint 3
              </span>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                Optimizations
              </p>
              <div className="mt-2">
                <span className="text-xl font-extrabold text-[#00DDB3]">
                  {metrics.funnel.optimizationComplete}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-mono mt-3">
              optimization_complete
            </p>
          </div>

          {/* Touchpoint 4: File Retrieval */}
          <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/30 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-1">
                Touchpoint 4
              </span>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                Downloads
              </p>
              <div className="mt-2">
                <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
                  {metrics.funnel.downloads}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-mono mt-3">
              optimized_file_download
            </p>
          </div>

          {/* Touchpoint 5: Paywall & Intent */}
          <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
                Touchpoint 5
              </span>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                Paywall & Clicks
              </p>
              <div className="mt-2 text-sm font-bold text-amber-600 dark:text-amber-400">
                {metrics.funnel.paywallHits} hits · {metrics.funnel.upgradeClicks} clicks
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-mono mt-3">
              paywall_hit / upgrade_click
            </p>
          </div>

          {/* Touchpoint 6: Revenue */}
          <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                Touchpoint 6
              </span>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                Verified Sales
              </p>
              <div className="mt-2 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {metrics.funnel.automatedSales}
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-3">
              Lemon Squeezy verified
            </p>
          </div>
        </div>

        {/* Metric Source & Attribution Documentation */}
        <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
            <Info className="w-4 h-4 text-[#00DDB3] shrink-0" />
            <span>Metric Documentation & Attribution Rules</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800">
              <p className="font-bold text-gray-900 dark:text-white text-[11px]">Files Loaded: {metrics.funnel.fileLoaded}</p>
              <p className="text-[10px] text-gray-500 mt-1">
                <strong>Source:</strong> <code className="font-mono">file_loaded</code> in <code className="font-mono">analytics_events</code>.
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                <strong>Scope:</strong> Current 7 complete UTC days. Increments when an animation is loaded into the tool. Internal test accounts excluded.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800">
              <p className="font-bold text-gray-900 dark:text-white text-[11px]">Optimizations: {metrics.funnel.optimizationComplete}</p>
              <p className="text-[10px] text-gray-500 mt-1">
                <strong>Source:</strong> <code className="font-mono">optimization_complete</code> in <code className="font-mono">analytics_events</code>.
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                <strong>Scope:</strong> Current 7 complete UTC days. Exceeds files loaded because users can re-compress the same file (e.g. format/slider adjustments). Compare with <code className="font-mono">usage_logs</code> (22 records for authenticated users only). Internal test accounts excluded.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800">
              <p className="font-bold text-gray-900 dark:text-white text-[11px]">Downloads: {metrics.funnel.downloads}</p>
              <p className="text-[10px] text-gray-500 mt-1">
                <strong>Source:</strong> <code className="font-mono">optimized_file_download</code> in <code className="font-mono">analytics_events</code>.
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                <strong>Scope:</strong> Current 7 complete UTC days. Measures file delivery actions only; does not infer confirmed user satisfaction or file acceptance. Internal test accounts excluded.
              </p>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 pt-1">
            <strong>Attribution Scope:</strong> Activity includes registered external users and anonymous / unattributed web visitors. Internal test accounts (identified by UID) are strictly excluded. Unattributed visitor volume must not be characterized as confirmed organic search growth.
          </p>
        </div>
      </div>

      {/* ─── Section 3: Actionable Insights ───────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            3. Actionable Insights & Hypotheses
          </h3>
          <span className="text-[11px] text-gray-400">
            Deterministic rule engine · Observations vs Explanations
          </span>
        </div>

        <div className="space-y-3">
          {actionableInsights.map((insight) => (
            <div
              key={insight.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {insight.category}
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {insight.title}
                  </h4>
                </div>

                {insight.isLowSample && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Low sample size — preliminary
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                {/* Observation */}
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gray-500 shrink-0 w-24">
                    🔍 Observation:
                  </span>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    {insight.observation}
                  </p>
                </div>

                {/* Explanation */}
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gray-500 shrink-0 w-24">
                    💡 Hypothesis:
                  </span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {insight.possibleExplanation}
                  </p>
                </div>

                {/* Recommendation */}
                <div className="flex items-start gap-2 pt-1 border-t border-gray-100 dark:border-gray-800/60 mt-2">
                  <span className="font-bold text-[#00DDB3] shrink-0 w-24">
                    ⚡ Next Action:
                  </span>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {insight.recommendation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Section 4: Suggested Next Check ──────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-1">
          4. Suggested Next Checks (Founder Weekly Audit — UTC)
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Key non-technical verification tasks to perform during your weekly review:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#00DDB3] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-900 dark:text-white">
                Google Search Console Review
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                Check `/lottie-compressor` impressions and queries in Search Console to verify organic indexing health.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#00DDB3] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-900 dark:text-white">
                GA4 Weekly Visitor Audit
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                Review total sessions and traffic channels in GA4 to confirm visitor volume before evaluating optimizer conversion.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#00DDB3] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-900 dark:text-white">
                Paywall Friction Check
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                If paywall hits occur with zero checkout clicks, test the $99 Lifetime value proposition clarity on mobile devices.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#00DDB3] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-900 dark:text-white">
                Social Sharing & Distribution
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                Search Twitter/X and LinkedIn for tinylottie.com links or shared 1200×630 cards to engage early organic promoters.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Export AI-Ready Brief Modal ──────────────────────────────────── */}
      <ExportReportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        periods={periods}
        metrics={metrics}
        salesMetrics={salesMetrics}
        shareCounts={shareCounts}
        totalUsersCount={adminUsers.length}
        totalProCount={adminUsers.filter((u) => u.isPro).length}
        insights={actionableInsights}
      />
    </div>
  );
}

// ─── Sub-Component: Metric Overview Card ─────────────────────────────────────
interface OverviewCardProps {
  label: string;
  current: number;
  prior: number;
  pctChange: number | null;
  isLowSample: boolean;
  icon: React.ReactNode;
  color: "teal" | "blue" | "indigo" | "purple" | "amber" | "emerald";
  subtext?: string;
  tooltip?: string;
}

function OverviewCard({
  label,
  current,
  prior,
  pctChange,
  isLowSample,
  icon,
  subtext,
  tooltip,
}: OverviewCardProps) {
  const diff = current - prior;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col justify-between shadow-xs">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
            {icon}
          </span>

          {pctChange !== null && !isLowSample ? (
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                pctChange >= 0
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {pctChange >= 0 ? "+" : ""}
              {pctChange}%
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
              {diff > 0 ? `+${diff} events` : diff < 0 ? `${diff} events` : "0 change"}
            </span>
          )}
        </div>

        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400" title={tooltip}>
          {label}
        </p>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-black text-gray-900 dark:text-white">
            {current.toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-400">
            prior: {prior.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800/60">
        {subtext ? (
          <p className="text-[10px] text-gray-400">{subtext}</p>
        ) : isLowSample ? (
          <p className="text-[10px] text-amber-500/90 font-medium">
            Sample &lt;10 · Directional
          </p>
        ) : (
          <p className="text-[10px] text-gray-400">
            {diff > 0
              ? `Increased by ${diff} this week`
              : diff < 0
              ? `Decreased by ${Math.abs(diff)} this week`
              : "Unchanged from prior week"}
          </p>
        )}
      </div>
    </div>
  );
}
