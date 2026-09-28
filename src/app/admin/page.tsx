"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  startAfter,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
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
  Crown,
  CheckCircle2,
  Search,
  Check,
  UserX,
  Sparkles,
  Edit3,
  X,
  Receipt,
  HelpCircle,
  Share2,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  isAdminUser,
  isInternalUser,
  classifyUserActivity,
  ActivitySegment,
  ProOriginType,
  PRO_ORIGIN_CONFIG,
} from "@/lib/config/internal-accounts";
import { GrowthInsightsView } from "@/components/admin/GrowthInsightsView";

interface UsageLog {
  id: string;
  userId: string;
  fileName?: string;
  format?: string;
  originalSize: string;
  optimizedSize: string;
  compressionRatio: number;
  status?: string;
  timestamp: any;
}

interface AnalyticsEventLog {
  id: string;
  event: string;
  timestamp: any;
}

interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isPro: boolean;
  proOrigin?: ProOriginType;
  proOriginNotes?: string;
  proOriginVerifiedAt?: string;
  proOriginVerifiedBy?: string;
  lemonSqueezyOrderId?: string;
  createdAt: string;
  lastSignInTime: string;
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

function formatLogName(log: UsageLog): string {
  if (log.fileName) {
    const ext = log.fileName.includes(".") ? log.fileName.split(".").pop() : "json";
    const base = log.fileName.replace(/\.[^/.]+$/, "");
    if (base.length > 20) {
      return `${base.slice(0, 12)}…${base.slice(-4)}.${ext}`;
    }
    return log.fileName;
  }
  return `${(log.format || "json").toUpperCase()} animation`;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"insights" | "analytics" | "users">("insights");

  // Analytics & Logs state
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [events, setEvents] = useState<AnalyticsEventLog[]>([]);
  const [fetchingLogs, setFetchingLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "24h" | "7d" | "30d">("all");
  const [activitySegment, setActivitySegment] = useState<ActivitySegment>("external");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Users management state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState<
    "all" | "sales" | "manual_sales" | "promo" | "unverified" | "pro" | "free"
  >("all");
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  // Safe Origin Classification Modal State
  const [editingOriginUser, setEditingOriginUser] = useState<AdminUser | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<ProOriginType>("historical_manual_sale");
  const [originNotes, setOriginNotes] = useState("");
  const [savingOrigin, setSavingOrigin] = useState(false);

  const isAdmin = user ? isAdminUser(user.uid) : false;

  // Fetch Usage Logs & Analytics whenever user is Admin (for Growth Insights & Analytics tabs)
  useEffect(() => {
    async function fetchLogs() {
      if (!isAdmin) return;
      setFetchingLogs(true);
      setError(null);
      try {
        // Strict 14 complete UTC days timestamp range for growth analytics
        const now = new Date();
        const todayMidnightUTC = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            0,
            0,
            0,
            0
          )
        );
        const priorPeriodStart = new Date(
          todayMidnightUTC.getTime() - 14 * 86400000
        );
        const minTimestamp = Timestamp.fromDate(priorPeriodStart);

        // Fetch usage logs (all recent logs up to 500)
        const q = query(
          collection(db, "usage_logs"),
          orderBy("timestamp", "desc"),
          limit(500)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as UsageLog[];

        // Paginated indexed range query for analytics_events covering the entire 14-day reporting window
        const edata: AnalyticsEventLog[] = [];
        let lastVisibleDoc: any = null;
        let keepPaging = true;

        while (keepPaging) {
          const eq = lastVisibleDoc
            ? query(
                collection(db, "analytics_events"),
                where("timestamp", ">=", minTimestamp),
                orderBy("timestamp", "desc"),
                startAfter(lastVisibleDoc),
                limit(500)
              )
            : query(
                collection(db, "analytics_events"),
                where("timestamp", ">=", minTimestamp),
                orderBy("timestamp", "desc"),
                limit(500)
              );

          const esnapshot = await getDocs(eq);
          if (esnapshot.empty) break;

          esnapshot.docs.forEach((doc) => {
            edata.push({ id: doc.id, ...doc.data() } as AnalyticsEventLog);
          });

          if (esnapshot.docs.length < 500) {
            keepPaging = false;
          } else {
            lastVisibleDoc = esnapshot.docs[esnapshot.docs.length - 1];
          }
        }

        setLogs(data);
        setEvents(edata);
      } catch (err: any) {
        console.error("Error fetching logs:", err);
        setError(err.message || String(err));
      } finally {
        setFetchingLogs(false);
      }
    }

    if (!loading && isAdmin) {
      fetchLogs();
    }
  }, [isAdmin, loading, refreshKey]);

  // Fetch Users for Users Tab
  const fetchUsers = async () => {
    if (!isAdmin) return;
    setFetchingUsers(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch users");
      }

      const data = await res.json();
      setAdminUsers(data.users || []);
    } catch (err: any) {
      console.error("Failed to load users:", err);
      toast.error(err.message || "Failed to load users list");
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    if (!loading && isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, loading, refreshKey]);

  // Toggle User PRO Status
  const handleTogglePro = async (targetUser: AdminUser) => {
    const newStatus = !targetUser.isPro;
    setUpdatingUid(targetUser.uid);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        toast.error("Session expired. Please re-login.");
        return;
      }

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: targetUser.uid,
          isPro: newStatus,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Action failed");
      }

      // Optimistic update
      setAdminUsers((prev) =>
        prev.map((u) =>
          u.uid === targetUser.uid ? { ...u, isPro: newStatus } : u
        )
      );

      if (newStatus) {
        toast.success(`🎉 ${targetUser.email || "User"} is now PRO!`);
      } else {
        toast.info(`ℹ️ ${targetUser.email || "User"} set to Free tier.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingUid(null);
    }
  };

  // Open Safe Classification Modal
  const openClassifyModal = (targetUser: AdminUser) => {
    setEditingOriginUser(targetUser);
    setSelectedOrigin(targetUser.proOrigin || "historical_manual_sale");
    setOriginNotes(targetUser.proOriginNotes || "");
  };

  // Save Entitlement Origin Classification (Safe admin-only mechanism, does not touch isPro)
  const handleSaveOrigin = async () => {
    if (!editingOriginUser) return;
    setSavingOrigin(true);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        toast.error("Session expired. Please re-login.");
        return;
      }

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: editingOriginUser.uid,
          proOrigin: selectedOrigin,
          notes: originNotes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update origin");
      }

      // Optimistic update in adminUsers state
      setAdminUsers((prev) =>
        prev.map((u) =>
          u.uid === editingOriginUser.uid
            ? {
                ...u,
                proOrigin: selectedOrigin,
                proOriginNotes: originNotes,
                proOriginVerifiedAt: new Date().toISOString(),
                proOriginVerifiedBy: user?.email || "admin",
              }
            : u
        )
      );

      toast.success(`Updated origin for ${editingOriginUser.email || "user"}`);
      setEditingOriginUser(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update origin");
    } finally {
      setSavingOrigin(false);
    }
  };

  // ─── Derived metrics ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = logs;

    // Filter by activity segment
    if (activitySegment === "external") {
      result = result.filter((l) => !isInternalUser(l.userId));
    } else if (activitySegment === "internal") {
      result = result.filter((l) => isInternalUser(l.userId));
    }

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

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.fileName?.toLowerCase().includes(q) ||
          l.format?.toLowerCase().includes(q) ||
          l.userId?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [logs, filter, activitySegment, search]);

  const filteredEvents = useMemo(() => {
    let result = events;

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

  const shareCounts = useMemo(() => {
    let pngDownloaded = 0;
    let captionCopied = 0;
    let nativeShareCompleted = 0;
    let nativeShareCancelled = 0;

    filteredEvents.forEach((e: any) => {
      if (e.event === "optimization_result_shared") {
        if (e.action === "download_png") pngDownloaded++;
        else if (e.action === "copy_caption") captionCopied++;
        else if (e.action === "native_share_completed" || e.action === "native_share") nativeShareCompleted++;
        else if (e.action === "native_share_cancelled") nativeShareCancelled++;
      }
    });

    return {
      pngDownloaded,
      captionCopied,
      nativeShareCompleted,
      nativeShareCancelled,
      totalInitiated: pngDownloaded + captionCopied + nativeShareCompleted,
    };
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
    const uniqueUserIds = new Set(
      filtered
        .map((l) => l.userId)
        .filter((uid) => uid && uid !== "unknown" && uid !== "anonim")
    );
    const uniqueUsers = uniqueUserIds.size;
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

    // 14-day daily chart respects activity segment for full 14-day context
    const baseForChart = logs.filter((l) => {
      if (activitySegment === "external") return !isInternalUser(l.userId);
      if (activitySegment === "internal") return isInternalUser(l.userId);
      return true;
    });

    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toLocaleDateString("en-US", { month: "short", day: "numeric" })] = 0;
    }
    baseForChart.forEach((l) => {
      const ts = l.timestamp?.toDate ? l.timestamp.toDate() : new Date(l.timestamp);
      const label = ts.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (label in days) days[label]++;
    });

    const topSaved = [...filtered]
      .map((l) => ({
        ...l,
        savedBytes: parseSize(l.originalSize) - parseSize(l.optimizedSize),
      }))
      .sort((a, b) => b.savedBytes - a.savedBytes)
      .slice(0, 5);

    return { totalOriginal, totalOptimized, totalSaved, uniqueUsers, avgRatio, best, days, topSaved };
  }, [filtered, logs, activitySegment]);

  // Derived Sales & Entitlement Metrics
  const salesMetrics = useMemo(() => {
    let totalVerifiedSales = 0;
    let historicalManualSales = 0;
    let automatedSales = 0;
    let complimentaryGrants = 0;
    let internalTests = 0;
    let unknownOrigins = 0;

    adminUsers.forEach((u) => {
      if (!u.isPro) return;
      if (u.proOrigin === "historical_manual_sale") {
        historicalManualSales++;
        totalVerifiedSales++;
      } else if (u.proOrigin === "automated_sale") {
        automatedSales++;
        totalVerifiedSales++;
      } else if (u.proOrigin === "complimentary_grant") {
        complimentaryGrants++;
      } else if (u.proOrigin === "internal_test") {
        internalTests++;
      } else {
        unknownOrigins++;
      }
    });

    return {
      totalVerifiedSales,
      historicalManualSales,
      automatedSales,
      complimentaryGrants,
      internalTests,
      unknownOrigins,
    };
  }, [adminUsers]);

  // Derived Users
  const filteredUsers = useMemo(() => {
    let list = adminUsers;

    if (userFilter === "sales") {
      list = list.filter(
        (u) =>
          u.isPro &&
          (u.proOrigin === "historical_manual_sale" || u.proOrigin === "automated_sale")
      );
    } else if (userFilter === "manual_sales") {
      list = list.filter((u) => u.isPro && u.proOrigin === "historical_manual_sale");
    } else if (userFilter === "promo") {
      list = list.filter((u) => u.isPro && u.proOrigin === "complimentary_grant");
    } else if (userFilter === "unverified") {
      list = list.filter((u) => u.isPro && (!u.proOrigin || u.proOrigin === "unknown"));
    } else if (userFilter === "pro") {
      list = list.filter((u) => u.isPro);
    } else if (userFilter === "free") {
      list = list.filter((u) => !u.isPro);
    }

    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      list = list.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.displayName.toLowerCase().includes(q) ||
          u.uid.toLowerCase().includes(q) ||
          u.proOriginNotes?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [adminUsers, userFilter, userSearch]);

  const proCount = adminUsers.filter((u) => u.isPro).length;
  const freeCount = adminUsers.length - proCount;

  // ─── Loading / Auth guard ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-[#00DDB3]" />
      </div>
    );
  }

  if (!isAdmin) {
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
              Manage TinyLottie users, PRO subscriptions, and monitor optimization performance
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
              onClick={() => {
                setRefreshKey((k) => k + 1);
                fetchUsers();
              }}
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

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("insights")}
            className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "insights"
                ? "border-[#00DDB3] text-[#00DDB3]"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Growth Insights
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#00DDB3]/15 text-[#00DDB3]">
              Weekly
            </span>
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "analytics"
                ? "border-[#00DDB3] text-[#00DDB3]"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Usage & Analytics
            <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {logs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "users"
                ? "border-[#00DDB3] text-[#00DDB3]"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            Users & PRO Management
            <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {adminUsers.length}
            </span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* GROWTH INSIGHTS TAB */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "insights" && (
          <GrowthInsightsView
            logs={logs}
            events={events}
            adminUsers={adminUsers}
            salesMetrics={salesMetrics}
            shareCounts={shareCounts}
            loading={fetchingLogs || fetchingUsers}
          />
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* USERS & PRO MANAGEMENT TAB */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Top KPI Cards - Overview & Verified Sales */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Total Registered
                  </span>
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{adminUsers.length}</p>
                <p className="text-xs text-gray-400 mt-1">Google Auth accounts</p>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-[#00DDB3]/30 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Active PRO Members
                  </span>
                  <Crown className="w-5 h-5 text-[#00DDB3]" />
                </div>
                <p className="text-2xl font-bold text-[#00DDB3]">{proCount}</p>
                <p className="text-xs text-gray-400 mt-1">{((proCount / (adminUsers.length || 1)) * 100).toFixed(1)}% total conversion rate</p>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-emerald-500/40 dark:border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden bg-gradient-to-br from-emerald-500/5 to-transparent">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                    Total Verified Sales
                  </span>
                  <Receipt className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{salesMetrics.totalVerifiedSales}</p>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-400/70 mt-1">
                  {salesMetrics.historicalManualSales} manual + {salesMetrics.automatedSales} automated
                </p>
              </div>
            </div>

            {/* Sub-KPI Row: Detailed Entitlement Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3.5">
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Historical Manual Sales
                </p>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {salesMetrics.historicalManualSales}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Verified
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Fulfilled via manual coupon</p>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3.5">
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Automated Sales
                </p>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {salesMetrics.automatedSales}
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                    Lemon Squeezy
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Direct checkout orders</p>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3.5">
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Complimentary / Promo
                </p>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {salesMetrics.complimentaryGrants}
                  </span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                    Courtesy
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Partners & promotional grants</p>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3.5">
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Internal & Unverified
                </p>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {salesMetrics.internalTests + salesMetrics.unknownOrigins}
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                    {salesMetrics.internalTests} test / {salesMetrics.unknownOrigins} unverified
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Exempt from sales metrics</p>
              </div>
            </div>

            {/* User List Table Panel */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xs">
              {/* Toolbar */}
              <div className="flex items-center justify-between flex-wrap gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center flex-wrap gap-2">
                  {(
                    [
                      { id: "all", label: `All Users (${adminUsers.length})` },
                      { id: "sales", label: `Verified Sales (${salesMetrics.totalVerifiedSales})` },
                      { id: "manual_sales", label: `Manual Sales (${salesMetrics.historicalManualSales})` },
                      { id: "promo", label: `Promo / Grants (${salesMetrics.complimentaryGrants})` },
                      { id: "unverified", label: `Unverified PRO (${salesMetrics.unknownOrigins})` },
                      { id: "pro", label: `All PRO (${proCount})` },
                      { id: "free", label: `Free (${freeCount})` },
                    ] as const
                  ).map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setUserFilter(btn.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        userFilter === btn.id
                          ? "bg-[#00DDB3] text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by email, name, or coupon notes…"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00DDB3]/40 w-72"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Entitlement Origin</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined Date</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Sign In</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {fetchingUsers ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#00DDB3] mb-2" />
                          Loading users...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                          No users found matching your filter or search.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isUpdating = updatingUid === u.uid;
                        const initial = (u.displayName || u.email || "U").charAt(0).toUpperCase();

                        return (
                          <tr key={u.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                            {/* User details */}
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                {u.photoURL ? (
                                  <img
                                    src={u.photoURL}
                                    alt=""
                                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-[#00DDB3]/10 text-[#00DDB3] font-bold text-xs flex items-center justify-center border border-[#00DDB3]/20">
                                    {initial}
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {u.displayName || "Google User"}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                    {u.email}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Entitlement Origin */}
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              {u.isPro ? (
                                (() => {
                                  const originKey = u.proOrigin || "unknown";
                                  const cfg = PRO_ORIGIN_CONFIG[originKey] || PRO_ORIGIN_CONFIG.unknown;
                                  return (
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.badgeColor}`}
                                        title={u.proOriginNotes || cfg.description}
                                      >
                                        {cfg.shortLabel}
                                      </span>
                                      <button
                                        onClick={() => openClassifyModal(u)}
                                        title="Classify entitlement origin"
                                        className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      {u.proOriginNotes && (
                                        <span className="text-[10px] text-gray-400 max-w-[140px] truncate" title={u.proOriginNotes}>
                                          {u.proOriginNotes}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })()
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>

                            {/* Registered Date */}
                            <td className="px-6 py-3.5 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString("tr-TR") : "-"}
                            </td>

                            {/* Last Sign in */}
                            <td className="px-6 py-3.5 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                              {u.lastSignInTime ? new Date(u.lastSignInTime).toLocaleDateString("tr-TR") : "-"}
                            </td>

                            {/* Status badge */}
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              {u.isPro ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#00DDB3]/15 text-[#00B894] dark:text-[#00DDB3] border border-[#00DDB3]/30">
                                  <Crown className="w-3.5 h-3.5" />
                                  PRO
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                  Free
                                </span>
                              )}
                            </td>

                            {/* Action Buttons */}
                            <td className="px-6 py-3.5 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {u.isPro && (
                                  <button
                                    onClick={() => openClassifyModal(u)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    Origin
                                  </button>
                                )}
                                <button
                                  onClick={() => handleTogglePro(u)}
                                  disabled={isUpdating}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                                    u.isPro
                                      ? "bg-gray-100 hover:bg-red-50 hover:text-red-600 dark:bg-gray-800 dark:hover:bg-red-950/30 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                                      : "bg-[#00DDB3] hover:bg-[#00C9A7] text-white"
                                  } disabled:opacity-50`}
                                >
                                  {isUpdating ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : u.isPro ? (
                                    <>
                                      <UserX className="w-3.5 h-3.5" />
                                      Make Free
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-3.5 h-3.5" />
                                      Make PRO
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 flex-wrap gap-2">
                <span>{filteredUsers.length} users shown</span>
                <span>
                  {proCount} PRO ({salesMetrics.totalVerifiedSales} verified sales) / {freeCount} Free
                </span>
              </div>
            </div>

            {/* Safe Entitlement Origin Classification Modal */}
            {editingOriginUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-[#00DDB3]" />
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">
                        Classify Entitlement Origin
                      </h3>
                    </div>
                    <button
                      onClick={() => setEditingOriginUser(null)}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-xs space-y-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        User: {editingOriginUser.displayName || "User"} ({editingOriginUser.email})
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 font-mono text-[10px]">
                        UID: {editingOriginUser.uid}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300">
                      <strong>Safe classification mechanism:</strong> This classifies revenue and growth reporting origin. It does <strong>NOT</strong> revoke, downgrade, or alter the user&apos;s active PRO feature access.
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Select Entitlement Origin:
                      </label>
                      <div className="space-y-2">
                        {(
                          [
                            {
                              type: "historical_manual_sale",
                              label: "Historical Manual Sale",
                              badge: "Paid Sale",
                              desc: "Verified customer payment fulfilled via manual coupon code or invoice.",
                            },
                            {
                              type: "automated_sale",
                              label: "Automated Sale",
                              badge: "Paid Sale",
                              desc: "Customer checkout processed automatically via Lemon Squeezy.",
                            },
                            {
                              type: "complimentary_grant",
                              label: "Complimentary / Promo Grant",
                              badge: "Non-Revenue",
                              desc: "Promotional giveaway, courtesy, or partner lifetime access grant.",
                            },
                            {
                              type: "internal_test",
                              label: "Internal / Test Account",
                              badge: "Internal",
                              desc: "Founder, developer, or automated testing account.",
                            },
                            {
                              type: "unknown",
                              label: "Unknown Origin",
                              badge: "Unverified",
                              desc: "Historical entitlement awaiting independent verification.",
                            },
                          ] as const
                        ).map((opt) => (
                          <label
                            key={opt.type}
                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              selectedOrigin === opt.type
                                ? "border-[#00DDB3] bg-[#00DDB3]/5 dark:bg-[#00DDB3]/10"
                                : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                            }`}
                          >
                            <input
                              type="radio"
                              name="originType"
                              value={opt.type}
                              checked={selectedOrigin === opt.type}
                              onChange={() => setSelectedOrigin(opt.type)}
                              className="mt-0.5 accent-[#00DDB3]"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                  {opt.label}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    opt.badge === "Paid Sale"
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                      : opt.badge === "Internal"
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                  }`}
                                >
                                  {opt.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                {opt.desc}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Notes / Verification Source:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Paid customer, coupon PRO-5695B9C1"
                        value={originNotes}
                        onChange={(e) => setOriginNotes(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00DDB3]/40"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => setEditingOriginUser(null)}
                      disabled={savingOrigin}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveOrigin}
                      disabled={savingOrigin}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#00DDB3] hover:bg-[#00C9A7] text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
                    >
                      {savingOrigin ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Save Classification
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* USAGE & ANALYTICS TAB */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "analytics" && (
          fetchingLogs && logs.length === 0 ? (
            <div className="py-24 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#00DDB3] mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading analytics & logs...</p>
            </div>
          ) : (
          <div className="space-y-6">
            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-400">Database Query Failed</h3>
                  <p className="text-xs text-red-700 dark:text-red-300/80 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                icon={<Zap className="w-5 h-5 text-[#00DDB3]" />}
                label="Total Optimizations"
                value={filtered.length.toLocaleString()}
                sub={
                  activitySegment === "external"
                    ? `external users (${filter === "all" ? "all time" : filter})`
                    : activitySegment === "internal"
                    ? `internal tests (${filter === "all" ? "all time" : filter})`
                    : `all activity (${filter === "all" ? "all time" : filter})`
                }
                color="teal"
              />
              <KpiCard
                icon={<Users className="w-5 h-5 text-blue-500" />}
                label="Unique Logged-In Users"
                value={stats.uniqueUsers.toLocaleString()}
                sub={
                  activitySegment === "external"
                    ? "verified external accounts"
                    : activitySegment === "internal"
                    ? "internal test accounts"
                    : "all accounts"
                }
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
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
                      Daily Optimizations — Last 14 Days
                    </h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {activitySegment === "external" ? "External user volume" : activitySegment === "internal" ? "Internal testing volume" : "All traffic volume"} · Peak: {maxDay} opt/day
                    </p>
                  </div>
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-end gap-1.5 h-32 pt-4">
                  {Object.entries(stats.days).map(([label, count]) => {
                    const barHeightPct = count > 0 ? Math.max(14, Math.round((count / maxDay) * 100)) : 2;
                    return (
                      <div key={label} className="flex-1 flex flex-col items-center gap-1 group">
                        <div
                          className={`w-full rounded-t-sm transition-all relative ${
                            count > 0
                              ? "bg-[#00DDB3]/60 group-hover:bg-[#00DDB3]"
                              : "bg-gray-100 dark:bg-gray-800"
                          }`}
                          style={{ height: `${barHeightPct}%`, minHeight: count > 0 ? "8px" : "2px" }}
                        >
                          {count > 0 && (
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#00DDB3] opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {count}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-gray-400 rotate-45 origin-left mt-1 hidden sm:block">
                          {label}
                        </span>
                      </div>
                    );
                  })}
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
                            {formatLogName(l)}
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

            {/* Event Telemetry Summary Panel */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-orange-500" />
                    <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
                      Event Telemetry (Firestore Client Events)
                    </h2>
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">
                      Rolling Buffer (Last 200 events)
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Direct client event logs from Firestore. Cross-reference with Google Analytics 4 for external visitor attribution.
                  </p>
                </div>
                <a
                  href="https://analytics.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#00DDB3] hover:underline flex items-center gap-1 font-medium"
                >
                  Open GA4 Console <ArrowUpRight className="w-3 h-3" />
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

              {/* Share & Organic Distribution Breakdown */}
              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-[#00DDB3]" />
                      Share & Distribution Actions
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      User-initiated export and share actions (Local exports & share sheets — not confirmed published posts)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl p-3.5 bg-sky-500/10 border border-sky-500/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="p-1 rounded-md bg-sky-500/20 text-sky-400">
                        <Download className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {shareCounts.pngDownloaded.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">PNG Downloaded</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">download_png</p>
                  </div>

                  <div className="rounded-xl p-3.5 bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="p-1 rounded-md bg-amber-500/20 text-amber-400">
                        <Copy className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {shareCounts.captionCopied.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Caption Copied</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">copy_caption</p>
                  </div>

                  <div className="rounded-xl p-3.5 bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                        <Share2 className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {shareCounts.nativeShareCompleted.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Native Share Completed</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">native_share_completed</p>
                  </div>

                  <div className="rounded-xl p-3.5 bg-gray-500/10 border border-gray-500/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="p-1 rounded-md bg-gray-500/20 text-gray-400">
                        <X className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {shareCounts.nativeShareCancelled.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Native Share Cancelled</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">native_share_cancelled</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters + Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center flex-wrap gap-2">
                  {/* Activity Segment Switcher */}
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg mr-2">
                    {(
                      [
                        { id: "all", label: "All Activity" },
                        { id: "external", label: "External Activity" },
                        { id: "internal", label: "Internal / Test" },
                      ] as const
                    ).map((seg) => (
                      <button
                        key={seg.id}
                        onClick={() => setActivitySegment(seg.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                          activitySegment === seg.id
                            ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        {seg.label}
                      </button>
                    ))}
                  </div>

                  {/* Time Range Filter */}
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
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">File / Format</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Original</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Optimized</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Saved</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User ID & Type</th>
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
                            <td className="px-6 py-3.5 text-sm text-gray-900 dark:text-white max-w-[200px] truncate" title={log.fileName || log.format || "Animation"}>
                              <span className="flex items-center gap-1.5">
                                <FileJson className="w-3.5 h-3.5 text-[#00DDB3] flex-shrink-0" />
                                {formatLogName(log)}
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
                            <td className="px-6 py-3.5 whitespace-nowrap text-xs font-mono">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">
                                  {log.userId && log.userId !== "unknown"
                                    ? `${log.userId.slice(0, 6)}…${log.userId.slice(-4)}`
                                    : "unknown"}
                                </span>
                                {isInternalUser(log.userId) ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                    Test
                                  </span>
                                ) : log.userId && log.userId !== "unknown" ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                    External
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-500 dark:bg-gray-800">
                                    Unknown
                                  </span>
                                )}
                              </div>
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
          )
        )}

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
