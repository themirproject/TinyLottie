"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FileJson, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00DDB3]/10 dark:bg-[#00DDB3]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00C9A7]/10 dark:bg-[#00C9A7]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-[#00DDB3]/10 rounded-2xl">
            <FileJson className="w-16 h-16 text-[#00DDB3]" />
          </div>
        </div>

        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-[#00DDB3] to-[#00C9A7] bg-clip-text text-transparent mb-4">
          404
        </h1>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#00DDB3] hover:bg-[#00C9A7] text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-[#00DDB3]/20"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
