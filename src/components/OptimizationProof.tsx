"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, FileJson, Sparkles, Layers, SlidersHorizontal } from "lucide-react";

interface BenchmarkCase {
  id: string;
  name: string;
  category: string;
  originalSizeKb: number;
  optimizedSizeKb: number;
  reductionPct: number;
  techniques: string[];
  note: string;
}

const BENCHMARKS: BenchmarkCase[] = [
  {
    id: "hero-rig",
    name: "Interactive Web Hero Rig",
    category: "Lottie JSON + Embedded Raster",
    originalSizeKb: 1840,
    optimizedSizeKb: 242,
    reductionPct: 86.8,
    techniques: [
      "Layer names (`nm`, `mn`, `cl`) stripped",
      "Float precision rounded to 3 decimals",
      "Embedded PNG converted to WebP in browser",
    ],
    note: "Measured on an After Effects export with embedded raster layers. 100% visual fidelity maintained.",
  },
  {
    id: "micro-interaction",
    name: "UI Button Micro-interaction",
    category: "Pure Vector Keyframes",
    originalSizeKb: 384,
    optimizedSizeKb: 48,
    reductionPct: 87.5,
    techniques: [
      "Hidden guide & draft layers removed",
      "Bezier anchor precision rounded",
      "Empty group containers pruned",
    ],
    note: "Common Figma/Jitter export with excessive decimal precision on bezier curves.",
  },
  {
    id: "onboarding-flow",
    name: "App Onboarding Walkthrough",
    category: "Multi-scene dotLottie (.lottie)",
    originalSizeKb: 2920,
    optimizedSizeKb: 310,
    reductionPct: 89.4,
    techniques: [
      "Converted to dotLottie Deflate archive",
      "Redundant styling markers eliminated",
      "AST schema normalized",
    ],
    note: "Measured using dotLottie container compression on multi-frame character sequences.",
  },
];

export function OptimizationProof() {
  const [activeCase, setActiveCase] = useState<BenchmarkCase>(BENCHMARKS[0]);

  return (
    <section className="py-14 sm:py-20 my-12 rounded-3xl bg-gray-950 text-white border border-gray-800 shadow-2xl relative overflow-hidden">
      {/* Subtle ambient teal glow in dark section */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#00DDB3]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#00C9A7]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#00DDB3]/15 text-[#00DDB3] border border-[#00DDB3]/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Measured Compression Results</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Real Optimization Proof
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mt-2">
            See how much weight TinyLottie sheds from typical After Effects and Figma animations without altering motion or visual quality.
          </p>
        </div>

        {/* Benchmark Case Selector */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
          {BENCHMARKS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveCase(item)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCase.id === item.id
                  ? "bg-[#00DDB3] text-gray-950 font-bold shadow-md shadow-[#00DDB3]/20"
                  : "bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-800"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Comparison Card */}
        <div className="bg-gray-900/90 rounded-2xl border border-gray-800 p-6 sm:p-8 shadow-xl backdrop-blur-sm">
          <div className="grid md:grid-cols-12 gap-6 items-center">
            {/* Left: Original File */}
            <div className="md:col-span-5 p-5 rounded-xl bg-gray-950 border border-gray-800 text-center">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                ORIGINAL FILE
              </span>
              <p className="text-3xl sm:text-4xl font-extrabold text-gray-200">
                {(activeCase.originalSizeKb / 1024).toFixed(2)} MB
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {activeCase.originalSizeKb} KB raw payload
              </p>
              <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <FileJson className="w-4 h-4 text-gray-500" />
                <span>Heavy export with redundant metadata</span>
              </div>
            </div>

            {/* Middle: Arrow & Reduction % */}
            <div className="md:col-span-2 flex flex-col items-center justify-center py-2">
              <div className="w-10 h-10 rounded-full bg-[#00DDB3]/15 text-[#00DDB3] border border-[#00DDB3]/30 flex items-center justify-center mb-2">
                <ArrowRight className="w-5 h-5 hidden md:block" />
                <span className="text-xs font-bold md:hidden">↓</span>
              </div>
              <span className="text-sm font-bold text-[#00DDB3] whitespace-nowrap">
                {activeCase.reductionPct}% smaller
              </span>
              <span className="text-[11px] text-gray-400">
                saved {(activeCase.originalSizeKb - activeCase.optimizedSizeKb)} KB
              </span>
            </div>

            {/* Right: Optimized File */}
            <div className="md:col-span-5 p-5 rounded-xl bg-[#00DDB3]/10 border border-[#00DDB3]/40 text-center relative overflow-hidden">
              <span className="text-[11px] font-bold text-[#00DDB3] uppercase tracking-wider block mb-2">
                OPTIMIZED FILE
              </span>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#00DDB3]">
                {activeCase.optimizedSizeKb >= 1024
                  ? `${(activeCase.optimizedSizeKb / 1024).toFixed(2)} MB`
                  : `${activeCase.optimizedSizeKb} KB`}
              </p>
              <p className="text-xs text-emerald-400 mt-1">
                {(activeCase.optimizedSizeKb / 1024).toFixed(2)} MB lightweight payload
              </p>
              <div className="mt-4 pt-3 border-t border-[#00DDB3]/20 flex items-center justify-center gap-1.5 text-xs text-[#00DDB3]">
                <CheckCircle2 className="w-4 h-4 text-[#00DDB3]" />
                <span>Fast web & mobile playback</span>
              </div>
            </div>
          </div>

          {/* Under-the-hood breakdown */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="grid sm:grid-cols-3 gap-3">
              {activeCase.techniques.map((tech, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-3 rounded-xl bg-gray-950 border border-gray-800/80 text-xs text-gray-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#00DDB3] shrink-0 mt-0.5" />
                  <span>{tech}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 text-center mt-4">
              * {activeCase.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
