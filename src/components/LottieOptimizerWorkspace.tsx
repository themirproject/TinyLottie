"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Download, FileJson, Loader2, ArrowLeft, RefreshCw, Sparkles, CheckCircle2, Share2 } from "lucide-react";
import { LottiePreview } from "./LottiePreview";
import { OptimizationLoader } from "./OptimizationLoader";
import { OptimizationError } from "./OptimizationError";
import { ShareResultModal } from "./ShareResultModal";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { LottieData, formatFileSize } from "@/lib/hooks/useLottieOptimizer";

interface LottieOptimizerWorkspaceProps {
  lottieData: LottieData;
  isOptimizing: boolean;
  optimizationError: boolean;
  outputFormat: "json" | "lottie";
  currentTip?: string;
  onFormatChange: (fmt: "json" | "lottie") => void;
  onOptimize: () => void;
  onRetry: () => void;
  onDownload: () => void;
  onReset: () => void;
}

export function LottieOptimizerWorkspace({
  lottieData,
  isOptimizing,
  optimizationError,
  outputFormat,
  currentTip,
  onFormatChange,
  onOptimize,
  onRetry,
  onDownload,
  onReset,
}: LottieOptimizerWorkspaceProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const originalBytes = lottieData.file.size;
  const optimizedBytes = lottieData.optimizedData
    ? new Blob([JSON.stringify(lottieData.optimizedData)]).size
    : null;
  const savedBytes = optimizedBytes ? Math.max(0, originalBytes - optimizedBytes) : 0;
  const reductionPct = optimizedBytes
    ? Math.max(0, Math.round(((originalBytes - optimizedBytes) / originalBytes) * 100))
    : 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            {lottieData.optimizedData ? "Optimization Complete" : "Ready to Optimize"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {lottieData.optimizedData
              ? "Your animation has been compressed locally in memory."
              : "Review your animation settings and trigger the compression engine."}
          </p>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Start Over
        </button>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Preview Section - Side by Side */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left: Original Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 flex flex-col shadow-xs"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                Original Animation
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {formatFileSize(originalBytes)}
              </span>
            </div>

            <div className="bg-gray-50 dark:bg-gray-950/60 rounded-xl p-3 sm:p-4 aspect-square flex items-center justify-center mb-4 sm:mb-6 border border-gray-100 dark:border-gray-800">
              <LottiePreview animationData={lottieData.data} />
            </div>

            {/* File Info & Output Controls */}
            <div className="space-y-3 sm:space-y-4 mt-auto">
              <div className="flex items-start gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="p-2 bg-[#00DDB3]/10 rounded-lg">
                  <FileJson className="w-5 h-5 text-[#00DDB3]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {lottieData.file.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Source: {formatFileSize(originalBytes)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Output Format
                </label>
                <Select
                  value={outputFormat}
                  onValueChange={(val) => onFormatChange(val as "json" | "lottie")}
                  disabled={isOptimizing}
                >
                  <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 h-10 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">Lottie JSON (.json) — Universal</SelectItem>
                    <SelectItem value="lottie">dotLottie (.lottie) — Compact Archive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={onOptimize}
                disabled={isOptimizing}
                className={`w-full h-11 text-xs sm:text-sm font-bold transition-all ${
                  lottieData.optimizedData
                    ? "bg-transparent border-2 border-[#00DDB3] text-[#00DDB3] hover:bg-[#00DDB3]/10"
                    : "bg-[#00DDB3] hover:bg-[#00C9A7] text-white shadow-md shadow-[#00DDB3]/20"
                }`}
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Optimizing in browser...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {lottieData.optimizedData ? "Re-optimize" : "Compress Animation"}
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Right: Optimized Animation + Prominent Download */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 flex flex-col shadow-xs"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                Optimized Animation
              </h3>
              {optimizedBytes && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                  {formatFileSize(optimizedBytes)}
                </span>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-950/60 rounded-xl p-3 sm:p-4 aspect-square flex items-center justify-center mb-4 sm:mb-6 border border-gray-100 dark:border-gray-800">
              {isOptimizing ? (
                <OptimizationLoader />
              ) : optimizationError ? (
                <OptimizationError onRetry={onRetry} />
              ) : lottieData.optimizedData ? (
                <LottiePreview animationData={lottieData.optimizedData} />
              ) : (
                <div className="text-center text-gray-400 dark:text-gray-600 px-4">
                  <FileJson className="w-12 h-12 mx-auto mb-2 opacity-30 text-[#00DDB3]" />
                  <p className="text-xs sm:text-sm">
                    Click &ldquo;Compress Animation&rdquo; to preview optimized result
                  </p>
                </div>
              )}
            </div>

            {/* Results & Download CTA */}
            {lottieData.optimizedData ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 mt-auto"
              >
                {/* Metric Summary Card */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-950/60 border border-gray-200 dark:border-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400">Original</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{formatFileSize(originalBytes)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">Optimized</p>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatFileSize(optimizedBytes!)}</p>
                    </div>
                  </div>

                  {/* Progress / Reduction bar */}
                  <div className="relative h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden w-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${reductionPct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="absolute left-0 top-0 h-full bg-[#00DDB3] rounded-full"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Saved <strong>{formatFileSize(savedBytes)}</strong>
                    </span>
                    <span className="font-extrabold text-[#00DDB3] text-sm">
                      {reductionPct}% smaller
                    </span>
                  </div>
                </div>

                {/* Prominent Download Button */}
                <Button
                  onClick={onDownload}
                  className="w-full bg-[#00DDB3] hover:bg-[#00C9A7] text-white h-12 text-sm sm:text-base font-bold shadow-lg shadow-[#00DDB3]/25 cursor-pointer transform hover:scale-[1.01] transition-all"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download {outputFormat === "lottie" ? ".lottie" : ".json"} File
                </Button>

                {/* Secondary Action: Share Result */}
                {reductionPct > 0 ? (
                  <button
                    type="button"
                    onClick={() => setShowShareModal(true)}
                    className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-[#00DDB3]" />
                    Share Result
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-center text-xs text-gray-500 dark:text-gray-400">
                    Animation is already optimal (0% reduction). Original preserved.
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="mt-auto p-4 bg-gray-50 dark:bg-gray-950/60 rounded-xl text-center border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ready to optimize. Your animation will be processed 100% locally in your browser.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Share Result Modal */}
      <ShareResultModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        originalSizeBytes={originalBytes}
        optimizedSizeBytes={optimizedBytes || originalBytes}
        formatFileSize={formatFileSize}
        sourceRoute={typeof window !== "undefined" ? window.location.pathname : "/"}
      />
    </div>
  );
}
