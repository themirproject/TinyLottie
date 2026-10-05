"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  FileJson,
  Layers,
  Shield,
  Zap,
  Download,
  Gauge,
  LucideIcon,
} from "lucide-react";

interface FeatureMotionIconProps {
  icon: LucideIcon;
  variant?: "ast" | "dotlottie" | "privacy" | "webp" | "download" | "vitals";
}

export function FeatureMotionIcon({ icon: FallbackIcon, variant = "ast" }: FeatureMotionIconProps) {
  const shouldReduceMotion = useReducedMotion();

  // 1. AST Optimization (Pruning redundant nodes)
  if (variant === "ast") {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 40 40" className="w-7 h-7 text-white overflow-visible">
          {/* File outline */}
          <rect
            x="8"
            y="6"
            width="24"
            height="28"
            rx="4"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          {/* Horizontal code/token lines that optimize */}
          <motion.line
            x1="13"
            y1="14"
            x2="27"
            y2="14"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            animate={
              shouldReduceMotion
                ? {}
                : {
                    x2: [27, 20, 27],
                    opacity: [1, 0.6, 1],
                  }
            }
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.line
            x1="13"
            y1="20"
            x2="23"
            y2="20"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            animate={
              shouldReduceMotion
                ? {}
                : {
                    x2: [23, 17, 23],
                    opacity: [0.7, 1, 0.7],
                  }
            }
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
          <motion.circle
            cx="24"
            cy="26"
            r="2"
            fill="white"
            animate={
              shouldReduceMotion
                ? {}
                : {
                    scale: [1, 1.4, 1],
                    opacity: [0.8, 1, 0.8],
                  }
            }
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>
    );
  }

  // 2. dotLottie Support (Layer stacks compress and deflate)
  if (variant === "dotlottie") {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 40 40" className="w-7 h-7 text-white overflow-visible">
          {/* Bottom layer */}
          <motion.path
            d="M 8 26 L 20 32 L 32 26"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={
              shouldReduceMotion
                ? {}
                : {
                    y: [0, -2, 0],
                  }
            }
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />
          {/* Middle layer */}
          <motion.path
            d="M 8 20 L 20 26 L 32 20"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={
              shouldReduceMotion
                ? {}
                : {
                    y: [0, -1, 0],
                  }
            }
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
          {/* Top layer */}
          <motion.polygon
            points="20,8 32,14 20,20 8,14"
            fill="rgba(255,255,255,0.25)"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={
              shouldReduceMotion
                ? {}
                : {
                    y: [0, 2, 0],
                    scale: [1, 0.95, 1],
                  }
            }
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>
    );
  }

  // 3. 100% In-Browser Privacy (Pulsing shield with verified lock)
  if (variant === "privacy") {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 40 40" className="w-7 h-7 text-white overflow-visible">
          <motion.path
            d="M 20 7 L 31 11 C 31 23 20 31 20 31 C 20 31 9 23 9 11 Z"
            fill="rgba(255,255,255,0.15)"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={
              shouldReduceMotion
                ? {}
                : {
                    scale: [1, 1.05, 1],
                  }
            }
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Checkmark inside */}
          <motion.path
            d="M 16 19 L 19 22 L 25 16"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={
              shouldReduceMotion
                ? {}
                : {
                    opacity: [0.7, 1, 0.7],
                  }
            }
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>
    );
  }

  // 4. WebP Asset Transcoding (Zap spark with conversion pulse)
  if (variant === "webp") {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 40 40" className="w-7 h-7 text-white overflow-visible">
          <motion.polygon
            points="22,6 10,21 19,21 17,34 30,19 21,19"
            fill="white"
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
            animate={
              shouldReduceMotion
                ? {}
                : {
                    scale: [1, 1.1, 1],
                    rotate: [0, 4, -4, 0],
                  }
            }
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>
    );
  }

  // 5. Instant Offline Download (Gentle bobbing down-arrow into tray)
  if (variant === "download") {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 40 40" className="w-7 h-7 text-white overflow-visible">
          {/* Base tray */}
          <path
            d="M 10 26 L 10 30 C 10 31.1 10.9 32 12 32 L 28 32 C 29.1 32 30 31.1 30 30 L 30 26"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Arrow */}
          <motion.g
            animate={
              shouldReduceMotion
                ? {}
                : {
                    y: [0, 3, 0],
                  }
            }
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <line x1="20" y1="8" x2="20" y2="23" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            <polyline points="14,17 20,23 26,17" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </motion.g>
        </svg>
      </div>
    );
  }

  // 6. Core Web Vitals Gauge (Speed needle sweep)
  if (variant === "vitals") {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 40 40" className="w-7 h-7 text-white overflow-visible">
          {/* Dial Arc */}
          <path
            d="M 10 28 A 13 13 0 1 1 30 28"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Dial Needle */}
          <motion.line
            x1="20"
            y1="23"
            x2="26"
            y2="14"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={
              shouldReduceMotion
                ? {}
                : {
                    rotate: [-20, 25, -20],
                  }
            }
            style={{ originX: "20px", originY: "23px" }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <circle cx="20" cy="23" r="2.5" fill="white" />
        </svg>
      </div>
    );
  }

  return <FallbackIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />;
}
