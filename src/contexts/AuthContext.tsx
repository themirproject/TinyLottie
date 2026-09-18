"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut, User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  isPro: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isPro: false,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
  refreshProStatus: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

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
    // Keep loading=true so the profile page shows spinner, not "Access Denied"
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        // Force-refresh token so getIdToken() works immediately after login
        await result.user.getIdToken(true);
        await refreshProStatus();
        setUser(result.user);
      }
    } catch (error) {
      console.error("Google login failed", error);
    } finally {
      // onAuthStateChanged may or may not fire again; always settle loading
      setLoading(false);
    }
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
    <AuthContext.Provider value={{ user, isPro, loading, loginWithGoogle, logout, refreshProStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
