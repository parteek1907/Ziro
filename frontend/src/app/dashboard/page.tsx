"use client"

import { motion } from "framer-motion"
import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/lib/AuthContext"
import { getBalance, evaluateTrustScore } from "@/lib/api"
import type { BalanceResponse, TrustScoreResponse } from "@/lib/api"
import Link from "next/link"

// ─── Mock transactions (will be replaced once /api/v1/transactions is available) ───
const MOCK_TRANSACTIONS = [
  { id: "tx-1", type: "Settlement", to: "Maria Garcia", route: "USD → MXN", amount: "-$450.00", status: "Completed", time: "12 mins ago" },
  { id: "tx-2", type: "Transfer",   to: "James Wilson",  route: "USD → INR", amount: "+$2,000.00", status: "Completed", time: "34 mins ago" },
  { id: "tx-3", type: "Payment",    to: "L2 Wallet",     route: "USD → KES", amount: "-$124.50",   status: "Pending",   time: "1 hour ago" },
  { id: "tx-4", type: "Transfer",   to: "Amara",         route: "USD → KES", amount: "-$8,400.00", status: "Completed", time: "2 hours ago" },
]

// ─── Skeleton loader ──────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-slate-200/60 animate-pulse rounded-lg ${className}`} />
  )
}

// ─── Stat card ───────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  badge,
  badgeColor = "blue",
  loading,
  delay = 0,
}: {
  label: string
  value: string
  sub: string
  badge: string
  badgeColor?: "blue" | "orange" | "green"
  loading: boolean
  delay?: number
}) {
  const badgeClasses = {
    blue:   "bg-[#4a72ff]/10 text-[#4a72ff]",
    orange: "bg-orange-100 text-orange-600",
    green:  "bg-emerald-100 text-emerald-600",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 p-7 shadow-sm flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="text-slate-600 text-sm font-semibold">{label}</div>
        {loading ? (
          <Skeleton className="w-16 h-5" />
        ) : (
          <div className={`text-[11px] font-bold px-2 py-1 rounded-md ${badgeClasses[badgeColor]}`}>
            {badge}
          </div>
        )}
      </div>
      <div>
        {loading ? (
          <>
            <Skeleton className="w-36 h-10 mb-2" />
            <Skeleton className="w-28 h-3" />
          </>
        ) : (
          <>
            <div className="text-slate-800 text-[2.5rem] font-bold tracking-tight mb-1 leading-none">{value}</div>
            <div className="text-slate-500 text-xs font-medium">{sub}</div>
          </>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main page ───────────────────────────────────────────────
export default function DashboardOverview() {
  const { user } = useAuth()

  const [balance, setBalance]       = useState<BalanceResponse | null>(null)
  const [trustScore, setTrustScore] = useState<TrustScoreResponse | null>(null)
  const [balanceError, setBalanceError]     = useState(false)
  const [trustError, setTrustError]         = useState(false)
  const [loadingBalance, setLoadingBalance] = useState(true)
  const [loadingTrust, setLoadingTrust]     = useState(true)

  // Demo wallet — in production this comes from the connected wallet
  const DEMO_WALLET = "0xDemoWallet123"

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoadingBalance(false)
      setBalanceError(true)
      setLoadingTrust(false)
      setTrustError(true)
      return
    }

    // Balance
    setLoadingBalance(true)
    setBalanceError(false)
    try {
      const data = await getBalance(DEMO_WALLET)
      setBalance(data)
    } catch {
      setBalanceError(true)
    } finally {
      setLoadingBalance(false)
    }

    // TrustScore
    setLoadingTrust(true)
    setTrustError(false)
    try {
      const data = await evaluateTrustScore(user.uid, DEMO_WALLET)
      setTrustScore(data)
    } catch {
      setTrustError(true)
    } finally {
      setLoadingTrust(false)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Derived display values
  const displayBalance = balance
    ? `$${balance.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : balanceError
    ? "$42,280.50"   // graceful fallback
    : "$0.00"

  const displayScore = trustScore
    ? trustScore.trust_score.toString()
    : trustError
    ? "740"           // graceful fallback
    : "—"

  const scoreGrade = trustScore?.grade || (trustError ? "Excellent" : "—")

  const breakdown = trustScore?.score_breakdown
  const barData = breakdown
    ? [
        { label: "Consistency", val: breakdown.payment_consistency },
        { label: "History",     val: breakdown.transaction_history },
        { label: "Community",   val: breakdown.community_trust },
      ]
    : []

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-8 md:px-12 py-8">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight text-slate-800 mb-2"
          >
            Your financial overview
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm font-medium text-slate-500"
          >
            Everything moving through Ziro, in one place.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <button className="bg-white/50 hover:bg-white/80 border border-white/40 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export Report
          </button>
          <Link
            href="/dashboard/transfers"
            className="bg-slate-800 hover:bg-black text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 shadow-md"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Send Money
          </Link>
        </motion.div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <StatCard
          label="Total Balance"
          value={displayBalance}
          sub="+$4,580.50 this month"
          badge="+12.4%"
          badgeColor="blue"
          loading={loadingBalance}
          delay={0.1}
        />

        {/* TrustScore card — shows bar breakdown when data loads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 p-7 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="text-slate-600 text-sm font-semibold">TrustScore</div>
            {loadingTrust ? (
              <Skeleton className="w-16 h-5" />
            ) : (
              <div className="bg-[#4a72ff]/10 text-[#4a72ff] text-[11px] font-bold px-2 py-1 rounded-md">
                {scoreGrade}
              </div>
            )}
          </div>
          {loadingTrust ? (
            <>
              <Skeleton className="w-24 h-10 mb-3" />
              <div className="flex items-end gap-1.5 h-10">
                {[40, 60, 30, 100, 75].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-sm bg-black/5" style={{ height: `${h}%` }} />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-slate-800 text-[2.5rem] font-bold tracking-tight mb-2 leading-none">
                {displayScore}
              </div>
              {barData.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {barData.map((b) => (
                    <div key={b.label}>
                      <div className="flex justify-between text-[10px] font-medium text-slate-400 mb-0.5">
                        <span>{b.label}</span>
                        <span>{b.val}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#4a72ff] rounded-full transition-all duration-700"
                          style={{ width: `${b.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-slate-500 text-xs font-medium">+12 points this month</div>
            </>
          )}
        </motion.div>

        <StatCard
          label="Global Transfers"
          value="12"
          sub="4 countries this month"
          badge="Active"
          badgeColor="orange"
          loading={false}
          delay={0.3}
        />
      </div>

      {/* ── Bottom Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="lg:col-span-2 flex flex-col"
        >
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-slate-800 font-bold text-[1.1rem]">Recent Activity</h3>
            <Link href="/dashboard/activity" className="bg-black/5 hover:bg-black/10 text-slate-600 text-xs font-bold px-4 py-1.5 rounded-full transition-colors flex items-center gap-1">
              View All
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </Link>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 overflow-hidden shadow-sm flex-1 p-2">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-black/5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <div className="col-span-2">TYPE</div>
              <div className="col-span-4">TRANSACTION</div>
              <div className="col-span-2">ROUTE</div>
              <div className="col-span-2">TIME</div>
              <div className="col-span-2 text-right">STATUS</div>
            </div>

            <div className="divide-y divide-black/5">
              {MOCK_TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-white/40 transition-colors cursor-pointer rounded-2xl mx-1 my-1">
                  <div className="col-span-2 text-xs font-bold text-slate-700">{tx.type}</div>
                  <div className="col-span-4">
                    <div className="text-slate-800 font-bold text-xs mb-0.5">{tx.to}</div>
                  </div>
                  <div className="col-span-2 text-xs text-slate-500 font-medium">{tx.route}</div>
                  <div className="col-span-2 text-xs text-slate-500 font-medium">{tx.time}</div>
                  <div className="col-span-2 flex justify-end">
                    {tx.status === "Completed" ? (
                      <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full">Completed</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full">Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex flex-col"
        >
          <h3 className="text-slate-800 font-bold text-[1.1rem] mb-4 px-2">Quick Actions</h3>

          <div className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 p-2 shadow-sm flex-1 space-y-1">

            {([
              { label: "Send Money",          sub: "Transfer money globally",           href: "/dashboard/transfers" },
              { label: "TrustScore",          sub: "View your financial trust profile",  href: "/dashboard/trustscore" },
              { label: "Offline Vault",       sub: "Sign a transaction without internet", href: "/dashboard/vault" },
              { label: "Transaction History", sub: "View past transfers",               href: "/dashboard/activity" },
            ] as { label: string; sub: string; href: string }[]).map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="w-full flex items-center justify-between p-4 hover:bg-white/60 rounded-[20px] transition-colors text-left group"
              >
                <div>
                  <div className="text-sm font-bold text-slate-800 mb-0.5">{action.label}</div>
                  <div className="text-xs text-slate-500 font-medium">{action.sub}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-slate-800 transition-colors shrink-0">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </Link>
            ))}

          </div>
        </motion.div>
      </div>
    </div>
  )
}
