"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "motion/react";
import { Key, LogOut, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ProfilePage() {
  const { user, isPro, loading, logout, refreshProStatus } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [isActivating, setIsActivating] = useState(false);

  const handleActivate = async () => {
    // --- Boş kod kontrolü ---
    if (!couponCode.trim()) {
      alert("Geçersiz kod! Lütfen bir kod girin.");
      return;
    }
    if (!user) return;

    setIsActivating(true);
    try {
      // Get the user's current ID token to send to the server for secure verification
      // Force-refresh ensures we get a valid token even right after login
      const idToken = await auth.currentUser?.getIdToken(true);
      if (!idToken) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      const res = await fetch("/api/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ code: couponCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 404 = invalid / already redeemed → native alert
        if (res.status === 404) {
          alert("Geçersiz kod! Kod bulunamadı veya daha önce kullanılmış.");
        } else {
          toast.error(data.error || "Activation failed.");
        }
        return;
      }

      // Refresh context so isPro badge and file-size gate update immediately
      await refreshProStatus();
      toast.success("🎉 TinyLottie PRO successfully activated!");
      setCouponCode("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to activate code. Please try again later.");
    } finally {
      setIsActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00DDB3]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
        <User className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Login Required</h1>
        <p className="text-gray-500 mb-6 text-center max-w-sm">Please log in to view your profile and manage your PRO status.</p>
        <Link href="/" className="px-6 py-2.5 bg-[#00DDB3] hover:bg-[#00C9A7] text-white rounded-lg font-medium transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 relative overflow-hidden">
      {/* Visual Glints */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00DDB3]/10 dark:bg-[#00DDB3]/5 rounded-full blur-3xl" />
      </div>

      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white hover:opacity-80 transition-opacity">
              &larr; Back to App
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 pb-10 border-b border-gray-200 dark:border-gray-800">
             <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-gray-100 dark:border-gray-800" />
             <div className="text-center sm:text-left flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{user.displayName || "Lottie User"}</h1>
                <p className="text-gray-500 font-medium mb-3">{user.email}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  {isPro ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00DDB3]/10 text-[#00DDB3] font-bold rounded-full text-sm">
                      <ShieldCheck className="w-4 h-4" /> TinyLottie PRO Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-full text-sm">
                      Free Tier (5MB Limit)
                    </span>
                  )}
                  <button onClick={logout} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                     <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
             </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pro License Activation</h2>
            
            {isPro ? (
               <div className="p-6 bg-gradient-to-br from-[#00DDB3]/20 to-[#00C9A7]/20 rounded-2xl border border-[#00DDB3]/30">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">You have Lifetime PRO! 🎉</h3>
                  <p className="text-gray-600 dark:text-gray-300">Your account is fully unlocked forever. You can now optimize massive JSON and dotLottie files without any bounds.</p>
               </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                       Buy a License Code
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Purchase a lifetime PRO code to remove all limits forever.</p>
                    <a
                      href="https://www.shopier.com/themirproject/46280901"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center w-full px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold transition-transform hover:scale-[1.02]"
                    >
                      Upgrade to Pro
                    </a>
                  </div>

                  <div className="p-6 bg-[#00DDB3]/5 rounded-2xl border border-[#00DDB3]/20">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                       <Key className="w-4 h-4 text-[#00DDB3]" /> Enter Coupon Code
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Paste the PRO-XXXX code you received after checkout.</p>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="PRO-XXXX"
                        className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#00DDB3]/50 dark:text-white text-sm"
                      />
                       <button
                        onClick={handleActivate}
                        disabled={isActivating || !couponCode.trim()}
                        className="shrink-0 w-full sm:w-[160px] px-4 py-2.5 bg-[#00DDB3] hover:bg-[#00C9A7] text-white rounded-lg font-bold transition-all disabled:opacity-50 text-sm flex items-center justify-center overflow-hidden"
                      >
                        {isActivating ? (
                          <div className="flex items-center gap-2">
                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                             <span className="whitespace-nowrap">Verifying...</span>
                          </div>
                        ) : "Activate Pro"}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
