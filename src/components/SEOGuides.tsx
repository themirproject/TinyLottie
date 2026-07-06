"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";

const platforms = [
  {
    slug: "webflow",
    label: "Webflow",
    emoji: "🌐",
    tagline: "Improve Core Web Vitals with smaller Lottie assets",
    color: "from-blue-500/20 to-indigo-500/20",
    border: "border-blue-500/30",
    accent: "#4F6EF7",
    steps: [
      {
        title: "Export from Bodymovin",
        body: "Export your AE animation as Lottie JSON via the Bodymovin plugin — uncheck 'Original Asset Names' to trim extra metadata before you even start.",
      },
      {
        title: "Compress with TinyLottie",
        body: "Drop the .json into TinyLottie. It strips layer names, hidden elements, and rounds float precision. Most Webflow Lottie files shrink 50–98%.",
      },
      {
        title: "Lazy-load in Webflow",
        body: "Set the 'Start Animation' trigger to 'Scroll into view' instead of 'Page load' — this defers parser work until the element is visible.",
      },
      {
        title: "Use dotLottie for custom code",
        body: "For Webflow custom code embeds, use the .lottie output from TinyLottie — 30–40% smaller than JSON and loads faster over the network.",
      },
    ],
  },
  {
    slug: "react-native",
    label: "React Native",
    emoji: "📱",
    tagline: "Cut JS thread parse time and memory on mobile",
    color: "from-cyan-500/20 to-teal-500/20",
    border: "border-cyan-500/30",
    accent: "#00B8D4",
    steps: [
      {
        title: "Why size matters more on mobile",
        body: "React Native re-parses the full JSON on every component mount. A 2MB file can add 150–300ms of CPU blocking on mid-range Android devices.",
      },
      {
        title: "Compress before bundling",
        body: "Run your .json through TinyLottie first. It removes nm/mn properties (only needed by design tools) and rounds floats — invisible to the renderer.",
      },
      {
        title: "Cache with useMemo",
        body: "Memoize your animation source with useMemo() or React.memo() to prevent redundant re-parsing across screen navigations.",
      },
      {
        title: "Use dotLottie format",
        body: "Switch to @lottiefiles/dotlottie-react-native. The .lottie binary format parses faster than JSON and is smaller to transfer over the network.",
      },
    ],
  },
  {
    slug: "after-effects",
    label: "After Effects",
    emoji: "🎬",
    tagline: "Strip Bodymovin bloat from AE exports",
    color: "from-violet-500/20 to-purple-500/20",
    border: "border-violet-500/30",
    accent: "#9B59F5",
    steps: [
      {
        title: "Disable unnecessary export options",
        body: "In Bodymovin, uncheck 'Original Asset Names' and 'Slot IDs'. Enable 'Glyph compression' for text layers. These tweaks alone cut 10–20% before optimization.",
      },
      {
        title: "Run through TinyLottie",
        body: "TinyLottie strips nm (layer name), mn (match name), cl (class), and hidden layer flags. For a typical 50-layer rig, this saves 15–35%.",
      },
      {
        title: "Float precision trimming",
        body: "AE stores keyframe values with 6–8 decimal places (e.g. 359.9999847). TinyLottie rounds to 3, identical visually but far smaller as a string.",
      },
      {
        title: "Embedded asset WebP conversion",
        body: "If your AE comp has raster layers (logos, backgrounds), TinyLottie converts base64 PNG/JPEG assets to WebP — 40–70% smaller.",
      },
    ],
  },
  {
    slug: "figma",
    label: "Figma",
    emoji: "🎨",
    tagline: "Fix Figma's path bloat before shipping",
    color: "from-pink-500/20 to-rose-500/20",
    border: "border-pink-500/30",
    accent: "#F25BA2",
    steps: [
      {
        title: "Flatten paths before export",
        body: "Figma stores bezier curves with many redundant anchors. Use Flatten Selection (Cmd+E) before running the LottieFiles or Jitter plugin to pre-simplify.",
      },
      {
        title: "Compress with TinyLottie",
        body: "The optimizer rounds all bezier coordinates to 3 decimal places and removes metadata. Figma exports typically see 45–75% reductions.",
      },
      {
        title: "Remove hidden/masked layers",
        body: "Figma plugins sometimes export masked layers that contribute to weight. TinyLottie removes all layers where hd: true automatically.",
      },
      {
        title: "Output as dotLottie",
        body: "For Figma exports with dense path data, the dotLottie output applies ZIP compression on top — achieving 80%+ total reduction from the original.",
      },
    ],
  },
  {
    slug: "nextjs",
    label: "Next.js",
    emoji: "⚡",
    tagline: "SSR-safe Lottie with optimal bundle impact",
    color: "from-gray-400/20 to-gray-600/20",
    border: "border-gray-400/30",
    accent: "#888",
    steps: [
      {
        title: "Always use dynamic import (ssr: false)",
        body: "Lottie libraries use Canvas and rAF — they can't run server-side. Import dynamically: const Lottie = dynamic(() => import('lottie-react'), { ssr: false }).",
      },
      {
        title: "Compress JSON with TinyLottie first",
        body: "Reducing a 500KB animation to 80KB means 420KB less JS parsed on every page load — directly improving your LCP and INP Core Web Vitals scores.",
      },
      {
        title: "Serve from /public, not your bundle",
        body: "Fetch from /public/animations/hero.json on the client instead of importing JSON directly. This splits animation data from your JS bundle and enables browser caching.",
      },
      {
        title: "Trigger with Intersection Observer",
        body: "Don't autoplay on mount. Start animation playback only when the element enters the viewport — improves perceived performance and saves CPU on initial load.",
      },
    ],
  },
];

