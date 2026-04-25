"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface UsageLog {
  id: string;
  userId: string;
  fileName: string;
  originalSize: string;
  optimizedSize: string;
  compressionRatio: number;
  timestamp: any;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [fetching, setFetching] = useState(true);

  // You can change this to any email you want to have admin access
  const ADMIN_EMAIL = "emir.kalayci@gmail.com";

  useEffect(() => {
    async function fetchLogs() {
      if (user?.email !== ADMIN_EMAIL) return;
      try {
        const q = query(collection(db, "usage_logs"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UsageLog[];
        setLogs(data);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setFetching(false);
      }
    }

    if (!loading) {
      if (user?.email === ADMIN_EMAIL) {
        fetchLogs();
      } else {
        setFetching(false);
      }
    }
  }, [user, loading]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-[#00DDB3]" />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">You don't have permission to view this page.</p>
        <Link href="/" className="px-6 py-2.5 bg-[#00DDB3] hover:bg-[#00C9A7] text-white rounded-xl font-medium transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Usage logs and system metrics</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium">
            Back to App
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">File Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Original Size</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Optimized Size</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Saved</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No usage logs found yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {log.timestamp?.toDate 
                          ? log.timestamp.toDate().toLocaleString() 
                          : (log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-[200px] truncate" title={log.fileName}>
                        {log.fileName || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {log.originalSize}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#00DDB3] font-medium">
                        {log.optimizedSize}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#00DDB3]/10 text-[#00DDB3]">
                          {log.compressionRatio}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-500 font-mono">
                        {log.userId?.slice(0, 8)}...
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
