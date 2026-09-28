"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { X, Zap, Check, Sparkles, FileJson } from "lucide-react";
import { Button } from "./ui/button";
import { trackPaywallUpgradeClick, trackPaywallDismissed } from "@/lib/analytics";
import { useAuth } from "@/contexts/AuthContext";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileSize: number;
}

export function PricingModal({ isOpen, onClose, fileSize }: PricingModalProps) {
  const { user } = useAuth();
  const upgradedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      upgradedRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleUpgrade = () => {
    upgradedRef.current = true;
    trackPaywallUpgradeClick("modal");
    const checkoutUrl = user?.email
      ? `https://tiny-lottie.lemonsqueezy.com/checkout/buy/c070366c-2fb4-41bf-ad9a-4af0cc94fab8?checkout[email]=${encodeURIComponent(user.email)}`
      : "https://tiny-lottie.lemonsqueezy.com/checkout/buy/c070366c-2fb4-41bf-ad9a-4af0cc94fab8";
    window.open(checkoutUrl, "_blank");
    onClose();
  };

  const handleClose = () => {
    if (!upgradedRef.current) {
      trackPaywallDismissed();
    }
    onClose();
  };

  return (
    <div 
      onClick={handleClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-150 dark:border-gray-800 max-h-[92vh] overflow-y-auto my-auto"
      >
        {/* Visual Premium Header */}
        <div className="relative bg-slate-950 p-6 sm:p-8 text-white overflow-hidden border-b border-gray-800">
          {/* Abstract Glowing shapes */}
          <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-[#00DDB3]/15 rounded-full blur-3xl" />
          <div className="absolute bottom-[-60px] left-[-30px] w-40 h-40 bg-[#00C9A7]/10 rounded-full blur-2xl" />

          {/* Grid decoration */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header illustration layout */}
          <div className="flex items-center gap-4 relative z-10">
            {/* Visual Icon Illustration */}
            <div className="relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#00DDB3] to-[#00C9A7] flex items-center justify-center shadow-lg shadow-[#00DDB3]/20">
              <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white/10" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-900 border border-gray-700 flex items-center justify-center"
              >
                <Sparkles className="w-3 h-3 text-[#00DDB3]" />
              </motion.div>
            </div>

            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#00DDB3] uppercase bg-[#00DDB3]/10 px-2.5 py-1 rounded-full border border-[#00DDB3]/20">
                Limit Exceeded
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1.5 sm:mt-2 text-white">
                Your file exceeds the free limit
              </h2>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5 sm:p-4 relative z-10 backdrop-blur-sm">
            <FileJson className="w-5 h-5 text-[#00DDB3] shrink-0" />
            <p className="text-xs text-gray-300 leading-normal">
              Your uploaded file size is{" "}
              <strong className="text-white font-bold">
                {fileSize && fileSize > 0 ? formatFileSize(fileSize) : "over 3 MB"}
              </strong>
              , which exceeds the free tier limit of{" "}
              <strong className="text-[#00DDB3] font-bold">3 MB</strong>.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-5 sm:space-y-6">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              $99
            </span>
            <span className="text-gray-500 dark:text-gray-400 font-semibold text-xs sm:text-sm">
              / lifetime access
            </span>
            <span className="ml-auto text-[10px] font-bold text-[#00DDB3] bg-[#00DDB3]/10 px-2.5 sm:px-3 py-1 rounded-full border border-[#00DDB3]/20 uppercase tracking-wider">
              ONE-TIME PAYMENT
            </span>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="p-1 bg-[#00DDB3]/10 rounded-full mt-0.5 shrink-0">
                <Check className="w-4 h-4 text-[#00DDB3]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                  Optimize Files up to 50 MB
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Go beyond the 3 MB Free limit.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-1 bg-[#00DDB3]/10 rounded-full mt-0.5 shrink-0">
                <Check className="w-4 h-4 text-[#00DDB3]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                  Lifetime Access
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  One payment. No recurring fees.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-1 bg-[#00DDB3]/10 rounded-full mt-0.5 shrink-0">
                <Check className="w-4 h-4 text-[#00DDB3]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                  Private Browser-Based Processing
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Your animations stay on your device.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleUpgrade}
              className="w-full bg-[#00DDB3] hover:bg-[#00C9A7] text-white h-12 text-base font-bold rounded-xl shadow-lg shadow-[#00DDB3]/20 transition-all hover:scale-[1.01]"
            >
              Get Lifetime PRO — $99
            </Button>
            <button
              onClick={handleClose}
              className="w-full text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-semibold transition-colors py-2 text-center"
            >
              Maybe later, keep free tier
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}