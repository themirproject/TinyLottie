"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "motion/react";
import { Key, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

function LogoutScreen({ countdown, setCountdown, router }: { countdown: number; setCountdown: (n: number) => void; router: any }) {
  useEffect(() => {
    if (countdown <= 0) {
      router.push("/");
      return;
    }
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, router, setCountdown]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        {/* SVG Illustration */}
        <div className="mb-8">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background circle */}
            <circle cx="60" cy="60" r="56" fill="#00DDB3" fillOpacity="0.08" />
            {/* Door frame */}
            <rect x="34" y="28" width="38" height="66" rx="4" stroke="#CBD5E1" strokeWidth="2.5" fill="white" className="dark:fill-gray-900" />
            {/* Door panel lines */}
            <rect x="40" y="35" width="26" height="22" rx="2" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1.5" />
            <rect x="40" y="64" width="26" height="22" rx="2" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1.5" />
            {/* Doorknob */}
            <circle cx="64" cy="62" r="3" fill="#CBD5E1" />
            {/* Person waving outside the door */}
            {/* Head */}
            <circle cx="88" cy="44" r="8" fill="#00DDB3" fillOpacity="0.2" stroke="#00DDB3" strokeWidth="2" />
            <circle cx="86" cy="43" r="1.5" fill="#00DDB3" />
            <circle cx="90" cy="43" r="1.5" fill="#00DDB3" />
            <path d="M85 47 Q88 50 91 47" stroke="#00DDB3" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Body */}
            <path d="M88 52 L88 70" stroke="#00DDB3" strokeWidth="2.5" strokeLinecap="round" />
            {/* Waving arm */}
            <motion.path
              d="M88 56 Q96 48 100 44"
              stroke="#00DDB3"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              animate={{ rotate: [0, 15, -10, 15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ originX: "88px", originY: "56px" }}
            />
            {/* Other arm */}
            <path d="M88 56 L82 63" stroke="#00DDB3" strokeWidth="2.5" strokeLinecap="round" />
            {/* Legs */}
            <path d="M88 70 L84 82" stroke="#00DDB3" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M88 70 L92 82" stroke="#00DDB3" strokeWidth="2.5" strokeLinecap="round" />
            {/* Floor line */}
            <line x1="26" y1="94" x2="94" y2="94" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">See you soon! 👋</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          You've been logged out. Redirecting you to the home page in{" "}
          <span className="font-bold text-[#00DDB3]">{countdown}</span>
          {" "}second{countdown !== 1 ? "s" : ""}...
        </p>

        {/* Progress bar */}
        <div className="w-48 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-6">
          <motion.div
            className="h-full bg-[#00DDB3] rounded-full"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 5, ease: "linear" }}
          />
        </div>

        <Link href="/" className="text-sm text-gray-400 hover:text-[#00DDB3] transition-colors font-medium">
          Go now →
        </Link>
      </motion.div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isPro, loading, logout, refreshProStatus } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const handleActivate = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code.");
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
          toast.error("Invalid or already redeemed coupon code.");
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
      <LogoutScreen countdown={countdown} setCountdown={setCountdown} router={router} />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        Buy a License Code
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Purchase a lifetime PRO code to remove all limits forever.</p>
                    </div>
                    
                    <div className="flex flex-col gap-3 mt-auto">
                      {/* Price display — identical height to the input on the right */}
                      <div className="w-full h-11 px-4 flex items-center justify-between">
                         <span className="font-bold text-gray-900 dark:text-white text-sm">$39</span>
                         <span className="text-xs font-medium text-gray-500">Lifetime Access</span>
                      </div>
                      <a
                        href="https://www.shopier.com/themirproject/46280901"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center h-11 w-full px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold transition-transform hover:scale-[1.02]"
                      >
                        Upgrade to Pro
                      </a>
                    </div>
                  </div>

                  <div className="p-6 bg-[#00DDB3]/5 rounded-2xl border border-[#00DDB3]/20 flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                         <Key className="w-4 h-4 text-[#00DDB3]" /> Enter Coupon Code
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Paste the PRO-XXXX code you received after checkout.</p>
                    </div>
                    
                    <div className="flex flex-col gap-3 mt-auto">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="PRO-XXXX"
                        className="w-full h-11 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 outline-none focus:ring-2 focus:ring-[#00DDB3]/50 dark:text-white text-sm"
                      />
                       <button
                        onClick={handleActivate}
                        disabled={isActivating || !couponCode.trim()}
                        className="flex items-center justify-center h-11 w-full px-4 bg-[#00DDB3] hover:bg-[#00C9A7] text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                      >
                        {isActivating ? (
                          <div className="flex items-center gap-2">
                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                             <span>Verifying...</span>
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
