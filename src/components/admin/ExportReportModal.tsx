"use client";

import React, { useState } from "react";
import {
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  FileText,
  FileCode,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  periods: {
    currentStart: number;
    currentEnd: number;
    priorStart: number;
    priorEnd: number;
    currentLabel: string;
    priorLabel: string;
  };
  metrics: {
    activeUsers: any;
    optimizations: any;
    optimizingUsers: any;
    downloads: any;
    paywallHits: any;
    upgradeClicks: any;
    automatedSales: any;
    funnel: {
      fileLoaded: number;
      optimizationComplete: number;
      downloads: number;
      paywallHits: number;
      upgradeClicks: number;
      automatedSales: number;
    };
  };
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
  totalUsersCount: number;
  totalProCount: number;
  insights: Array<{
    id: string;
    category: string;
    title: string;
    observation: string;
    possibleExplanation: string;
    recommendation: string;
  }>;
}

export function ExportReportModal({
  isOpen,
  onClose,
  periods,
  metrics,
  salesMetrics,
  shareCounts,
  totalUsersCount,
  totalProCount,
  insights,
}: ExportReportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const nowUTC = new Date().toISOString();

  // Helper to build the Markdown report
  const generateMarkdown = (): string => {
    return `# TinyLottie — Weekly Growth & Business Performance Brief
**Generated:** ${nowUTC} (UTC)
**Reporting Range:** Current: ${periods.currentLabel} vs Prior: ${periods.priorLabel}

---

## 1. Executive Summary & Verification Context
- **Product:** TinyLottie (https://tinylottie.com) — In-browser Lottie animation compressor
- **Pricing Model:** Free tier (up to 3 MB) · Lifetime PRO ($99 one-time for files up to 50 MB)
- **Total Registered Accounts:** ${totalUsersCount}
- **Total PRO Users:** ${totalProCount} (${salesMetrics.totalVerifiedSales} verified paying customers + ${salesMetrics.internalTests} founder/internal developer accounts)
- **Verified Sales Breakdown:**
  - Historical Manual Sales: ${salesMetrics.historicalManualSales}
  - Automated Sales (Lemon Squeezy): ${salesMetrics.automatedSales}
  - Complimentary / Promo Grants: ${salesMetrics.complimentaryGrants}
  - Unverified Origins: ${salesMetrics.unknownOrigins}

---

## 2. Weekly Comparative KPI Scorecard (UTC)
| Metric | Current 7d | Prior 7d | Change | Attribution & Scope |
| :--- | :---: | :---: | :---: | :--- |
| **Registered External Active Users** | ${metrics.activeUsers.current} | ${metrics.activeUsers.prior} | ${metrics.activeUsers.pctChange !== null ? metrics.activeUsers.pctChange + "%" : (metrics.activeUsers.diff >= 0 ? "+" : "") + metrics.activeUsers.diff + " users"} | Logged-in external accounts only (anonymous excluded) |
| **Successful Optimizations** | ${metrics.optimizations.current} | ${metrics.optimizations.prior} | ${metrics.optimizations.pctChange !== null ? metrics.optimizations.pctChange + "%" : (metrics.optimizations.diff >= 0 ? "+" : "") + metrics.optimizations.diff + " events"} | Registered + Anonymous sessions (Internal test excluded) |
| **Unique Optimizing Users** | ${metrics.optimizingUsers.current} | ${metrics.optimizingUsers.prior} | ${metrics.optimizingUsers.pctChange !== null ? metrics.optimizingUsers.pctChange + "%" : (metrics.optimizingUsers.diff >= 0 ? "+" : "") + metrics.optimizingUsers.diff + " users"} | Distinct logged-in accounts with >= 1 optimization |
| **Optimized File Downloads** | ${metrics.downloads.current} | ${metrics.downloads.prior} | ${metrics.downloads.pctChange !== null ? metrics.downloads.pctChange + "%" : (metrics.downloads.diff >= 0 ? "+" : "") + metrics.downloads.diff + " events"} | File delivery actions (Asset delivery only, not satisfaction) |
| **Paywall Hits (>3 MB limit)** | ${metrics.paywallHits.current} | ${metrics.paywallHits.prior} | ${metrics.paywallHits.pctChange !== null ? metrics.paywallHits.pctChange + "%" : (metrics.paywallHits.diff >= 0 ? "+" : "") + metrics.paywallHits.diff + " hits"} | Users encountering the 3 MB tier boundary |
| **Upgrade Clicks ($99 Lifetime)** | ${metrics.upgradeClicks.current} | ${metrics.upgradeClicks.prior} | ${metrics.upgradeClicks.pctChange !== null ? metrics.upgradeClicks.pctChange + "%" : (metrics.upgradeClicks.diff >= 0 ? "+" : "") + metrics.upgradeClicks.diff + " clicks"} | High-intent checkout initiation from modal |
| **Verified Automated Sales** | ${metrics.automatedSales.current} | ${metrics.automatedSales.prior} | ${metrics.automatedSales.pctChange !== null ? metrics.automatedSales.pctChange + "%" : (metrics.automatedSales.diff >= 0 ? "+" : "") + metrics.automatedSales.diff + " sales"} | Lemon Squeezy completed orders in current 7d window |

---

## 3. Product Activity Touchpoints (Current 7 Days — UTC)
> **Note:** The events below are unlinked telemetry volumes across separate touchpoints. They are not tied by a single attempt_id and do not form a strict user-level conversion funnel.

1. **Touchpoint 1 (Site Traffic):** Measured via Google Analytics 4 (GA4 Sessions).
2. **Touchpoint 2 (Files Loaded):** ${metrics.funnel.fileLoaded} events (\`file_loaded\` in \`analytics_events\`). Increments whenever an animation is selected or dropped into the workspace.
3. **Touchpoint 3 (Optimizations Completed):** ${metrics.funnel.optimizationComplete} events (\`optimization_complete\` in \`analytics_events\`). (Note: Exceeds loaded files when users re-compress with different format/slider settings on the same file. Compare with authenticated \`usage_logs\`: 22 records).
4. **Touchpoint 4 (File Retrieval / Downloads):** ${metrics.funnel.downloads} events (\`optimized_file_download\` in \`analytics_events\`).
5. **Touchpoint 5 (Paywall Hits & Upgrade Intent):** ${metrics.funnel.paywallHits} paywall hits · ${metrics.funnel.upgradeClicks} upgrade button clicks.
6. **Touchpoint 6 (Automated Revenue):** ${metrics.funnel.automatedSales} automated orders processed in period.

---

## 4. Organic Distribution & Share Result Actions (All-Time)
- **Total Share Actions Initiated:** ${shareCounts.totalInitiated}
  - PNG Social Cards Downloaded (1200×630): ${shareCounts.pngDownloaded}
  - Captions Copied to Clipboard: ${shareCounts.captionCopied}
  - Native Share Sheet Dialogs Opened: ${shareCounts.nativeShareCompleted}
  - Native Share Dialogs Cancelled: ${shareCounts.nativeShareCancelled}
- **Data Integrity Scope:** Identified internal developer/admin accounts excluded. Represents local export and share sheet triggers; does not confirm verified published social posts.

---

## 5. Automated Observations & Hypotheses
${insights
  .map(
    (ins, i) => `### 5.${i + 1}. [${ins.category}] ${ins.title}
- **🔍 Observation:** ${ins.observation}
- **💡 Hypothesis:** ${ins.possibleExplanation}
- **⚡ Recommended Action:** ${ins.recommendation}
`
  )
  .join("\n")}

---

## 6. AI Strategic Advisor Prompt
> **Instructions for the AI Assistant (ChatGPT / Claude / Gemini / Antigravity):**
>
> "You are an elite B2B SaaS growth engineer and startup advisor. Review the TinyLottie weekly executive brief above.
> Keep in mind that TinyLottie has 7 verified paying customer sales ($99 Lifetime PRO), 0 advertising budget, and relies strictly on organic search and word-of-mouth distribution.
>
> Please provide a concise, high-impact strategic critique:
> 1. **Bottleneck Diagnosis:** Where is the most critical drop-off occurring in the product touchpoints this week?
> 2. **Telemetry Interpretation:** How should the founder interpret the ${metrics.funnel.fileLoaded} files loaded vs ${metrics.funnel.optimizationComplete} optimizations vs ${metrics.funnel.downloads} downloads ratio?
> 3. **Monetization Assessment:** Considering paywall hits (${metrics.funnel.paywallHits}) vs upgrade clicks (${metrics.funnel.upgradeClicks}), what low-friction adjustments should be made to the $99 Lifetime PRO value proposition?
> 4. **Two Immediate Weekly Experiments:** Propose 2 specific, non-destructive growth/SEO/UX experiments for the founder to execute this week."
`;
  };

  const handleCopy = async () => {
    try {
      const text = generateMarkdown();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("AI-ready markdown brief copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const handleDownloadMarkdown = () => {
    const text = generateMarkdown();
    const dateStr = new Date().toISOString().split("T")[0];
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tinylottie-growth-brief-${dateStr}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded tinylottie-growth-brief-${dateStr}.md`);
  };

  const handleDownloadJson = () => {
    const payload = {
      generatedAt: nowUTC,
      periods,
      totalUsers: totalUsersCount,
      totalPro: totalProCount,
      salesMetrics,
      kpis: {
        registeredExternalActiveUsers: metrics.activeUsers,
        successfulOptimizations: metrics.optimizations,
        uniqueOptimizingUsers: metrics.optimizingUsers,
        downloads: metrics.downloads,
        paywallHits: metrics.paywallHits,
        upgradeClicks: metrics.upgradeClicks,
        automatedSales: metrics.automatedSales,
      },
      productTouchpoints: metrics.funnel,
      shareCounts,
      insights,
    };
    const dateStr = new Date().toISOString().split("T")[0];
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tinylottie-growth-data-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded tinylottie-growth-data-${dateStr}.json`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-[#00DDB3]/10 text-[#00DDB3]">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Export AI-Ready Brief
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Download or copy a pre-aggregated executive summary for ChatGPT / Claude / Gemini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Pills */}
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              Executive Snapshot Included
            </span>
            <span className="text-[11px] font-mono text-[#00DDB3] font-bold">
              Prompt-Ready Markdown
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800">
              <span className="text-[10px] text-gray-400 block font-medium">Verified Sales</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {salesMetrics.totalVerifiedSales} Total
              </span>
              <span className="text-[9px] text-gray-400 block mt-0.5">
                ({salesMetrics.internalTests} founder excluded)
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800">
              <span className="text-[10px] text-gray-400 block font-medium">Files Loaded</span>
              <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                {metrics.funnel.fileLoaded}
              </span>
              <span className="text-[9px] text-gray-400 block mt-0.5">7d UTC volume</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800">
              <span className="text-[10px] text-gray-400 block font-medium">Optimizations</span>
              <span className="text-base font-extrabold text-[#00DDB3]">
                {metrics.funnel.optimizationComplete}
              </span>
              <span className="text-[9px] text-gray-400 block mt-0.5">7d UTC volume</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800">
              <span className="text-[10px] text-gray-400 block font-medium">Downloads</span>
              <span className="text-base font-extrabold text-purple-600 dark:text-purple-400">
                {metrics.funnel.downloads}
              </span>
              <span className="text-[9px] text-gray-400 block mt-0.5">Asset delivery</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              Pre-aggregated: No raw file names, passwords, or personal PII are included in the export.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* 1. Copy to Clipboard (Primary Action) */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#00DDB3] hover:bg-[#00c5a0] text-gray-900 font-bold text-sm transition-all shadow-md active:scale-[0.99] cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-900" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-900" />
                <span>Copy AI Brief to Clipboard (Prompt Included)</span>
              </>
            )}
          </button>

          {/* 2. Download Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              <span>Download Markdown (.md)</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-500" />
              <span>Download Raw JSON (.json)</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-center text-gray-400">
          Tip: Paste this brief into Claude or ChatGPT and ask for weekly strategic growth advice.
        </p>
      </div>
    </div>
  );
}
