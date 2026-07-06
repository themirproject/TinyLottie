"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Loader2,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
  AlertCircle,
  Download,
  FileJson,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  Clock,
  Flame,
} from "lucide-react";
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

interface AnalyticsEventLog {
  id: string;
  event: string;
  timestamp: any;
}

// Parse "X.XX MB" / "X.XX KB" strings into bytes
function parseSize(str: string): number {
  if (!str) return 0;
  const num = parseFloat(str);
  if (str.includes("MB")) return num * 1024 * 1024;
  if (str.includes("KB")) return num * 1024;
  return num;
}

function fmt(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

const ADMIN_EMAIL = "emir.kalayci@gmail.com";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [events, setEvents] = useState<AnalyticsEventLog[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState<"all" | "24h" | "7d" | "30d">("all");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchLogs() {
      if (user?.email !== ADMIN_EMAIL) return;
      setFetching(true);
      try {
        const q = query(
          collection(db, "usage_logs"),
          orderBy("timestamp", "desc")
        );
        const eq = query(
          collection(db, "analytics_events"),
          orderBy("timestamp", "desc")
        );
        const [snapshot, esnapshot] = await Promise.all([
          getDocs(q),
          getDocs(eq),
        ]);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as UsageLog[];
        const edata = esnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AnalyticsEventLog[];
        setLogs(data);
        setEvents(edata);
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
  }, [user, loading, refreshKey]);

  // ─── Derived metrics ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = logs;

    // Time filter
    if (filter !== "all") {
      const cutoff = new Date();
      if (filter === "24h") cutoff.setHours(cutoff.getHours() - 24);
      if (filter === "7d") cutoff.setDate(cutoff.getDate() - 7);
      if (filter === "30d") cutoff.setDate(cutoff.getDate() - 30);
      result = result.filter((l) => {
        const ts = l.timestamp?.toDate ? l.timestamp.toDate() : new Date(l.timestamp);
        return ts >= cutoff;
      });
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.fileName?.toLowerCase().includes(q) ||
          l.userId?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [logs, filter, search]);

  const filteredEvents = useMemo(() => {
    let result = events;

    // Time filter
    if (filter !== "all") {
      const cutoff = new Date();
      if (filter === "24h") cutoff.setHours(cutoff.getHours() - 24);
      if (filter === "7d") cutoff.setDate(cutoff.getDate() - 7);
      if (filter === "30d") cutoff.setDate(cutoff.getDate() - 30);
      result = result.filter((e) => {
        const ts = e.timestamp?.toDate ? e.timestamp.toDate() : new Date(e.timestamp);
        return ts >= cutoff;
      });
    }

    return result;
  }, [events, filter]);

  const eventCounts = useMemo(() => {
    const counts: Record<string, number> = {
      file_loaded: 0,
      paywall_hit: 0,
      upgrade_click: 0,
      paywall_dismissed: 0,
      optimization_complete: 0,
      optimized_file_download: 0,
    };
    filteredEvents.forEach((e) => {
      if (e.event in counts) {
        counts[e.event]++;
      }
    });
    return counts;
  }, [filteredEvents]);

  const stats = useMemo(() => {
    const totalOriginal = filtered.reduce(
      (acc, l) => acc + parseSize(l.originalSize),
      0
    );
    const totalOptimized = filtered.reduce(
      (acc, l) => acc + parseSize(l.optimizedSize),
      0
    );
    const totalSaved = totalOriginal - totalOptimized;
    const uniqueUsers = new Set(filtered.map((l) => l.userId)).size;
    const avgRatio =
      filtered.length > 0
        ? Math.round(
            filtered.reduce((acc, l) => acc + (l.compressionRatio || 0), 0) /
              filtered.length
          )
        : 0;
    const best = filtered.reduce(
      (max, l) => (l.compressionRatio > max ? l.compressionRatio : max),
      0
    );

    // Per-day chart: last 14 days
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toLocaleDateString("en-US", { month: "short", day: "numeric" })] = 0;
    }
    filtered.forEach((l) => {
      const ts = l.timestamp?.toDate ? l.timestamp.toDate() : new Date(l.timestamp);
      const label = ts.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (label in days) days[label]++;
    });

    // Top files by bytes saved
    const topSaved = [...filtered]
      .map((l) => ({
        ...l,
        savedBytes: parseSize(l.originalSize) - parseSize(l.optimizedSize),
      }))
      .sort((a, b) => b.savedBytes - a.savedBytes)
      .slice(0, 5);

    return { totalOriginal, totalOptimized, totalSaved, uniqueUsers, avgRatio, best, days, topSaved };
  }, [filtered]);

  // ─── Loading / Auth guard ────────────────────────────────────────────
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

  const maxDay = Math.max(...Object.values(stats.days), 1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              {logs.length} total optimizations • live Firestore data
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://analytics.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              <BarChart3 className="w-4 h-4 text-orange-500" />
              GA4 Events
              <ArrowUpRight className="w-3 h-3 opacity-50" />
            </a>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <Link href="/" className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium">
              ← App
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<Zap className="w-5 h-5 text-[#00DDB3]" />}
            label="Total Optimizations"
            value={filtered.length.toLocaleString()}
            sub={`all time: ${logs.length}`}
            color="teal"
          />
          <KpiCard
            icon={<Users className="w-5 h-5 text-blue-500" />}
            label="Unique Users"
            value={stats.uniqueUsers.toLocaleString()}
            sub="logged-in only"
            color="blue"
          />
          <KpiCard
            icon={<TrendingDown className="w-5 h-5 text-emerald-500" />}
            label="Total Bytes Saved"
            value={fmt(stats.totalSaved)}
            sub={`from ${fmt(stats.totalOriginal)}`}
            color="green"
          />
          <KpiCard
            icon={<Flame className="w-5 h-5 text-orange-500" />}
            label="Avg Compression"
            value={`${stats.avgRatio}%`}
            sub={`best: ${stats.best}%`}
            color="orange"
          />
        </div>

        {/* Chart + Top Savers side by side */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Activity Chart — last 14 days */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
                Optimizations — Last 14 Days
              </h2>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-end gap-1.5 h-28">
              {Object.entries(stats.days).map(([label, count]) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full rounded-t-sm bg-[#00DDB3]/30 group-hover:bg-[#00DDB3]/60 transition-colors relative"
                    style={{ height: `${(count / maxDay) * 100}%`, minHeight: count > 0 ? "4px" : "2px" }}
                  >
                    {count > 0 && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#00DDB3] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {count}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-gray-400 rotate-45 origin-left mt-1 hidden sm:block">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 by bytes saved */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">
              Top Savings
            </h2>
            <div className="space-y-3">
              {stats.topSaved.length === 0 ? (
                <p className="text-xs text-gray-400">No data yet.</p>
              ) : (
                stats.topSaved.map((l, i) => (
                  <div key={l.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {l.fileName || "unknown"}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        saved {fmt(l.savedBytes)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#00DDB3] flex-shrink-0">
                      {l.compressionRatio}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* GA4 Event Summary Panel */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm">GA4 Event Tracking</h2>
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">Live</span>
            </div>
            <a
              href="https://analytics.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#00DDB3] hover:underline flex items-center gap-1"
            >
              Open GA4 <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { event: "file_loaded", label: "Files Loaded", icon: <FileJson className="w-4 h-4" />, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
              { event: "paywall_hit", label: "Paywall Hits", icon: <AlertCircle className="w-4 h-4" />, color: "text-red-500 bg-red-50 dark:bg-red-900/20" },
              { event: "upgrade_click", label: "Upgrade Clicks", icon: <TrendingUp className="w-4 h-4" />, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
              { event: "paywall_dismissed", label: "Dismissed", icon: <AlertCircle className="w-4 h-4" />, color: "text-gray-500 bg-gray-50 dark:bg-gray-800" },
              { event: "optimization_complete", label: "Optimized", icon: <Zap className="w-4 h-4" />, color: "text-[#00DDB3] bg-[#00DDB3]/10" },
              { event: "optimized_file_download", label: "Downloads", icon: <Download className="w-4 h-4" />, color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20" },
            ].map((e) => (
              <div key={e.event} className={`rounded-xl p-4 flex flex-col justify-between ${e.color.split(" ")[1]}`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`p-1.5 rounded-lg bg-white/50 dark:bg-black/20 ${e.color.split(" ")[0]}`}>
                      {e.icon}
                    </span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {(eventCounts[e.event] || 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{e.label}</p>
                </div>
                <p className="text-[10px] text-gray-400 font-mono mt-2">{e.event}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            These events are tracked in real-time via Google Analytics 4. View counts, funnel drop-off, and paywall conversion rate at{" "}
            <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-[#00DDB3] hover:underline">
              analytics.google.com
            </a>{" "}
            → Reports → Engagement → Events.
          </p>
        </div>

        {/* Filters + Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              {(["all", "24h", "7d", "30d"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filter === f
                      ? "bg-[#00DDB3] text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {f === "all" ? "All time" : f === "24h" ? "Last 24h" : f === "7d" ? "Last 7d" : "Last 30d"}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search by filename or user ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00DDB3]/40 w-56"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">File Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Original</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Optimized</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Saved</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                      No logs match your filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => {
                    const savedBytes = parseSize(log.originalSize) - parseSize(log.optimizedSize);
                    return (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-6 py-3.5 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                          {log.timestamp?.toDate
                            ? log.timestamp.toDate().toLocaleString()
                            : log.timestamp
                            ? new Date(log.timestamp).toLocaleString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-900 dark:text-white max-w-[180px] truncate" title={log.fileName}>
                          <span className="flex items-center gap-1.5">
                            <FileJson className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            {log.fileName || "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {log.originalSize}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-sm text-[#00DDB3] font-semibold">
                          {log.optimizedSize}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#00DDB3]/10 text-[#00DDB3]">
                              −{log.compressionRatio}%
                            </span>
                            <span className="text-xs text-gray-400 hidden sm:inline">
                              {fmt(savedBytes)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-xs text-gray-400 font-mono">
                          {log.userId?.slice(0, 10)}…
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <span>{filtered.length} rows shown</span>
            <span>Total data saved: {fmt(stats.totalSaved)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── KPI Card Component ──────────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: "teal" | "blue" | "green" | "orange";
}) {
  const border = {
    teal: "border-[#00DDB3]/30",
    blue: "border-blue-200 dark:border-blue-800/30",
    green: "border-emerald-200 dark:border-emerald-800/30",
    orange: "border-orange-200 dark:border-orange-800/30",
  }[color];

  return (
    <div className={`bg-white dark:bg-gray-900 border ${border} rounded-2xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
