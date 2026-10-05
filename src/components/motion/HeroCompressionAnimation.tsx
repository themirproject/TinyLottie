"use client";

import { motion, useReducedMotion } from "motion/react";
import { Sparkles, Zap, ArrowRight, ShieldCheck, FileCode2 } from "lucide-react";

export function HeroCompressionAnimation() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-full max-w-4xl mx-auto my-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-gray-50/80 to-white/40 dark:from-gray-900/60 dark:to-gray-950/20 border border-gray-200/80 dark:border-gray-800/80 backdrop-blur-md overflow-hidden shadow-xs">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-32 bg-[#00DDB3]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Motion Stage */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-11 items-center gap-4 sm:gap-2">
        {/* Left: Complex / Bloated Lottie File */}
        <div className="md:col-span-4 flex flex-col items-center text-center p-4 rounded-xl bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="relative w-28 h-28 flex items-center justify-center mb-3">
            {/* Bloated Vector Wireframe */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full text-gray-400 dark:text-gray-500 overflow-visible"
            >
              {/* Outer noisy frame */}
              <motion.polygon
                points="50,8 90,28 85,82 45,95 10,75 15,25"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        rotate: [0, 6, -4, 0],
                        scale: [1, 1.04, 0.98, 1],
                      }
                }
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {/* Dense keyframe vertices */}
              <motion.path
                d="M 25 35 Q 50 15 75 35 T 60 75 Q 30 85 25 35"
                fill="none"
                stroke="oklch(0.65 0.18 20)"
                strokeWidth="2"
                strokeDasharray="4 2"
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        strokeDashoffset: [0, 40],
                      }
                }
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              {/* Bloated metadata tags */}
              <circle cx="25" cy="35" r="3.5" fill="#ef4444" opacity="0.8" />
              <circle cx="75" cy="35" r="3" fill="#f59e0b" opacity="0.8" />
              <circle cx="60" cy="75" r="3" fill="#ef4444" opacity="0.8" />
              <circle cx="50" cy="50" r="4" fill="#6366f1" opacity="0.8" />
            </svg>

            {/* Float badge */}
            <span className="absolute -bottom-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              Raw AST: 2.8 MB
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <FileCode2 className="w-3.5 h-3.5 text-gray-400" />
            <span>Unoptimized Lottie</span>
          </div>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
            Heavy decimals · Extra metadata
          </span>
        </div>

        {/* Center: The Compression Funnel / Engine */}
        <div className="md:col-span-3 flex flex-col items-center justify-center py-2 px-2">
          {/* Animated Flow Track */}
          <div className="relative w-full flex items-center justify-center">
            {/* Horizontal Line with pulse */}
            <div className="w-full h-1 bg-gradient-to-r from-gray-200 via-[#00DDB3] to-gray-200 dark:from-gray-800 dark:via-[#00DDB3] dark:to-gray-800 rounded-full relative overflow-hidden">
              <motion.div
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#00DDB3] to-transparent"
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        x: ["-100%", "300%"],
                      }
                }
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Central Engine Lens */}
            <motion.div
              className="absolute w-11 h-11 rounded-2xl bg-[#00DDB3] text-white flex items-center justify-center shadow-md shadow-[#00DDB3]/30 z-10"
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      scale: [1, 1.08, 1],
                      boxShadow: [
                        "0 0 0 0 rgba(0,221,179,0.4)",
                        "0 0 0 8px rgba(0,221,179,0)",
                        "0 0 0 0 rgba(0,221,179,0)",
                      ],
                    }
              }
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Zap className="w-5 h-5 fill-white text-white" />
            </motion.div>
          </div>

          {/* Label under the engine */}
          <div className="mt-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00DDB3]/10 text-[#00DDB3] text-[11px] font-bold">
            <Sparkles className="w-3 h-3" />
            <span>TinyLottie Engine</span>
          </div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
            Browser AST Pruning
          </span>
        </div>

        {/* Right: Optimized, Streamlined Clean Vector */}
        <div className="md:col-span-4 flex flex-col items-center text-center p-4 rounded-xl bg-white/90 dark:bg-gray-900/90 border border-[#00DDB3]/40 shadow-xs relative overflow-hidden">
          {/* Subtle success corner accent */}
          <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-[#00DDB3]/20 to-transparent pointer-events-none" />

          <div className="relative w-28 h-28 flex items-center justify-center mb-3">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full text-[#00DDB3] overflow-visible"
            >
              {/* Clean geometric circle outline */}
              <circle
                cx="50"
                cy="50"
                r="36"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeOpacity="0.25"
              />

              {/* Smooth morphing vector shape */}
              <motion.path
                d="M 50 20 C 68 20 80 32 80 50 C 80 68 68 80 50 80 C 32 80 20 68 20 50 C 20 32 32 20 50 20 Z"
                fill="currentColor"
                fillOpacity="0.12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        d: [
                          "M 50 20 C 68 20 80 32 80 50 C 80 68 68 80 50 80 C 32 80 20 68 20 50 C 20 32 32 20 50 20 Z",
                          "M 50 24 C 64 22 76 36 76 50 C 76 64 64 76 50 76 C 36 76 24 64 24 50 C 24 36 36 26 50 24 Z",
                          "M 50 20 C 68 20 80 32 80 50 C 80 68 68 80 50 80 C 32 80 20 68 20 50 C 20 32 32 20 50 20 Z",
                        ],
                      }
                }
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Center crisp playhead */}
              <circle cx="50" cy="50" r="4.5" fill="currentColor" />
            </svg>

            {/* Float badge */}
            <span className="absolute -bottom-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00DDB3]/15 text-[#00DDB3] border border-[#00DDB3]/30">
              Clean: 142 KB (-95%)
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 dark:text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00DDB3]" />
            <span>Production Ready</span>
          </div>
          <span className="text-[11px] text-[#00DDB3] font-medium mt-0.5">
            Same visual fidelity · 60 FPS
          </span>
        </div>
      </div>
    </div>
  );
}
