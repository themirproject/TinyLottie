"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { LottieDropZone } from "@/components/LottieDropZone";
import { PricingModal } from "@/components/PricingModal";
import { ContactModal } from "@/components/ContactModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LottieOptimizerWorkspace } from "@/components/LottieOptimizerWorkspace";
import { useLottieOptimizer, formatFileSize } from "@/lib/hooks/useLottieOptimizer";
import { motion } from "motion/react";
import {
  FileJson,
  Shield,
  Layers,
  Sparkles,
  Zap,
  Check,
  ChevronDown,
  ArrowRight,
  Download,
  Gauge,
  Code2,
  Lock,
  X,
  HelpCircle,
} from "lucide-react";

export function LottieCompressorClient() {
  const { user, isPro, openAuthModal } = useAuth();
  const [showContactModal, setShowContactModal] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const {
    lottieData,
    isOptimizing,
    optimizationError,
    outputFormat,
    setOutputFormat,
    showPricingModal,
    setShowPricingModal,
    largeFileSize,
    rejectedFileNotice,
    setRejectedFileNotice,
    currentTip,
    handleFileSelect,
    handleOptimize,
    handleRetryOptimization,
    handleDownload,
    handleReset,
  } = useLottieOptimizer();

  const faqs = [
    {
      q: "Does TinyLottie degrade the animation visual quality or frame rate?",
      a: "No. TinyLottie uses lossless and perceptual compression. It strips non-visual editor metadata (such as layer names, match names, and hidden design layers) and optimizes float coordinate precision from 6+ decimals down to 3. The vectors, timing, easing curves, and framerate remain 100% identical upon playback.",
    },
    {
      q: "What is the difference between Lottie JSON and dotLottie (.lottie)?",
      a: "Lottie JSON is an uncompressed ASCII text format containing raw vector coordinates and keyframe trees. dotLottie (.lottie) is an open container format that archives and compresses the JSON and any associated assets using Deflate compression, resulting in 30% to 50% smaller transfer sizes over the network.",
    },
    {
      q: "How does in-browser compression protect my animation assets?",
      a: "Unlike traditional online file converters that upload your files to a cloud server, TinyLottie executes its parser and image codecs entirely inside your browser's local JavaScript memory using Web Workers and HTML5 Canvas. Your animation data never leaves your computer.",
    },
    {
      q: "What files can I compress?",
      a: "You can compress any standard Lottie JSON file (.json) or dotLottie archive (.lottie) exported from After Effects (Bodymovin), LottieLab, Figma, or Jitter. Free accounts can compress files up to 3 MB; PRO accounts can compress files up to 50 MB.",
    },
    {
      q: "Why do some animations compress more than others?",
      a: "Animations with high vertex counts, redundant shape groupings, or unoptimized embedded PNG/JPEG base64 bitmaps typically see massive 70%–98% size reductions. Animations that have already been pre-simplified in code or exported with minimal settings will naturally have less bloat to strip.",
    },
    {
      q: "How can I verify the file size reduction?",
      a: "You can compare the file sizes on your local disk or inspect network transfer sizes using Chrome or Safari Developer Tools (Network tab). You will see reduced byte transfer and significantly faster DOM parsing times.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 relative">
      {/* Background Gradient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00DDB3]/10 dark:bg-[#00DDB3]/5 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-[#00C9A7]/10 dark:bg-[#00C9A7]/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="p-2 bg-[#00DDB3] rounded-lg">
                <FileJson className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                TinyLottie
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link
                href="/lottie-compressor"
                className="text-sm font-semibold text-[#00DDB3]"
              >
                Lottie Compressor
              </Link>
              <Link
                href="/#features"
                className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#00DDB3] transition-colors"
              >
                Features
              </Link>
              <Link
                href="/#results"
                className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#00DDB3] transition-colors"
              >
                Benchmarks
              </Link>
              <Link
                href="/#pricing"
                className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#00DDB3] transition-colors"
              >
                Pricing
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-all"
                >
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`}
                    alt="Avatar"
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="hidden sm:inline">Profile</span>
                  {isPro && (
                    <span className="text-[10px] font-bold bg-[#00DDB3] text-white px-1.5 py-0.5 rounded ml-1">
                      PRO
                    </span>
                  )}
                </Link>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => openAuthModal("signin")}
                    className="px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => openAuthModal("signup")}
                    className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                  >
                    Get Started
                  </button>
                </div>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative">
        {!lottieData ? (
          <div className="max-w-5xl mx-auto">
            {/* Page Header matching search intent "lottie compressor" */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#00DDB3]/10 text-[#00DDB3] mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero Server Uploads · 100% In-Browser Compression</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
                Free Lottie Compressor
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Compress Lottie JSON and dotLottie animations directly in your browser. Reduce file size up to 98%, preview results and download optimized files.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#00DDB3]" /> Offline Privacy
                </span>
                <span className="inline-flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#00DDB3]" /> .json & .lottie
                </span>
                <span className="inline-flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-[#00DDB3]" /> Fast Web Vitals
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#00DDB3]" /> Free up to 3 MB
                </span>
              </div>
            </div>

            {/* Oversized notice if needed */}
            {rejectedFileNotice && (
              <div className="relative mb-6 overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                        File exceeds 3 MB Free limit ({formatFileSize(rejectedFileNotice.fileSize)})
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                        Upgrade to Lifetime PRO to process animations up to 50 MB with no restrictions.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPricingModal(true)}
                      className="px-4 py-2 bg-[#00DDB3] hover:bg-[#00C9A7] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      View Lifetime PRO — $99
                    </button>
                    <button
                      onClick={() => setRejectedFileNotice(null)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Compressor Uploader (Prominent & Functional) */}
            <div className="mb-14">
              <LottieDropZone onFileSelect={handleFileSelect} />
            </div>

            {/* Technical Guide Section 1: How to Compress a Lottie File */}
            <section className="mb-14 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="max-w-3xl mb-8">
                <span className="text-xs font-bold text-[#00DDB3] uppercase tracking-wider block mb-1">
                  Step-by-Step Guide
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  How to Compress a Lottie File
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
                  Follow this straightforward workflow to trim excess payload from your animation exports:
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <div className="w-8 h-8 rounded-lg bg-[#00DDB3]/15 text-[#00DDB3] font-bold text-sm flex items-center justify-center mb-3">
                    1
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
                    Export from Your Design Tool
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Export your composition as Lottie JSON from Adobe After Effects via Bodymovin, Figma (LottieFiles plugin), or LottieLab.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <div className="w-8 h-8 rounded-lg bg-[#00DDB3]/15 text-[#00DDB3] font-bold text-sm flex items-center justify-center mb-3">
                    2
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
                    Drop Into TinyLottie
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Drag and drop the exported <code className="text-[#00DDB3]">.json</code> or <code className="text-[#00DDB3]">.lottie</code> file above. The parser validates the AST tree locally in your browser.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <div className="w-8 h-8 rounded-lg bg-[#00DDB3]/15 text-[#00DDB3] font-bold text-sm flex items-center justify-center mb-3">
                    3
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
                    Preview & Download
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Review the side-by-side playback preview, select your desired export format (JSON or dotLottie), and click Download.
                  </p>
                </div>
              </div>
            </section>

            {/* Technical Section 2: Supported Formats */}
            <section className="mb-14 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="max-w-3xl mb-8">
                <span className="text-xs font-bold text-[#00DDB3] uppercase tracking-wider block mb-1">
                  Format Specifications
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Supported Lottie Formats
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
                  TinyLottie provides cross-format optimization and conversion between standard Lottie architectures:
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileJson className="w-5 h-5 text-[#00DDB3]" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Lottie JSON (.json)
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    The universal standard for web, iOS, Android, and Webflow. TinyLottie removes redundant JSON keys, trims decimal places, and strips developer layer metadata while preserving full playback compatibility.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1.5 pt-2">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#00DDB3]" />
                      Compatible with lottie-web, react-lottie, and mobile SDKs
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#00DDB3]" />
                      Standard UTF-8 JSON text representation
                    </li>
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#00DDB3]" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      dotLottie (.lottie)
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    A modern open-source container format that packages animation JSON, state machines, and raster assets into a compressed Deflate archive. Delivers up to 50% smaller sizes than standalone JSON files.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1.5 pt-2">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#00DDB3]" />
                      Deflate binary compression with manifest indexing
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#00DDB3]" />
                      Fast network streaming and reduced memory footprint
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Technical Section 3: What Optimization Changes Under the Hood */}
            <section className="mb-14 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="max-w-3xl mb-8">
                <span className="text-xs font-bold text-[#00DDB3] uppercase tracking-wider block mb-1">
                  Engine Architecture
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  What Optimization Changes Under the Hood
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
                  TinyLottie applies deterministic AST parsing algorithms designed to safely strip non-essential byte weight:
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                    <Code2 className="w-4 h-4 text-[#00DDB3]" />
                    1. Editor Metadata & Non-Visual Node Pruning
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Bodymovin and After Effects export internal layer names (<code className="text-[#00DDB3]">nm</code>), match names (<code className="text-[#00DDB3]">mn</code>), and class names (<code className="text-[#00DDB3]">cl</code>) for every layer and shape group. TinyLottie strips these strings completely because the Lottie web/mobile runtimes do not use them to draw frames.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                    <Gauge className="w-4 h-4 text-[#00DDB3]" />
                    2. Coordinate & Float Precision Truncation
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Graphic software often stores bezier control points and transform matrix values with 6 to 8 floating-point decimal places (e.g. <code className="text-gray-500">241.98471203</code>). TinyLottie rounds float coordinates to 3 decimals, which is visually imperceptible to human eyes but dramatically reduces character counts across thousands of keyframes.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-[#00DDB3]" />
                    3. In-Browser WebP Raster Transcoding
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    When animations contain embedded raster assets (such as logos, photo textures, or raster gradients encoded in base64 PNG/JPEG), TinyLottie passes them through an in-memory HTML5 Canvas pipeline, converting them to high-density WebP format—cutting asset payload by 50% to 70%.
                  </p>
                </div>
              </div>
            </section>

            {/* Technical Section 4: Why Results Vary & Verification */}
            <section className="mb-14 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <span className="text-xs font-bold text-[#00DDB3] uppercase tracking-wider block mb-1">
                    Performance Insight
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
                    Why Do Compression Results Vary?
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    The exact reduction percentage depends heavily on the structure of the input animation:
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-[#00DDB3] shrink-0 mt-0.5" />
                      <span><strong>High Keyframe Density:</strong> Animations with baked per-frame positions or expressions see the highest reduction from decimal truncation.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-[#00DDB3] shrink-0 mt-0.5" />
                      <span><strong>Embedded Bitmaps:</strong> Files with uncompressed base64 PNGs benefit heavily from WebP transcoding.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-[#00DDB3] shrink-0 mt-0.5" />
                      <span><strong>Minimal Vector Rigs:</strong> Hand-crafted animations with few layers already have small footprints, resulting in moderate percentage gains.</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <span className="text-xs font-bold text-[#00DDB3] uppercase tracking-wider block mb-1">
                    Verification
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
                    How to Verify Your Gains
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    You can easily verify the performance advantages of your compressed Lottie files:
                  </p>
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      <strong>Chrome DevTools:</strong> Open the Network tab and observe transfer size and response times when loading the compressed file.
                    </div>
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      <strong>Core Web Vitals:</strong> Measure Largest Contentful Paint (LCP) and Total Blocking Time (TBT) in Lighthouse or PageSpeed Insights.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Technical Section 5: Zero-Server Privacy Guarantee */}
            <section className="mb-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#00DDB3]/5 to-transparent border border-[#00DDB3]/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#00DDB3]/15 text-[#00DDB3] flex items-center justify-center shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    100% In-Browser Privacy Guarantee
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    Your confidential animations and unreleased product UI never leave your computer.
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Many online file compression tools upload customer files to remote cloud storage or third-party servers. TinyLottie operates strictly inside your browser environment. All JSON parsing, float rounding, and WebP encoding happen directly in your browser tab&apos;s memory.
              </p>
            </section>

            {/* Dedicated Lottie Compressor FAQ */}
            <section className="mb-16 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="max-w-3xl mb-8">
                <span className="text-xs font-bold text-[#00DDB3] uppercase tracking-wider block mb-1">
                  Got Questions?
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
                  Everything you need to know about compressing Lottie animations with TinyLottie:
                </p>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 transition-colors"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-gray-900 dark:text-white hover:text-[#00DDB3] transition-colors"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 transition-transform ${
                            isOpen ? "rotate-180 text-[#00DDB3]" : "text-gray-400"
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        ) : (
          /* Active Workspace when file is loaded */
          <LottieOptimizerWorkspace
            lottieData={lottieData}
            isOptimizing={isOptimizing}
            optimizationError={optimizationError}
            outputFormat={outputFormat}
            currentTip={currentTip}
            onFormatChange={setOutputFormat}
            onOptimize={handleOptimize}
            onRetry={handleRetryOptimization}
            onDownload={handleDownload}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 py-8 sm:py-12 mt-12 sm:mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="p-1.5 bg-[#00DDB3] rounded-md">
                <FileJson className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                TinyLottie
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 px-4">
              Free in-browser Lottie JSON & dotLottie compressor. Zero file uploads.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <Link href="/" className="hover:text-[#00DDB3] transition-colors">
                Home
              </Link>
              <span className="text-gray-300 dark:text-gray-700">·</span>
              <button
                type="button"
                onClick={() => setShowContactModal(true)}
                className="hover:text-[#00DDB3] transition-colors cursor-pointer"
              >
                Support
              </button>
              <span className="text-gray-300 dark:text-gray-700">·</span>
              <Link href="/privacy" className="hover:text-[#00DDB3] transition-colors">
                Privacy Policy
              </Link>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              © 2026 TinyLottie. Built for developers, designers, and web performance engineers.
            </p>
          </div>
        </div>
      </footer>

      {/* Preserved Paywall Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        fileSize={largeFileSize}
      />

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
}
