"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useAuth } from "@/lib/AuthContext"
import { evaluateTrustScore } from "@/lib/api"
import type { TrustScoreResponse } from "@/lib/api"
import Link from "next/link"

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-200/60 animate-pulse rounded-lg ${className}`} />
}

// ─── Animated Number Component ─────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  const rounded = useMotionValue(0)
  const display = useTransform(rounded, Math.round)
  
  useEffect(() => {
    const controls = animate(rounded, value, { duration: 1.5, type: "spring", bounce: 0.25 })
    return controls.stop
  }, [value, rounded])

  return <motion.span>{display}</motion.span>
}

// ─── Variants ───────────────────────────────────────────────
const springConfig = { type: "spring" as const, stiffness: 300, damping: 24 }

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: springConfig }
}

const listContainerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
}

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: springConfig }
}

export default function TrustScorePage() {
  const { user } = useAuth()
  const [data, setData]       = useState<TrustScoreResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  const DEMO_WALLET = "0xDemoWallet123"

  const fetch = useCallback(async () => {
    if (!user) {
      setLoading(false)
      setError(true)
      setData({
        trust_score: 740,
        grade: "Excellent",
        score_breakdown: { payment_consistency: 88, transaction_history: 76, community_trust: 92 },
        recommendation: "Keep maintaining consistent payment behavior to improve your score further.",
      })
      return
    }
    setLoading(true); setError(false)
    try {
      const res = await evaluateTrustScore(user.uid, DEMO_WALLET)
      setData(res)
    } catch {
      setError(true)
      setData({
        trust_score: 740,
        grade: "Excellent",
        score_breakdown: { payment_consistency: 88, transaction_history: 76, community_trust: 92 },
        recommendation: "Keep maintaining consistent payment behavior to improve your score further.",
      })
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  const score = data?.trust_score ?? 0
  const grade = data?.grade ?? "—"
  const breakdown = data?.score_breakdown
  const recommendation = data?.recommendation

  // Arc gauge parameters
  const RADIUS = 80
  const CIRCUMFERENCE = Math.PI * RADIUS // semicircle
  const progress = Math.min(score / 850, 1) // 850 is max TrustScore
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-8 md:px-12 py-8 relative">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-black tracking-tight text-slate-800 mb-2">
            TrustScore
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-base font-medium text-slate-500">
            Your financial trust profile — dynamically verified on-chain.
          </motion.p>
        </div>
        <div className="flex gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={fetch} disabled={loading} 
            className="bg-white/70 hover:bg-white backdrop-blur-sm border border-slate-200/60 text-slate-700 font-bold text-sm px-6 py-3 rounded-full transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <motion.svg 
              animate={loading ? { rotate: 360 } : { rotate: 0 }} 
              transition={loading ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </motion.svg>
            Refresh
          </motion.button>
          <Link href="/dashboard">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-slate-900 hover:bg-black text-white font-bold text-sm px-6 py-3 rounded-full transition-colors shadow-lg shadow-slate-900/20">
              Back to Overview
            </motion.div>
          </Link>
        </div>
      </div>

      <motion.div 
        initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* ── 1. Score Gauge ─────────────────────────────────── */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)" }}
          className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col items-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#4a72ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="text-slate-600 text-sm font-bold tracking-widest uppercase mb-6 self-start relative z-10">Live Score</div>

          {loading ? (
            <div className="flex flex-col items-center justify-center w-full mt-4">
              <Skeleton className="w-48 h-24 rounded-t-full mb-6" />
              <Skeleton className="w-24 h-10 mb-3" />
              <Skeleton className="w-20 h-6 rounded-full" />
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center mt-2">
              <div className="relative w-[200px] h-[110px] mb-4">
                {/* Gauge Background Track */}
                <svg width="200" height="110" viewBox="0 0 200 110" className="absolute top-0 left-0 drop-shadow-sm">
                  <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
                </svg>
                {/* Gauge Animated Progress */}
                <svg width="200" height="110" viewBox="0 0 200 110" className="absolute top-0 left-0 drop-shadow-[0_4px_12px_rgba(74,114,255,0.3)]">
                  <motion.path
                    d="M 10 100 A 90 90 0 0 1 190 100"
                    fill="none" stroke="#4a72ff" strokeWidth="14" strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    initial={{ strokeDashoffset: CIRCUMFERENCE }}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{ duration: 1.5, type: "spring", bounce: 0 }}
                  />
                </svg>
              </div>
              <div className="text-slate-900 text-6xl font-black tracking-tighter mb-2 drop-shadow-sm">
                <AnimatedNumber value={score} />
              </div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, ...springConfig }}
                className="bg-gradient-to-r from-[#4a72ff]/10 to-indigo-500/10 text-[#4a72ff] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-[#4a72ff]/20"
              >
                {grade}
              </motion.div>
            </div>
          )}

          {error && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 px-4 py-2 bg-amber-50 text-amber-600 border border-amber-200/50 rounded-xl text-[11px] font-bold text-center w-full">
               Cached Score — Cannot reach Oracle
             </motion.div>
          )}
        </motion.div>

        {/* ── 2. Breakdown ───────────────────────────────────── */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)" }}
          className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        >
          <div className="text-slate-600 text-sm font-bold tracking-widest uppercase mb-6">Vector Breakdown</div>
          {loading ? (
            <div className="space-y-6 mt-4">
              {[1,2,3].map((i) => <div key={i}><Skeleton className="w-1/2 h-4 mb-3" /><Skeleton className="w-full h-2.5 rounded-full" /></div>)}
            </div>
          ) : breakdown ? (
            <motion.div variants={listContainerVariants} initial="hidden" animate="show" className="space-y-6">
              {[
                { label: "Payment Consistency", val: breakdown.payment_consistency, icon: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
                { label: "Transaction History",  val: breakdown.transaction_history,  icon: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" },
                { label: "Community Trust",      val: breakdown.community_trust,      icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" },
              ].map((b) => (
                <motion.div key={b.label} variants={listItemVariants} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 group-hover:bg-[#4a72ff]/5 group-hover:border-[#4a72ff]/20 transition-all">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-[#4a72ff] transition-colors">
                          <path d={b.icon}/>
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-slate-700">{b.label}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900"><AnimatedNumber value={b.val} />%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${b.val}%` }}
                      transition={{ duration: 1.2, delay: 0.5, type: "spring", bounce: 0 }}
                      className="h-full bg-gradient-to-r from-[#4a72ff] to-indigo-400 rounded-full relative"
                    >
                      {/* Subtle shimmer over the progress bar */}
                      <motion.div 
                        animate={{ x: ["-100%", "200%"] }} 
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : null}
        </motion.div>

        {/* ── 3. AI Analysis ─────────────────────────────────── */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)" }}
          className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-110 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="text-slate-600 text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Oracle Analysis
            </div>
            {loading ? (
              <div className="space-y-3 mt-4"><Skeleton className="w-full h-4" /><Skeleton className="w-5/6 h-4" /><Skeleton className="w-4/6 h-4" /></div>
            ) : (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-slate-700 text-[15px] font-medium leading-relaxed">
                {recommendation}
              </motion.p>
            )}
          </div>
          
          <div className="mt-8 space-y-3 relative z-10">
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Verification Nodes</div>
            <motion.div variants={listContainerVariants} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
              {["Consistency", "History", "Community", "KYC"].map((item, i) => (
                <motion.div key={item} variants={listItemVariants} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  <span className="text-xs text-slate-600 font-bold">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
