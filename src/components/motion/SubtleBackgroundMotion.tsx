"use client";

import { motion, useReducedMotion } from "motion/react";

export function SubtleBackgroundMotion() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Soft gradient ambient blurs */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 20, 0],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-0 left-1/4 w-96 h-96 bg-[#00DDB3]/10 dark:bg-[#00DDB3]/5 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -25, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-36 right-1/4 w-80 h-80 bg-[#00C9A7]/10 dark:bg-[#00C9A7]/5 rounded-full blur-3xl"
      />

      {/* Floating abstract Lottie AST tokens in background with ultra-low opacity */}
      <motion.div
        animate={{
          y: [0, -14, 0],
          rotate: [0, 8, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="hidden lg:block absolute top-28 left-12 text-[#00DDB3]/15 font-mono text-2xl font-bold select-none"
      >
        {`{ "fr": 60 }`}
      </motion.div>

      <motion.div
        animate={{
          y: [0, 16, 0],
          rotate: [0, -6, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="hidden lg:block absolute top-48 right-16 text-[#00DDB3]/15 font-mono text-2xl font-bold select-none"
      >
        {`[ "v": "5.5" ]`}
      </motion.div>

      {/* Tiny floating geometric nodes */}
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="hidden sm:block absolute top-96 left-1/6 w-3 h-3 rounded-full border border-[#00DDB3]/30"
      />

      <motion.div
        animate={{
          y: [0, 12, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
        className="hidden sm:block absolute top-[520px] right-1/5 w-2.5 h-2.5 rounded-sm border border-[#00DDB3]/30 rotate-45"
      />
    </div>
  );
}
