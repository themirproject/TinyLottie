"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Loader2, AlertCircle, ArrowRight, CheckCircle2, RotateCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    loginWithGoogle,
    sendMagicLink,
    confirmMagicLinkSignIn,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthModalOpen) {
      setError(null);
      setIsEmailSent(false);
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google sign in failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    setSubmitting(true);

    try {
      if (authModalMode === "confirm-email") {
        await confirmMagicLinkSignIn(cleanEmail);
      } else {
        await sendMagicLink(cleanEmail);
        setIsEmailSent(true);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("Email link sign-in is not yet enabled in Firebase Console. Please enable 'Email link (passwordless sign-in)' in Authentication > Sign-in method.");
      } else if (err.code === "auth/expired-action-code") {
        setError("This sign-in link has expired. Please request a new one.");
      } else if (err.code === "auth/invalid-action-code") {
        setError("This sign-in link is invalid or already used. Please request a new one.");
      } else {
        setError(err.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await sendMagicLink(email.trim());
      setIsEmailSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to resend email.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        onClick={closeAuthModal}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.35 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-800 p-6 sm:p-8 relative"
        >
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success State: Magic Link Sent */}
          {isEmailSent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-[#00DDB3]/15 text-[#00DDB3] flex items-center justify-center mx-auto mb-5 ring-8 ring-[#00DDB3]/5">
                <Mail className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Check your email
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                We've sent a magic sign-in link to <strong className="text-gray-900 dark:text-white">{email}</strong>.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-4 text-xs text-gray-600 dark:text-gray-400 mb-6 text-left space-y-1.5">
                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#00DDB3]" />
                  <span>Next steps:</span>
                </div>
                <p>1. Open the email on this device.</p>
                <p>2. Click the sign-in link inside to log in instantly.</p>
                <p className="text-[11px] text-gray-400 pt-1">No password needed. Be sure to check your spam folder if it doesn't arrive within a minute.</p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={submitting}
                  className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-medium text-xs transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCw className="w-3.5 h-3.5" />
                  )}
                  Resend magic link
                </button>
                <button
                  type="button"
                  onClick={() => setIsEmailSent(false)}
                  className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white py-1 transition-colors"
                >
                  Use a different email address
                </button>
              </div>
            </div>
          ) : (
            /* Normal & Confirm Email States */
            <div>
              {/* Header */}
              <div className="text-left mb-6 pt-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {authModalMode === "confirm-email"
                    ? "Confirm your email"
                    : authModalMode === "signup"
                    ? "Get started with TinyLottie"
                    : "Sign in to TinyLottie"}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {authModalMode === "confirm-email"
                    ? "Please enter your email to complete the sign-in process"
                    : "Sign in or create an account with Google or a magic link"}
                </p>
              </div>

              {/* Google Sign-In Button (hidden in confirm-email mode) */}
              {authModalMode !== "confirm-email" && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 rounded-xl font-medium text-sm transition-all shadow-xs disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    Continue with Google
                  </button>

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-800" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white dark:bg-gray-900 px-3 text-gray-400">
                        or with magic link
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00DDB3]/40 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 bg-[#00DDB3] hover:bg-[#00C9A7] text-white rounded-xl font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : authModalMode === "confirm-email" ? (
                    <>
                      Complete Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Send Magic Link
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Passwordless reassurance */}
              {authModalMode !== "confirm-email" && (
                <p className="mt-5 text-center text-[11px] text-gray-400 dark:text-gray-500">
                  No password required. We'll email you a secure, single-use link.
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

