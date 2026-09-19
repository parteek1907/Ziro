"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "./firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";

type User = {
  uid: string;
  email: string | null;
  displayName?: string | null;
  isMock?: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if we are in Mock mode (no real Firebase config)
  const isMockMode = !auth;

  useEffect(() => {
    if (!isMockMode) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
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
    } else {
      // Mock mode initialization
      const storedMockUser = localStorage.getItem("mockUser");
      if (storedMockUser) {
        setUser(JSON.parse(storedMockUser));
      }
      setLoading(false);
    }
  }, [isMockMode]);

  const login = async (email: string, pass: string) => {
    if (!isMockMode) {
      await signInWithEmailAndPassword(auth, email, pass);
    } else {
      if (email === "demo@futurefinance.com" && pass === "password123") {
        const mockUser = { uid: "mock-uid-123", email, isMock: true };
        setUser(mockUser);
        localStorage.setItem("mockUser", JSON.stringify(mockUser));
      } else {
        throw new Error("Invalid demo credentials. Use demo@futurefinance.com / password123");
      }
    }
  };

  const signup = async (email: string, pass: string) => {
    if (!isMockMode) {
      await createUserWithEmailAndPassword(auth, email, pass);
    } else {
      const mockUser = { uid: "mock-uid-new", email, isMock: true };
      setUser(mockUser);
      localStorage.setItem("mockUser", JSON.stringify(mockUser));
    }
  };

  const logout = async () => {
    if (!isMockMode) {
      await signOut(auth);
    } else {
      setUser(null);
      localStorage.removeItem("mockUser");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
