"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  User,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  isPro: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProStatus: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: "signin" | "signup" | "forgot";
  openAuthModal: (mode?: "signin" | "signup" | "forgot") => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isPro: false,
  loading: true,
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  signupWithEmail: async () => {},
  resetPassword: async () => {},
  logout: async () => {},
  refreshProStatus: async () => {},
  isAuthModalOpen: false,
  authModalMode: "signin",
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup" | "forgot">("signin");

  const openAuthModal = (mode?: "signin" | "signup" | "forgot") => {
    if (mode) setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Checks and updates local context Pro status via Firestore & server sync
  const refreshProStatus = async () => {
    if (!auth.currentUser) {
      setIsPro(false);
      return;
    }
    try {
      // 1. Sync with server (auto-elevates if Lemon Squeezy purchase is pending)
      const token = await auth.currentUser.getIdToken();
      if (token) {
        const res = await fetch("/api/auth/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setIsPro(data.isPro === true);
          return;
        }
      }

      // Fallback: direct Firestore read
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setIsPro(userDoc.data().isPro === true);
      } else {
        setIsPro(false);
      }
    } catch (error) {
      console.warn("Failed to check Pro status.", error);
      setIsPro(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await refreshProStatus();
      } else {
        setIsPro(false);
      }
      // Auth state is fully resolved — safe to render protected pages now
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await result.user.getIdToken(true);
        await refreshProStatus();
        setUser(result.user);
        closeAuthModal();
      }
    } catch (error: any) {
      console.error("Google login failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
      if (result.user) {
        await result.user.getIdToken(true);
        await refreshProStatus();
        setUser(result.user);
        closeAuthModal();
      }
    } catch (error: any) {
      console.error("Email login failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email: string, pass: string, name?: string) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (result.user) {
        if (name && name.trim()) {
          await updateProfile(result.user, { displayName: name.trim() });
        }
        await result.user.getIdToken(true);
        await refreshProStatus();
        setUser(result.user);
        closeAuthModal();
      }
    } catch (error: any) {
      console.error("Email signup failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsPro(false);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isPro,
        loading,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        resetPassword,
        logout,
        refreshProStatus,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
