"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/AuthContext"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Google login error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in was cancelled.");
      } else {
        setError(err.message || "Failed to sign in with Google");
      }
    } finally {
      setGoogleLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-[#0B0B0D] flex">
      
      {/* Left Side: Branding / Visual */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden bg-[#111114]">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#2161E8]/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#35E58A]/10 blur-[120px] pointer-events-none"></div>
        
        <Link href="/" className="relative z-10 inline-block">
          <img src="/logo.png" alt="Ziro Logo" className="h-8 md:h-10 w-auto object-contain brightness-0 invert scale-[2] md:scale-[2.5] origin-left" />
        </Link>

        <div className="relative z-10 mb-12">
          <h2 className="text-white text-5xl font-bold tracking-tight mb-6 leading-tight">
            Welcome back to<br />the new standard.
          </h2>
          <p className="text-[#8B8F98] text-lg max-w-md">
            Log in to manage your L2 settlements, monitor your TrustScore, and securely access your Offline Vault.
          </p>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-12">
            <Link href="/" className="inline-block">
              <img src="/logo.png" alt="Ziro Logo" className="h-8 w-auto object-contain brightness-0 invert scale-[2] origin-left" />
            </Link>
          </div>

          <h1 className="text-white text-3xl font-bold tracking-tight mb-2">Log in</h1>
          <p className="text-[#8B8F98] mb-8">Enter your credentials to access your account.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium border border-red-500/20">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleEmailLogin}>
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium tracking-wide">Email address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#2161E8] focus:bg-white/10 transition-colors"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-white/80 text-sm font-medium tracking-wide">Password</label>
                <Link href="#" className="text-[#2161E8] text-sm font-medium hover:text-white transition-colors">Forgot password?</Link>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#2161E8] focus:bg-white/10 transition-colors"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold text-base rounded-xl px-4 py-3.5 hover:bg-[#F4F5F7] transition-colors mt-4 flex items-center justify-center disabled:opacity-70">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="my-8 flex items-center justify-center space-x-4">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-[#8B8F98] text-sm uppercase tracking-widest font-medium">Or</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          <div className="space-y-3">
            <button className="w-full bg-white/5 border border-white/10 text-white font-medium text-base rounded-xl px-4 py-3 hover:bg-white/10 transition-colors flex items-center justify-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/>
              </svg>
              Continue with Wallet
            </button>
            <button 
              type="button" 
              onClick={handleGoogleLogin} 
              disabled={googleLoading}
              className="w-full bg-white/5 border border-white/10 text-white font-medium text-base rounded-xl px-4 py-3 hover:bg-white/10 transition-colors flex items-center justify-center gap-3 disabled:opacity-60"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20.94c5.05 0 9.14-4.09 9.14-9.14 0-5.05-4.09-9.14-9.14-9.14-5.05 0-9.14 4.09-9.14 9.14 0 5.05 4.09 9.14 9.14 9.14z"/>
              </svg>
              {googleLoading ? "Connecting to Google..." : "Continue with Google"}
            </button>
          </div>

          <p className="text-center text-[#8B8F98] mt-8 text-sm">
            Don't have an account? <Link href="/signup" className="text-white font-bold hover:text-[#2161E8] transition-colors">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
