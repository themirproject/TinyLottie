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

  // Checks and updates local context Pro status via Firestore
  const refreshProStatus = async () => {
    if (!auth.currentUser) {
      setIsPro(false);
      return;
    }
    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setIsPro(userDoc.data().isPro === true);
      } else {
        // Automatically create user structural document if never logged in before
        await setDoc(userDocRef, {
          email: auth.currentUser.email,
          createdAt: new Date().toISOString(),
          isPro: false,
        });
        setIsPro(false);
      }
    } catch (error) {
      console.warn("Failed to check Pro status due to missing Firestore setup or permissions.", error);
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
