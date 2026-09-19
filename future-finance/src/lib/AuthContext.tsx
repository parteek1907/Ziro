"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "./firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider
} from "firebase/auth";

type User = {
  uid: string;
  email: string | null;
  displayName?: string | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  loginWithGoogle: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mockUser");
    }

    if (!auth) {
      console.warn("[AuthContext] Firebase auth is not initialized.");
      setLoading(false);
      return;
    }

    // Check for redirect result if popup was blocked and redirect was used
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("[AuthContext] Redirect login successful:", result.user.email);
          setUser({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
          });
        }
      })
      .catch((error) => {
        console.error("[AuthContext] Redirect login error:", error);
      });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("[AuthContext] onAuthStateChanged:", firebaseUser?.email);
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    if (!auth) throw new Error("Firebase Auth is not initialized. Check your .env.local file.");
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string) => {
    if (!auth) throw new Error("Firebase Auth is not initialized. Check your .env.local file.");
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
  };

  const loginWithGoogle = async () => {
    if (!auth) throw new Error("Firebase Auth is not initialized. Check your .env.local file.");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    
    console.log("[AuthContext] Triggering Google Sign-in...");
    try {
      const res = await signInWithPopup(auth, provider);
      console.log("[AuthContext] Google sign-in popup successful:", res.user.email);
    } catch (err: any) {
      console.warn("[AuthContext] signInWithPopup failed:", err.code, err.message);
      // Fallback to redirect if popup was blocked by browser
      if (err.code === "auth/popup-blocked" || err.code === "auth/cancelled-popup-request") {
        console.log("[AuthContext] Falling back to signInWithRedirect...");
        await signInWithRedirect(auth, provider);
        return;
      }
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}
