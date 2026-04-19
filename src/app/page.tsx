"use client";
import { useState, useEffect } from "react";
import { zipSync, strToU8 } from 'fflate';
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { LottieDropZone } from "@/components/LottieDropZone";
import { LottiePreview } from "@/components/LottiePreview";
import { OptimizationPanel } from "@/components/OptimizationPanel";
import { FeatureCard } from "@/components/FeatureCard";
import { PricingModal } from "@/components/PricingModal";
import { HeroVisual } from "@/components/HeroVisual";
import { OptimizationLoader } from "@/components/OptimizationLoader";
import { OptimizationError } from "@/components/OptimizationError";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FAQ } from "@/components/FAQ";
import { BlogSection } from "@/components/BlogSection";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  Shield,
  Gauge,
  FileJson,
  Download,
  Layers,
  Loader2,
  Heart,
} from "lucide-react";

interface LottieData {
  file: File;
  data: any;
  optimizedData: any | null;
}

function AppContent() {
  const { user, isPro, loginWithGoogle } = useAuth();
  const [lottieData, setLottieData] =
    useState<LottieData | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationError, setOptimizationError] =
    useState(false);
  const [outputFormat, setOutputFormat] = useState<
    "json" | "lottie"
  >("json");
  const [showPricingModal, setShowPricingModal] =
    useState(false);
  const [largeFileSize, setLargeFileSize] = useState(0);

  const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB in bytes

  // Set dynamic favicon
  useEffect(() => {

    // Create SVG favicon with FileJson icon using a 40x40 viewBox 
    // to simulate p-2 (8px padding) and rounded-lg (8px border radius)
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

    let link = document.querySelector(
      'link[rel="icon"]',
    ) as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = url;

    return () => URL.revokeObjectURL(url);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Math.round((bytes / Math.pow(k, i)) * 100) / 100 +
      " " +
      sizes[i]
    );
  };

  const handleFileSelect = async (file: File) => {
    // Check file size limit and enforce PRO bounds
    if (file.size > FILE_SIZE_LIMIT && !isPro) {
      setLargeFileSize(file.size);
      setShowPricingModal(true);
      toast.error(
        `File size exceeds 5MB limit. Upgrade to Pro for unlimited file sizes.`,
      );
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      setLottieData({
        file,
        data,
        optimizedData: null,
      });
      toast.success("Lottie file loaded successfully!");
    } catch (error) {
      toast.error(
        "Failed to parse Lottie file. Please ensure it's a valid JSON.",
      );
    }
  };

  const optimizeLottie = (data: any): any => {
    // Create a deep copy
    const optimized = JSON.parse(JSON.stringify(data));

    // Remove unnecessary properties
    const removeUnusedProps = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(removeUnusedProps);
      } else if (obj && typeof obj === "object") {
        const cleaned: any = {};
        for (const key in obj) {
          // Remove metadata and unnecessary properties
          if (
            !["nm", "mn", "hd", "cl"].includes(key) ||
            obj[key] !== ""
          ) {
            cleaned[key] = removeUnusedProps(obj[key]);
          }
        }
        return cleaned;
      }
      return obj;
    };

    // Round numbers to reduce precision
    const roundNumbers = (
      obj: any,
      precision: number = 3,
    ): any => {
      if (Array.isArray(obj)) {
        return obj.map((item) => roundNumbers(item, precision));
      } else if (obj && typeof obj === "object") {
        const result: any = {};
        for (const key in obj) {
          result[key] = roundNumbers(obj[key], precision);
        }
        return result;
      } else if (typeof obj === "number") {
        return (
          Math.round(obj * Math.pow(10, precision)) /
          Math.pow(10, precision)
        );
      }
      return obj;
    };

    let result = removeUnusedProps(optimized);
    result = roundNumbers(result);

    return result;
  };

  // Browser-based image to WebP converter
  const convertImageToWebpClient = (dataUrl: string): Promise<{ dataUrl: string; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas ctx not found'));
        ctx.drawImage(img, 0, 0);
        // Optimize to WebP with 0.8 quality
        const webpDataUrl = canvas.toDataURL('image/webp', 0.8);
        resolve({ dataUrl: webpDataUrl, width: img.width, height: img.height });
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = dataUrl;
    });
  };

  const handleOptimize = async () => {
    if (!lottieData) return;

    setIsOptimizing(true);
    setOptimizationError(false); // Reset error state
    try {
      // 1. Client side JSON cleanup
      const cleanedData = optimizeLottie(lottieData.data);

      // 2. Pure Client-Side Image Compression (zero uploads!)
      // This specifically avoids Vercel's 4.5MB Serverless Payload limit
      const assets = cleanedData.assets || [];
      const supportedFormats = ['png', 'jpeg', 'jpg', 'gif'];
      
      for (const asset of assets) {
        if (!asset.p) continue;
        if (typeof asset.p === 'string' && asset.p.startsWith('data:image')) {
          const match = asset.p.match(/^data:image\/(png|jpeg|jpg|gif);base64,/);
          if (match && supportedFormats.includes(match[1])) {
            try {
              const { dataUrl, width, height } = await convertImageToWebpClient(asset.p);
              asset.p = dataUrl;
              // Preserve structural metadata in the asset if it doesn't magically exist
              if (!asset.w) asset.w = width;
              if (!asset.h) asset.h = height;
            } catch (err) {
              console.warn("Failed to convert image to webp in browser:", err);
            }
          }
        }
      }

      setLottieData({
        ...lottieData,
        optimizedData: cleanedData,
      });

      toast.success("Lottie optimized successfully offline!");
    } catch (error) {
      console.error(error);
      setOptimizationError(true);
      toast.error("Failed to optimize Lottie file.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleRetryOptimization = () => {
    setOptimizationError(false);
    handleOptimize();
  };

  const handleDownload = () => {
    if (!lottieData?.optimizedData) return;

    if (outputFormat === 'lottie') {
      const manifest = {
        generator: "TinyLottie",
        version: "1.0",
        revision: 1,
        author: "TinyLottie",
        animations: [{ id: "animation", speed: 1, themeColor: "", loop: true }],
        custom: {}
      };

      const zipData = {
        'manifest.json': strToU8(JSON.stringify(manifest)),
        animations: {
          'animation.json': strToU8(JSON.stringify(lottieData.optimizedData))
        }
      };

      const zippedBytes = zipSync(zipData);
      const blob = new Blob([zippedBytes.buffer], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `optimized-${lottieData.file.name.replace('.json', '')}.lottie`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const dataStr = JSON.stringify(lottieData.optimizedData, null, 0);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `optimized-${lottieData.file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    toast.success("Download started!");
  };

  const handleReset = () => {
    setLottieData(null);
  };

  const features = [
    {
      icon: Layers,
      title: "Universal Format Compatibility",
      description:
        "Seamlessly works with Lottie JSON and dotLottie files. Switch between formats effortlessly while preserving your animation's integrity.",
    },
    {
      icon: Zap,
      title: "Smart Compression Engine",
      description:
        "Intelligent algorithm analyzes and compresses your animations by removing redundant data, achieving up to 98% size reduction without visual loss.",
    },
    {
      icon: Gauge,
      title: "Blazing Fast Processing",
      description:
        "Lightning-speed optimization powered by modern browser technology. Process multiple files in seconds, not minutes.",
    },
    {
      icon: Shield,
      title: "Zero-Upload Security",
      description:
        "Your animations never touch our servers. Everything processes locally in your browser, guaranteeing absolute privacy and data security.",
    },
    {
      icon: FileJson,
      title: "Precision Optimization",
      description:
        "Advanced techniques including decimal rounding and metadata stripping ensure maximum file size reduction while maintaining perfect playback.",
    },
    {
      icon: Download,
      title: "Instant Download",
      description:
        "Get your optimized files immediately with one click. No waiting, no queues, no sign-ups required.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 relative overflow-hidden">

      {/* Background Gradient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00DDB3]/10 dark:bg-[#00DDB3]/5 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-[#00C9A7]/10 dark:bg-[#00C9A7]/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 relative">
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                TinyLottie
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <a
                href="https://www.shopier.com/themirproject"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00DDB3] to-[#00C9A7] hover:from-[#00C9A7] hover:to-[#00DDB3] text-white rounded-lg font-medium transition-all transform hover:scale-105"
              >
                <Heart className="w-4 h-4" />
                Support Us
              </a>
              {user ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-all"
                >
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="Avatar" className="w-6 h-6 rounded-full" />
                  <span className="hidden sm:inline">Profile</span>
                  {isPro && <span className="text-[10px] font-bold bg-[#00DDB3] text-white px-1.5 py-0.5 rounded ml-1">PRO</span>}
                </Link>
              ) : (
                <button
                  onClick={loginWithGoogle}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium transition-all"
                >
                  Login
                </button>
              )}
              <ThemeToggle />
            </motion.div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20 relative">
        {!lottieData ? (
          // Hero Section
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6 sm:mb-8 mt-4 sm:mt-6 lg:mt-0"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-5 lg:mb-4 mt-2 sm:mt-3 lg:mt-0 leading-tight px-4">
                <span className="text-gray-900 dark:text-white">
                  Make Your{" "}
                </span>
                <span className="bg-gradient-to-r from-[#00DDB3] to-[#00C9A7] bg-clip-text text-transparent">
                  Lotties
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#00DDB3] via-[#00C9A7] to-[#00DDB3] bg-clip-text text-transparent animate-gradient">
                  Lighter Than Air
                </span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
                Shrink animation file sizes{" "}
                <span className="font-semibold text-[#00DDB3]">
                  up to 98%
                </span>{" "}
                while preserving every frame of beauty. No
                uploads, no compromises, just pure optimization
                magic.
              </p>
            </motion.div>

            {/* Drag & Drop - Primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-10 sm:mb-12 lg:mb-16"
            >
              <LottieDropZone onFileSelect={handleFileSelect} />
            </motion.div>

            {/* Features Section - Now Visible Above Fold */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-10 sm:mb-12 lg:mb-16"
            >
              <div className="text-center mb-8 sm:mb-10 lg:mb-12 px-4">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Everything You Need, Nothing You Don't
                </h3>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Powerful optimization tools designed for
                  developers, designers, and teams who value
                  performance and privacy.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {features.map((feature, index) => (
                  <FeatureCard
                    key={index}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 sm:p-8 mb-10 sm:mb-12 lg:mb-16"
            >
              <div className="text-center py-2">
                <div className="text-3xl sm:text-4xl font-bold text-[#00DDB3] mb-1 sm:mb-2">
                  98%
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Max Compression
                </div>
              </div>
              <div className="text-center py-2">
                <div className="text-3xl sm:text-4xl font-bold text-[#00DDB3] mb-1 sm:mb-2">
                  100%
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Privacy
                </div>
              </div>
              <div className="text-center py-2">
                <div className="text-3xl sm:text-4xl font-bold text-[#00DDB3] mb-1 sm:mb-2">
                  0ms
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Server Upload
                </div>
              </div>
              <div className="text-center py-2">
                <div className="text-3xl sm:text-4xl font-bold text-[#00DDB3] mb-1 sm:mb-2">
                  Free
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Forever
                </div>
              </div>
            </motion.div>

            {/* Blog Section */}
            <BlogSection />

            {/* FAQ Section */}
            <FAQ />
          </div>
        ) : (
          // Optimization View
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white"
              >
                {lottieData.optimizedData
                  ? "Optimization Complete"
                  : "Ready to Optimize"}
              </motion.h2>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleReset}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                ← Start Over
              </motion.button>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {/* Preview Section - Side by Side */}
              <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Left Container - Original Animation + Controls */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    Original Animation
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 sm:p-4 aspect-square flex items-center justify-center mb-4 sm:mb-6">
                    <LottiePreview
                      animationData={lottieData.data}
                    />
                  </div>

                  {/* File Info & Controls */}
                  <div className="space-y-3 sm:space-y-4 mt-auto">
                    <div className="flex items-start gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="p-1.5 sm:p-2 bg-[#00DDB3]/10 rounded-lg">
                        <FileJson className="w-4 h-4 sm:w-5 sm:h-5 text-[#00DDB3]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                          {lottieData.file.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {formatFileSize(lottieData.file.size)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Output Format
                      </label>
                      <Select
                        value={outputFormat}
                        onValueChange={(val) => setOutputFormat(val as "json" | "lottie")}
                        disabled={isOptimizing || !lottieData.optimizedData}
                      >
                        <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 h-10 sm:h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">
                            Lottie JSON
                          </SelectItem>
                          <SelectItem value="lottie">
                            dotLottie
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleOptimize}
                      disabled={isOptimizing}
                      className={`w-full h-11 sm:h-12 text-sm sm:text-base font-semibold ${
                        lottieData.optimizedData
                          ? "bg-transparent border-2 border-[#00DDB3] text-[#00DDB3] hover:bg-[#00DDB3]/10"
                          : "bg-[#00DDB3] hover:bg-[#00C9A7] text-white"
                      }`}
                    >
                      {isOptimizing ? (
                        <>
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                          Optimizing...
                        </>
                      ) : (
                        <>
                          <FileJson className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          {lottieData.optimizedData
                            ? "Re-optimize"
                            : "Optimize"}
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>

                {/* Right Container - Optimized Animation + Download */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    Optimized Animation
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 sm:p-4 aspect-square flex items-center justify-center mb-4 sm:mb-6">
                    {isOptimizing ? (
                      // Loading State - Show Loader
                      <OptimizationLoader />
                    ) : optimizationError ? (
                      // Error State - Show Error
                      <OptimizationError
                        onRetry={handleRetryOptimization}
                      />
                    ) : lottieData.optimizedData ? (
                      // Success State - Show Optimized Animation
                      <LottiePreview
                        animationData={lottieData.optimizedData}
                      />
                    ) : (
                      // Initial State - Waiting for optimization
                      <div className="text-center text-gray-400 dark:text-gray-600">
                        <FileJson className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 opacity-30" />
                        <p className="text-xs sm:text-sm px-4">
                          Optimized version will appear here
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Download Section */}
                  {lottieData.optimizedData ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3 sm:space-y-4 mt-auto"
                    >
                      {/* File Size Comparison */}
                      <div className="pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                              Original
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-[11px] sm:text-[12px]">
                              {formatFileSize(
                                lottieData.file.size,
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                              Optimized
                            </p>
                            <p className="text-[11px] sm:text-xs text-[#00DDB3]">
                              {formatFileSize(
                                new Blob([
                                  JSON.stringify(
                                    lottieData.optimizedData,
                                  ),
                                ]).size,
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative h-2 sm:h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden w-full mt-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `var(--progress)`,
                            }}
                            transition={{
                              duration: 0.8,
                              ease: "easeOut",
                            }}
                            className="absolute left-0 top-0 h-full bg-[#00DDB3] rounded-full"
                            style={{ "--progress": `${Math.round(((lottieData.file.size - new Blob([JSON.stringify(lottieData.optimizedData)]).size) / lottieData.file.size) * 100)}%` } as React.CSSProperties}
                          />
                        </div>

                        <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                          <p className="text-gray-500 text-[12px] sm:text-[14px]">
                            Saved{" "}
                            {formatFileSize(
                              lottieData.file.size -
                                new Blob([
                                  JSON.stringify(
                                    lottieData.optimizedData,
                                  ),
                                ]).size,
                            )}
                          </p>
                          <p className="font-bold text-[#00DDB3] text-[12px] sm:text-[14px]">
                            {Math.round(
                              ((lottieData.file.size -
                                new Blob([
                                  JSON.stringify(
                                    lottieData.optimizedData,
                                  ),
                                ]).size) /
                                lottieData.file.size) *
                                100,
                            )}
                            % smaller
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={handleDownload}
                        className="w-full bg-[#00DDB3] hover:bg-[#00C9A7] text-white h-11 sm:h-12 text-sm sm:text-base font-semibold"
                      >
                        <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Download Optimized File
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="mt-auto">
                      <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                          Click "Optimize" to compress your file
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-8 sm:mt-10 lg:mt-12 py-8 sm:py-10 lg:py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-[#00DDB3] rounded-lg">
                <FileJson className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                TinyLottie
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 px-4">
              All processing happens locally in your browser.
              Your files never leave your device.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-3 sm:mb-4">
              <a
                href="mailto:emir.kalayci@gmail.com"
                className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 hover:text-[#00DDB3] transition-colors"
              >
                Support
              </a>
              <span className="text-gray-300 dark:text-gray-700">·</span>
              <Link
                href="/privacy"
                className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 hover:text-[#00DDB3] transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
              © 2026 TinyLottie. Built with ❤️ for the
              animation community.
            </p>
          </div>
        </div>
      </footer>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        fileSize={largeFileSize}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}