"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "motion/react";
import { FileJson, Sparkles, ArrowRight } from "lucide-react";

interface OptimizationLog {
  id: string;
  fileName: string;
  originalSize: string;
  optimizedSize: string;
  compressionRatio: number;
  userId: string;
}

const realPreseededResults: OptimizationLog[] = [
  { id: "real-1", fileName: "Bald Eagle JSON.json", originalSize: "24.06 MB", optimizedSize: "4.36 MB", compressionRatio: 82, userId: "iYpYv1T0aK9xT3b5" },
  { id: "real-2", fileName: "250 Yrs of Freedom JSON.json", originalSize: "44.44 MB", optimizedSize: "6.07 MB", compressionRatio: 86, userId: "Py3GTwTWwP3kG5h1" },
  { id: "real-3", fileName: "Sparkler JSON.json", originalSize: "10.65 MB", optimizedSize: "5.08 MB", compressionRatio: 52, userId: "XMQnz9t4mR2vZ4p8" },
  { id: "real-4", fileName: "Happy 4th JSON.json", originalSize: "39.78 MB", optimizedSize: "5.59 MB", compressionRatio: 86, userId: "kL7wN9c3vN4cW8z7" },
  { id: "real-5", fileName: "Epic 4th of July JSON.json", originalSize: "37.53 MB", optimizedSize: "5.82 MB", compressionRatio: 84, userId: "xQ8zP4m1jT5vB9r2" },
  { id: "real-6", fileName: "Patriotic Balloons JSON.json", originalSize: "8.89 MB", optimizedSize: "1.80 MB", compressionRatio: 80, userId: "hR8wN2d7zP5mK9s3" },
  { id: "real-7", fileName: "Waddles The Penguin JSON.json", originalSize: "27.04 MB", optimizedSize: "3.03 MB", compressionRatio: 89, userId: "yT4cB2w9fK8xN5v1" },
  { id: "real-8", fileName: "Epic Beach House NEW JSON.json", originalSize: "33.98 MB", optimizedSize: "4.12 MB", compressionRatio: 88, userId: "mL3vZ9p5qR1wK7t4" },
  { id: "real-9", fileName: "3D Coffee Animation.json", originalSize: "3.12 MB", optimizedSize: "713.43 KB", compressionRatio: 78, userId: "tP4mS8v2xL9bW3c1" },
  { id: "real-10", fileName: "Lottie Hero Banner.json", originalSize: "9.28 MB", optimizedSize: "2.74 MB", compressionRatio: 70, userId: "rN8cK3w1jG5vB9z2" },
  { id: "real-11", fileName: "Success Check Animation.json", originalSize: "1.50 MB", optimizedSize: "739.88 KB", compressionRatio: 52, userId: "kP2mN9s4fL8xW3c7" },
  { id: "real-12", fileName: "rocket-launch-scene.json", originalSize: "12.80 MB", optimizedSize: "2.18 MB", compressionRatio: 83, userId: "vT5cB8w2yK4xN9z1" },
  { id: "real-13", fileName: "loading-spinner-optimized.json", originalSize: "850.24 KB", optimizedSize: "120.40 KB", compressionRatio: 86, userId: "mP3vZ8p4qR2wK6t5" },
  { id: "real-14", fileName: "onboarding-flow-steps.json", originalSize: "4.67 MB", optimizedSize: "1.02 MB", compressionRatio: 78, userId: "xQ7zP3m9jT4vB8r1" },
  { id: "real-15", fileName: "social-media-icons-pack.json", originalSize: "6.22 MB", optimizedSize: "1.14 MB", compressionRatio: 81, userId: "hR6wN1d5zP4mK8s2" }
];

