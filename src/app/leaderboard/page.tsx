"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trophy, Loader2, FileJson, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

interface LeaderboardEntry {
  id: string;
  userId: string;
  compressionRatio: number;
  fileName: string;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        
        // We fetch logs from the last 24 hours
        // Client-side sorting is used to avoid requiring a composite index in Firestore.
        const q = query(
          collection(db, "usage_logs"),
          where("timestamp", ">=", Timestamp.fromDate(twentyFourHoursAgo))
        );
        
        const snapshot = await getDocs(q);
        
        const data = snapshot.docs.map(doc => {
          const docData = doc.data();
          return {
            id: doc.id,
            userId: docData.userId || "anonim",
            compressionRatio: docData.compressionRatio || 0,
            fileName: docData.fileName || "bilinmiyor"
          };
        });

        const dummyData: LeaderboardEntry[] = [
          { id: "dummy-1", userId: "dummy_Beta Tester", compressionRatio: 94, fileName: "dummy_hero_banner.json" },
          { id: "dummy-2", userId: "dummy_Early Adopter", compressionRatio: 89, fileName: "dummy_loading_spinner.json" },
          { id: "dummy-3", userId: "dummy_Lottie Enthusiast", compressionRatio: 82, fileName: "dummy_success_check.json" },
          { id: "dummy-4", userId: "dummy_Motion Designer", compressionRatio: 76, fileName: "dummy_menu_icon.json" },
          { id: "dummy-5", userId: "dummy_Frontend Dev", compressionRatio: 71, fileName: "dummy_error_state.json" },
          { id: "dummy-6", userId: "dummy_Product Hunter", compressionRatio: 65, fileName: "dummy_payment_success.json" },
          { id: "dummy-7", userId: "dummy_UI Expert", compressionRatio: 58, fileName: "dummy_onboarding_step1.json" },
        ];

        const allData = [...data, ...dummyData];

        // Filter valid ratios (>= 50%) and sort descending by compression ratio
        const sortedData = allData
          .filter(item => typeof item.compressionRatio === 'number' && item.compressionRatio >= 50)
          .sort((a, b) => b.compressionRatio - a.compressionRatio);
          
        // Limit to top 50 to keep it clean
        setEntries(sortedData.slice(0, 50));
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  const anonymizeUserId = (userId: string) => {
    if (userId?.startsWith('dummy_')) return userId.replace('dummy_', '');
    if (!userId || userId === "anonim") return "user_anonymous";
    const lastChars = userId.length > 4 ? userId.slice(-4) : userId;
    return `user_***${lastChars}`;
  };

  const anonymizeFileName = (fileName: string) => {
    if (fileName?.startsWith('dummy_')) return fileName.replace('dummy_', '');
    if (!fileName) return "hidden_file.json";
    const ext = fileName.includes('.') ? fileName.split('.').pop() : "json";
    return `hidden_file_***.${ext}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 sm:mb-12">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="p-3 sm:p-4 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 rounded-2xl sm:rounded-3xl">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">Optimization Champions</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">Files with the highest efficiency ratio in the last 24 hours.</p>
            </div>
          </div>
        </div>

        {/* PROMO BANNER */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-gradient-to-r from-[#00DDB3] to-[#00C9A7] rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 text-center sm:text-left mb-4 sm:mb-0">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">🎁 Special Offer!</h3>
            <p className="text-white/90 text-sm sm:text-base">Be the first to optimize and win 1 month of Pro!</p>
          </div>
          <Link href="/" className="relative z-10 px-6 py-3 bg-white text-[#00DDB3] hover:bg-gray-50 font-bold rounded-xl transition-colors shadow-sm">
            Optimize Now
          </Link>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#00DDB3]" />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            {entries.length === 0 ? (
              <div className="p-16 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-100 to-transparent dark:from-gray-800/30 dark:to-transparent opacity-50" />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="relative z-10 flex flex-col items-center"
                >
                  <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-[#00DDB3]/20 to-[#00C9A7]/10 flex items-center justify-center shadow-inner">
                    <Trophy className="w-12 h-12 text-[#00DDB3]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No records yet, be the pioneer!</h3>
                  <p className="text-base text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8">
                    The leaderboard is currently empty for the last 24 hours. This is your chance to claim the top spot!
                  </p>
                  <Link href="/" className="px-8 py-3 bg-[#00DDB3] hover:bg-[#00C9A7] text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-md">
                    Start Competing
                  </Link>
                </motion.div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
                {entries.map((entry, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={entry.id} 
                    className="flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                      <div className={`
                        flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full font-bold text-sm sm:text-base
                        ${index === 0 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 shadow-sm' : 
                          index === 1 ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300' : 
                          index === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' : 
                          'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'}
                      `}>
                        #{index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white font-mono text-sm sm:text-base truncate">
                          {anonymizeUserId(entry.userId)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5 truncate">
                          <FileJson className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                          <span className="truncate">{anonymizeFileName(entry.fileName)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-sm sm:text-base font-bold bg-[#00DDB3]/10 text-[#00DDB3]">
                        {entry.compressionRatio}%
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
