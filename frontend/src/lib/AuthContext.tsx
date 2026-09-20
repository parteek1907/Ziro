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
  GoogleAuthProvider,
  updatePassword,
  deleteUser
} from "firebase/auth";

type User = {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
  deleteUserAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  loginWithGoogle: async () => {},
  updateUserPassword: async () => {},
  deleteUserAccount: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const DEFAULT_DEV_USER: User = {
  uid: "dev-user-123",
  email: "aditya@ziro.app",
  displayName: "Aditya",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If real Firebase Auth is configured, use it
    if (auth) {
      // Check for redirect result if popup was blocked and redirect was used
      getRedirectResult(auth)
        .then((result) => {
          if (result?.user) {
            setUser({
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
            });
          }
        })
        .catch((error) => {
          console.error("[AuthContext] Redirect login error:", error);
        });

      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }

    // Local / Dev Mode fallback when Firebase keys are not in .env.local
    console.info("[AuthContext] Running in Local Dev Mode (Firebase keys not detected in .env.local).");
    Promise.resolve().then(() => {
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem("ziro_user") : null;
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser(DEFAULT_DEV_USER);
          if (typeof window !== "undefined") {
            localStorage.setItem("ziro_user", JSON.stringify(DEFAULT_DEV_USER));
          }
        }
      } catch {
        setUser(DEFAULT_DEV_USER);
      }
    });
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    if (auth) {
      await signInWithEmailAndPassword(auth, email, pass);
      return;
    }
    // Local dev login
    const devUser: User = {
      uid: "dev-" + Math.random().toString(36).substring(2, 9),
      email: email || "aditya@ziro.app",
      displayName: email ? email.split("@")[0] : "Aditya",
    };
    setUser(devUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("ziro_user", JSON.stringify(devUser));
    }
  };

  const signup = async (email: string, pass: string) => {
    if (auth) {
      await createUserWithEmailAndPassword(auth, email, pass);
      return;
    }
    // Local dev signup
    const devUser: User = {
      uid: "dev-" + Math.random().toString(36).substring(2, 9),
      email: email || "aditya@ziro.app",
      displayName: email ? email.split("@")[0] : "Aditya",
    };
    setUser(devUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("ziro_user", JSON.stringify(devUser));
    }
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("ziro_user");
    }
  };

  const loginWithGoogle = async () => {
    if (auth) {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      try {
        await signInWithPopup(auth, provider);
      } catch (err: any) {
        if (err.code === "auth/popup-blocked" || err.code === "auth/cancelled-popup-request") {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw err;
      }
      return;
    }
    // Local dev Google login
    const googleDevUser: User = {
      uid: "google-dev-123",
      email: "aditya.google@ziro.app",
      displayName: "Aditya (Google)",
    };
    setUser(googleDevUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("ziro_user", JSON.stringify(googleDevUser));
    }
  };

  const updateUserPassword = async (password: string) => {
    if (auth && auth.currentUser) {
      await updatePassword(auth.currentUser, password);
    }
  };

  const deleteUserAccount = async () => {
    if (auth && auth.currentUser) {
      await deleteUser(auth.currentUser);
    }
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("ziro_user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, loginWithGoogle, updateUserPassword, deleteUserAccount }}>
      {children}
    </AuthContext.Provider>
  );
}