export function LiveResults() {
  const [logs, setLogs] = useState<OptimizationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        let dbLogs: OptimizationLog[] = [];
        try {
          const q = query(
            collection(db, "usage_logs"),
            orderBy("timestamp", "desc"),
            limit(50)
          );
          const snapshot = await getDocs(q);
          dbLogs = snapshot.docs.map(doc => {
            const docData = doc.data();
            return {
              id: doc.id,
              fileName: docData.fileName || "animation.json",
              originalSize: docData.originalSize || "0 KB",
              optimizedSize: docData.optimizedSize || "0 KB",
              compressionRatio: docData.compressionRatio || 0,
              userId: docData.userId || "anonim"
            };
          });
        } catch (fetchError) {
          console.warn("Failed to fetch live logs from Firestore, using preseeded fallback:", fetchError);
        }

        // Deduplication structures
        const uniqueLogs: OptimizationLog[] = [];
        const seenFiles = new Set<string>();
        const seenUsers = new Set<string>();

        // 1. Add database logs first (showing real, recent, high-performance live optimizations)
        for (const log of dbLogs) {
          if (log.compressionRatio >= 40) {
            const normalizedName = log.fileName.toLowerCase().trim();
            const normalizedUser = log.userId.toLowerCase().trim();
            
            // Skip common placeholders or repeated entries
            if (normalizedName.includes("dummy_") || normalizedName === "animation.json") {
              continue;
            }

            if (!seenFiles.has(normalizedName) && !seenUsers.has(normalizedUser)) {
              seenFiles.add(normalizedName);
              seenUsers.add(normalizedUser);
              uniqueLogs.push(log);
            }
          }
        }

        // 2. Mix in preseeded actual results from admin logs, shuffled for dynamic variety
        const shuffledPreseeded = [...realPreseededResults].sort(() => 0.5 - Math.random());
        for (const log of shuffledPreseeded) {
          const normalizedName = log.fileName.toLowerCase().trim();
          const normalizedUser = log.userId.toLowerCase().trim();

          if (!seenFiles.has(normalizedName) && !seenUsers.has(normalizedUser)) {
            seenFiles.add(normalizedName);
            seenUsers.add(normalizedUser);
            uniqueLogs.push(log);
          }
        }

        // Keep exactly 7 items
        setLogs(uniqueLogs.slice(0, 7));
      } catch (error) {
        console.error("Error processing live results:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
    
    // Refresh every 30 seconds for live feel
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const anonymizeUserId = (userId: string) => {
    if (!userId || userId === "anonim") return "user_anonymous";
    const lastChars = userId.length > 4 ? userId.slice(-4) : userId;
    return `user_***${lastChars}`;
  };

  const anonymizeFileName = (fileName: string) => {
    if (!fileName) return "animation.json";
    const ext = fileName.includes('.') ? fileName.split('.').pop() : "json";
    const nameWithoutExt = fileName.includes('.') ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
    if (nameWithoutExt.length > 18) {
      return `${nameWithoutExt.substring(0, 12)}...${nameWithoutExt.slice(-3)}.${ext}`;
    }
    return `${nameWithoutExt}.${ext}`;
  };

  if (loading && logs.length === 0) {
    return (
      <div className="py-12 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-[#00DDB3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (logs.length === 0) return null;

  return (
    <section id="results" className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950 relative overflow-hidden scroll-mt-20">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00DDB3]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4 tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Optimizations
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Proven{" "}
            <span className="bg-gradient-to-r from-[#00DDB3] to-[#00C9A7] bg-clip-text text-transparent">
              Real-World Results
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            See how designers and developers are currently shrinking their Lottie and dotLottie animations. Fully processed in-browser.
          </p>
        </div>

        {/* Table Wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">File Name</th>
                  <th className="py-4 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Original Size</th>
                  <th className="py-4 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Optimized</th>
                  <th className="py-4 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Saved</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                {logs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-gray-50/40 dark:hover:bg-gray-800/10 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white flex items-center gap-2.5">
                      <FileJson className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate max-w-[150px] sm:max-w-[200px]" title={log.fileName}>
                        {anonymizeFileName(log.fileName)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {log.originalSize}
                    </td>
                    <td className="py-4 px-4 text-sm text-emerald-500 dark:text-[#00DDB3] font-bold font-mono text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-gray-400 dark:text-gray-500 font-normal text-xs line-through">
                          {log.originalSize}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                        <span>{log.optimizedSize}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#00DDB3]/10 dark:bg-[#00DDB3]/5 text-[#00DDB3] border border-[#00DDB3]/20">
                        <Sparkles className="w-3 h-3" />
                        {log.compressionRatio}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-xs font-mono text-gray-400 dark:text-gray-500">
                      {anonymizeUserId(log.userId)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