export function SEOGuides() {
  const [active, setActive] = useState(0);
  const current = platforms[active];

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00DDB3]/10 border border-[#00DDB3]/20 text-[#00DDB3] text-xs font-semibold mb-4 tracking-wider uppercase">
            Platform Guides
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Lottie Optimization{" "}
            <span className="bg-gradient-to-r from-[#00DDB3] to-[#00C9A7] bg-clip-text text-transparent">
              for Every Platform
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
            Pick your platform. Get the exact steps.
          </p>
        </div>

        {/* Tab Row */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {platforms.map((p, i) => (
            <button
              key={p.slug}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                active === i
                  ? "bg-[#00DDB3] text-white border-[#00DDB3] shadow-lg shadow-[#00DDB3]/25"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-[#00DDB3]/50"
              }`}
            >
              <span>{p.emoji}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.slug}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className={`rounded-2xl border bg-gradient-to-br ${current.color} ${current.border} overflow-hidden`}
          >
            {/* Panel header */}
            <div className="px-6 py-5 border-b border-white/10 dark:border-gray-800/60">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{current.emoji}</span>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {current.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {current.tagline}
                  </p>
                </div>
              </div>
            </div>

            {/* Steps — horizontal on desktop, vertical on mobile */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/20 dark:bg-gray-800/30">
              {current.steps.map((step, i) => (
                <div
                  key={i}
                  className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm p-5 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: current.accent }}
                    >
                      {i + 1}
                    </span>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed pl-8">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA footer */}
            <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3 bg-white/40 dark:bg-gray-900/40">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                TinyLottie handles all the heavy lifting — just drag &amp; drop your file.
              </span>
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00DDB3] hover:gap-2.5 transition-all"
              >
                Try it free <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* SEO hidden text — Google indexes, not shown prominently to users */}
        <div className="sr-only">
          {platforms.map((p) => (
            <div key={p.slug}>
              <h3>{p.label} Lottie optimization guide</h3>
              {p.steps.map((s, i) => (
                <p key={i}>{s.title}: {s.body}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
