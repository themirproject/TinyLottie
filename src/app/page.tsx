"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { LottieDropZone } from "@/components/LottieDropZone";
import { FeatureCard } from "@/components/FeatureCard";
import { PricingModal } from "@/components/PricingModal";
import { ContactModal } from "@/components/ContactModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FAQ } from "@/components/FAQ";
import { BlogSection } from "@/components/BlogSection";
import { LiveResults } from "@/components/LiveResults";
import { SEOGuides } from "@/components/SEOGuides";
import { HowItWorks } from "@/components/HowItWorks";
import { OptimizationProof } from "@/components/OptimizationProof";
import { LottieOptimizerWorkspace } from "@/components/LottieOptimizerWorkspace";
import { useLottieOptimizer, formatFileSize } from "@/lib/hooks/useLottieOptimizer";
import { trackPaywallUpgradeClick } from "@/lib/analytics";
import { motion } from "motion/react";
import { SubtleBackgroundMotion } from "@/components/motion/SubtleBackgroundMotion";
import {
  Zap,
  Shield,
  Gauge,
  FileJson,
  Download,
  Layers,
  Check,
  X,
  Lock,
  Sparkles,
} from "lucide-react";

function AppContent() {
  const { user, isPro, openAuthModal } = useAuth();
  const [showContactModal, setShowContactModal] = useState(false);

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

  // Dynamic SVG Favicon
  useEffect(() => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
        <rect width="40" height="40" rx="8" fill="#00DDB3" />
        <g transform="translate(8, 8)" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </g>
      </svg>
    `;

    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = url;

    return () => URL.revokeObjectURL(url);
  }, []);

  // Verified & Implemented Features
  const features = [
    {
      icon: FileJson,
      variant: "ast" as const,
      title: "Lottie JSON AST Optimization",
      description:
        "Strips unnecessary editor metadata (`nm`, `mn`, `cl`), prunes hidden guide layers, and rounds float coordinates to 3 decimals without visual loss.",
    },
    {
      icon: Layers,
      variant: "dotlottie" as const,
      title: "dotLottie (.lottie) Support",
      description:
        "Convert bulky JSON files into compact, deflated dotLottie binary archives for 30–50% smaller bundle size and faster network transfer.",
    },
    {
      icon: Shield,
      variant: "privacy" as const,
      title: "100% In-Browser Privacy",
      description:
        "Your animations never touch an external server or cloud backend. Processing runs entirely in local browser memory with zero data retention.",
    },
    {
      icon: Zap,
      variant: "webp" as const,
      title: "WebP Asset Transcoding",
      description:
        "Automatically identifies embedded base64 PNG and JPEG bitmaps inside your animation and transcodes them to modern WebP via HTML5 canvas.",
    },
    {
      icon: Download,
      variant: "download" as const,
      title: "Instant Offline Download",
      description:
        "Download your compressed animation directly from memory with one click. No waiting queues, no processing timeouts, no sign-up required.",
    },
    {
      icon: Gauge,
      variant: "vitals" as const,
      title: "Core Web Vitals Boost",
      description:
        "Reduces main-thread JavaScript JSON parsing overhead and network payload, improving Largest Contentful Paint (LCP) and Interaction to Next Paint (INP).",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 relative">
      {/* Background Subtle Motion Glow & Tokens */}
      <SubtleBackgroundMotion />

      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleReset}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="p-2 bg-[#00DDB3] rounded-lg">
                <FileJson className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                TinyLottie
              </span>
            </motion.div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link
                href="/lottie-compressor"
                className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#00DDB3] transition-colors"
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
                Results
              </Link>
              <Link
                href="/#pricing"
                className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#00DDB3] transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/#faq"
                className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#00DDB3] transition-colors"
              >
                FAQ
              </Link>
            </nav>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
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
            </motion.div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative">
        {!lottieData ? (
          // Hero & Landing Page Section
          <div className="max-w-6xl mx-auto">
            {/* Hero Header */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6 sm:mb-8"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight tracking-tight text-gray-900 dark:text-white">
                Compress Lottie files.{" "}
                <span className="bg-gradient-to-r from-[#00DDB3] to-[#00C9A7] bg-clip-text text-transparent">
                  Keep the motion.
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Optimize Lottie JSON and dotLottie files directly in your browser. Reduce file size without uploading your animations to a server.
              </p>

              {/* Subtle Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-5 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#00DDB3]" />
                  Browser-based processing
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#00DDB3]" />
                  No file uploads to servers
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#00DDB3]" />
                  JSON & dotLottie support
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#00DDB3]" />
                  Free to start (up to 3 MB)
                </span>
              </div>
            </motion.div>

            {/* Limit Exceeded Notice if oversized file was dropped */}
            {rejectedFileNotice && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mb-6 overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/30 p-4 sm:p-5 shadow-xs"
              >
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
                        Upgrade to Lifetime PRO to process animations up to 50 MB with no limits.
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
              </motion.div>
            )}

            {/* Primary Action: Dropzone prominently above the fold on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-12 sm:mb-16"
            >
              <LottieDropZone onFileSelect={handleFileSelect} />
            </motion.div>

            {/* Phase 4: How It Works */}
            <HowItWorks />

            {/* Phase 3: Real Optimization Proof */}
            <OptimizationProof />

            {/* Phase 5: Audited Features Section */}
            <motion.div
              id="features"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-12 sm:mb-16 scroll-mt-20 pt-8"
            >
              <div className="text-center mb-8 sm:mb-12 px-4 max-w-2xl mx-auto">
                <span className="text-xs font-bold text-[#00DDB3] uppercase tracking-wider block mb-2">
                  Engine Architecture
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Designed for Production Performance
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
                  Transparent optimization benefits built directly on open web standards. No server intermediaries.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {features.map((feature, index) => (
                  <FeatureCard
                    key={index}
                    icon={feature.icon}
                    variant={feature.variant}
                    title={feature.title}
                    description={feature.description}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>

            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-950 text-white rounded-2xl p-6 sm:p-8 mb-12 sm:mb-16 border border-gray-800 shadow-xl"
            >
              <div className="text-center py-2">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#00DDB3] mb-1">
                  98%
                </div>
                <div className="text-xs sm:text-sm text-gray-400 font-medium">
                  Max Compression
                </div>
              </div>
              <div className="text-center py-2">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#00DDB3] mb-1">
                  100%
                </div>
                <div className="text-xs sm:text-sm text-gray-400 font-medium">
                  In-Browser Privacy
                </div>
              </div>
              <div className="text-center py-2">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#00DDB3] mb-1">
                  0 ms
                </div>
                <div className="text-xs sm:text-sm text-gray-400 font-medium">
                  Server Upload Time
                </div>
              </div>
              <div className="text-center py-2">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#00DDB3] mb-1">
                  Free
                </div>
                <div className="text-xs sm:text-sm text-gray-400 font-medium">
                  To Start (3 MB)
                </div>
              </div>
            </motion.div>

            {/* Live Results Stream */}
            <div id="results" className="scroll-mt-20">
              <LiveResults />
            </div>

            {/* Blog Section */}
            <div id="blog" className="scroll-mt-20">
              <BlogSection />
            </div>

            {/* Pricing Section */}
            <motion.div
              id="pricing"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-8 mb-12 sm:mb-16 max-w-5xl mx-auto scroll-mt-20"
            >
              <div className="text-center mb-8 sm:mb-10 px-4">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                  Simple, Transparent Pricing
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                  Start free with generous limits or unlock lifetime access for large animation files.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Free Plan */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Free Tier</h4>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Perfect for standard web & app animations
                    </p>
                    <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
                      $0{" "}
                      <span className="text-xs text-gray-400 font-normal">forever</span>
                    </div>

                    <ul className="space-y-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#00DDB3]" />
                        <span>Up to 3 MB file size</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#00DDB3]" />
                        <span>JSON & dotLottie export</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#00DDB3]" />
                        <span>100% in-browser offline processing</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#00DDB3]" />
                        <span>Unlimited optimizations</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full mt-8 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Start Optimizing Free
                  </button>
                </div>

                {/* Lifetime PRO Plan */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-[#00DDB3] p-6 sm:p-8 flex flex-col justify-between relative shadow-lg shadow-[#00DDB3]/5">
                  <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#00DDB3] text-white">
                    Lifetime Deal
                  </span>

                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">PRO Lifetime</h4>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
                      For animation studios, power users and large rigs
                    </p>
                    <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
                      $99{" "}
                      <span className="text-xs text-gray-400 font-normal">one-time payment</span>
                    </div>

                    <ul className="space-y-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#00DDB3]" />
                        <span><strong>Up to 50 MB</strong> file size limit</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#00DDB3]" />
                        <span>High-res embedded asset WebP conversion</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#00DDB3]" />
                        <span>Priority support & feature access</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#00DDB3]" />
                        <span>No recurring subscription fees</span>
                      </li>
                    </ul>
                  </div>

                  <a
                    href="https://tiny-lottie.lemonsqueezy.com/checkout/buy/c070366c-2fb4-41bf-ad9a-4af0cc94fab8"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackPaywallUpgradeClick("pricing_section")}
                    className="flex items-center justify-center w-full mt-8 py-3 bg-[#00DDB3] hover:bg-[#00C9A7] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#00DDB3]/20 transition-all transform hover:scale-[1.01] cursor-pointer"
                  >
                    Get Lifetime PRO — $99
                  </a>
                </div>
              </div>
            </motion.div>

            {/* SEO Guides Section */}
            <SEOGuides />

            {/* FAQ Section */}
            <div id="faq" className="scroll-mt-20">
              <FAQ onOpenContact={() => setShowContactModal(true)} />
            </div>
          </div>
        ) : (
          // Active Workspace when a file is loaded
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
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="p-1.5 bg-[#00DDB3] rounded-md">
                <FileJson className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                TinyLottie
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 px-4">
              All processing happens locally in your browser. Your files never leave your device.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <Link
                href="/lottie-compressor"
                className="hover:text-[#00DDB3] transition-colors"
              >
                Free Lottie Compressor
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
              <Link
                href="/privacy"
                className="hover:text-[#00DDB3] transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              © 2026 TinyLottie. Free offline Lottie JSON & dotLottie compressor.
            </p>
          </div>
        </div>
      </footer>

      {/* Existing Preserved Paywall Modal */}
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

export default function App() {
  return <AppContent />;
}