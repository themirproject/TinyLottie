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

        // Filter valid ratios (>= 50%) and sort descending by compression ratio
        const sortedData = data
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
    if (!userId || userId === "anonim") return "user_anonymous";
    const lastChars = userId.length > 4 ? userId.slice(-4) : userId;
    return `user_***${lastChars}`;
  };

  const anonymizeFileName = (fileName: string) => {
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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#00DDB3]" />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            {entries.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                <FileJson className="w-12 h-12 mb-4 opacity-20" />
                <p>No optimizations performed in the last 24 hours.</p>
                <p className="text-sm mt-1 font-medium text-[#00DDB3]">You could be the first champion!</p>
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
