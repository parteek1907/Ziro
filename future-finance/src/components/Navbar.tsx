"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { LoginModal } from "./LoginModal";
import { LogOut, User as UserIcon } from "lucide-react";

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="#encryption" className="text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors">Encryption</Link>
            <Link href="#features" className="text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors">Features</Link>
            <Link href="#security" className="text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors">Security</Link>
          </div>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="text-2xl font-bold tracking-tight text-black">
              FutureFinance
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            {!loading && user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-100">
                  <UserIcon size={16} />
                  <span>{user.email?.split("@")[0]}</span>
                </div>
                <button 
                  onClick={() => logout()}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
                <Link 
                  href="/dashboard" 
                  className="bg-black hover:bg-slate-800 text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-black hover:bg-slate-800 text-white px-6 py-3 rounded-full font-semibold text-sm transition-all"
              >
                Log in / Sign up
              </button>
            )}
          </div>
        </div>
      </nav>

      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
