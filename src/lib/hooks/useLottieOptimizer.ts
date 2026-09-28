"use client";

import { useState } from "react";
import { zipSync, strToU8 } from "fflate";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import {
  trackFileLoaded,
  trackPaywallHit,
  trackOptimizationComplete,
  trackOptimizationError,
  trackDownload,
} from "@/lib/analytics";
import { toast } from "sonner";
import tipsData from "../../../tips.json";

export interface LottieData {
  file: File;
  data: any;
  optimizedData: any | null;
}

export const FREE_FILE_SIZE_LIMIT = 3 * 1024 * 1024; // 3MB in bytes
export const PRO_FILE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB in bytes

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

export function useLottieOptimizer() {
  const { user, isPro } = useAuth();
  const [lottieData, setLottieData] = useState<LottieData | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationError, setOptimizationError] = useState(false);
  const [outputFormat, setOutputFormat] = useState<"json" | "lottie">("json");
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [largeFileSize, setLargeFileSize] = useState(0);
  const [rejectedFileNotice, setRejectedFileNotice] = useState<{
    fileName: string;
    fileSize: number;
  } | null>(null);
  const [currentTip, setCurrentTip] = useState("");

  const handleFileSelect = async (file: File) => {
    // Check file size limits
    if (isPro && file.size > PRO_FILE_SIZE_LIMIT) {
      toast.error(`File size (${formatFileSize(file.size)}) exceeds the 50 MB Pro limit.`);
      return;
    }

    // Check free limit and trigger paywall for non-PRO users
    if (file.size > FREE_FILE_SIZE_LIMIT && !isPro) {
      setLargeFileSize(file.size);
      setRejectedFileNotice({
        fileName: file.name,
        fileSize: file.size,
      });
      setShowPricingModal(true);
      toast.error(
        `File size exceeds 3 MB Free limit. Upgrade to Pro to process files up to 50 MB.`
      );
      trackPaywallHit({
        fileSizeKb: file.size / 1024,
        fileSizeMb: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      });
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      setRejectedFileNotice(null);
      setLargeFileSize(0);
      setLottieData({
        file,
        data,
        optimizedData: null,
      });
      toast.success("Lottie file loaded successfully!");
      trackFileLoaded({
        fileSizeKb: file.size / 1024,
        fileExtension: file.name.endsWith(".lottie") ? "lottie" : "json",
      });
    } catch (error) {
      toast.error("Failed to parse Lottie file. Please ensure it's a valid JSON.");
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
          // Exclude metadata properties completely
          if (!["nm", "mn", "cl"].includes(key)) {
            // Keep "hd" only if it is true (default is false)
            if (key === "hd" && obj[key] !== true) {
              continue;
            }
            cleaned[key] = removeUnusedProps(obj[key]);
          }
        }
        return cleaned;
      }
      return obj;
    };

    // Round numbers to reduce precision
    const roundNumbers = (obj: any, precision: number = 3): any => {
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
          Math.round(obj * Math.pow(10, precision)) / Math.pow(10, precision)
        );
      }
      return obj;
    };

    let result = removeUnusedProps(optimized);
    result = roundNumbers(result);
    return result;
  };

  // Browser-based image to WebP converter
  const convertImageToWebpClient = (
    dataUrl: string
  ): Promise<{ dataUrl: string; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas ctx not found"));
        ctx.drawImage(img, 0, 0);
        // Optimize to WebP with 0.8 quality
        const webpDataUrl = canvas.toDataURL("image/webp", 0.8);
        resolve({ dataUrl: webpDataUrl, width: img.width, height: img.height });
      };
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = dataUrl;
    });
  };

  const handleOptimize = async () => {
    if (!lottieData) return;

    setIsOptimizing(true);
    setOptimizationError(false);
    try {
      // 1. Client side JSON cleanup
      const cleanedData = optimizeLottie(lottieData.data);

      // 2. Pure Client-Side Image Compression (zero uploads)
      const assets = cleanedData.assets || [];
      const supportedFormats = ["png", "jpeg", "jpg", "gif"];

      for (const asset of assets) {
        if (!asset.p) continue;
        if (typeof asset.p === "string" && asset.p.startsWith("data:image")) {
          const match = asset.p.match(/^data:image\/(png|jpeg|jpg|gif);base64,/);
          if (match && supportedFormats.includes(match[1])) {
            try {
              const { dataUrl, width, height } = await convertImageToWebpClient(asset.p);
              if (dataUrl.length < asset.p.length) {
                asset.p = dataUrl;
                if (!asset.w) asset.w = width;
                if (!asset.h) asset.h = height;
              }
            } catch (err) {
              console.warn("Failed to convert image to webp in browser:", err);
            }
          }
        }
      }

      // Check if optimized size is larger than original size
      const originalBytes = lottieData.file.size;
      const optimizedBytes = new Blob([JSON.stringify(cleanedData)]).size;

      let finalData = cleanedData;
      let finalOptimizedBytes = optimizedBytes;
      let isAlreadyOptimized = false;

      if (optimizedBytes > originalBytes) {
        finalData = lottieData.data; // Fallback to original data
        finalOptimizedBytes = originalBytes;
        isAlreadyOptimized = true;
      }

      setLottieData({
        ...lottieData,
        optimizedData: finalData,
      });

      // Randomly pick a tip
      if (tipsData && tipsData.length > 0) {
        const randomTip = tipsData[Math.floor(Math.random() * tipsData.length)].text;
        setCurrentTip(randomTip);
      }

      // Log optimization to database if user is logged in (privacy-first: no raw file names stored)
      if (user) {
        try {
          const ratio = Math.round(
            ((originalBytes - finalOptimizedBytes) / originalBytes) * 100
          );
          const detectedFormat =
            outputFormat ||
            (lottieData.file.name.toLowerCase().endsWith(".lottie") ? "lottie" : "json");

          await addDoc(collection(db, "usage_logs"), {
            userId: user.uid,
            format: detectedFormat,
            originalSize: formatFileSize(originalBytes),
            optimizedSize: formatFileSize(finalOptimizedBytes),
            originalSizeBytes: originalBytes,
            optimizedSizeBytes: finalOptimizedBytes,
            compressionRatio: ratio,
            status: "success",
            timestamp: serverTimestamp(),
          });
        } catch (logError) {
          console.error("Failed to log usage:", logError);
        }
      }

      const compressionPct = Math.round(
        ((originalBytes - finalOptimizedBytes) / originalBytes) * 100
      );
      trackOptimizationComplete({
        originalSizeKb: originalBytes / 1024,
        optimizedSizeKb: finalOptimizedBytes / 1024,
        compressionRatioPct: compressionPct,
        isAlreadyOptimized,
        userTier: !user ? "anonymous" : isPro ? "pro" : "free",
      });

      if (isAlreadyOptimized) {
        toast.info("Your file is already highly optimized. Original file was preserved.");
      } else {
        toast.success("Lottie optimized successfully offline!");
      }
    } catch (error) {
      console.error(error);
      setOptimizationError(true);
      trackOptimizationError();
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

    if (outputFormat === "lottie") {
      const manifest = {
        generator: "TinyLottie",
        version: "1.0",
        revision: 1,
        author: "TinyLottie",
        animations: [{ id: "animation", speed: 1, themeColor: "", loop: true }],
        custom: {},
      };

      const zipData = {
        "manifest.json": strToU8(JSON.stringify(manifest)),
        animations: {
          "animation.json": strToU8(JSON.stringify(lottieData.optimizedData)),
        },
      };

      const zippedBytes = zipSync(zipData);
      const blob = new Blob([zippedBytes.buffer as ArrayBuffer], {
        type: "application/zip",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `optimized-${lottieData.file.name.replace(".json", "")}.lottie`;
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

    if (lottieData?.optimizedData) {
      const originalBytes = lottieData.file.size;
      const optimizedBytes = new Blob([
        JSON.stringify(lottieData.optimizedData),
      ]).size;
      const ratio = Math.round(
        ((originalBytes - optimizedBytes) / originalBytes) * 100
      );
      trackDownload({
        format: outputFormat === "lottie" ? "lottie" : "json",
        optimizedSizeKb: optimizedBytes / 1024,
        compressionRatioPct: ratio,
      });
    }
    toast.success("Download started!");
  };

  const handleReset = () => {
    setLottieData(null);
    setRejectedFileNotice(null);
    setLargeFileSize(0);
    setOptimizationError(false);
  };

  return {
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
  };
}
