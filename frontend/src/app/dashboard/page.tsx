"use client"

import { motion } from "framer-motion"
import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/lib/AuthContext"
import { getBalance } from "@/lib/api"
import type { BalanceResponse } from "@/lib/api"
import Link from "next/link"
import { useFinance } from "@/lib/FinanceContext"

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
  const { totalBalance, transactions, trustScore, loadingTrust, trustError } = useFinance()
  const [isExporting, setIsExporting] = useState(false)

  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  
  const fetchWallet = useCallback(async () => {
    if (!user) return

    let currentWallet = "0xDemoWallet123"
    try {
      const { getUserWallets, connectWallet } = await import("@/lib/api")
      const wallets = await getUserWallets()
      if (wallets && wallets.length > 0) {
        currentWallet = wallets[0].public_address
      } else {
        // Auto-create a wallet if none exists
        const newWallet = await connectWallet({ chain: "polygon" })
        if (newWallet && newWallet.public_address) {
          currentWallet = newWallet.public_address
        }
      }
    } catch (e) {
      console.warn("Could not fetch or create wallet", e)
    }
    setWalletAddress(currentWallet)
  }, [user])

  useEffect(() => {
    Promise.resolve().then(() => fetchWallet())
  }, [fetchWallet])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const element = document.getElementById("dashboard-content")
      if (!element) return

      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default

      const opt = {
        margin:       0.5,
        filename:     'ziro-financial-report.pdf',
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      }

      await html2pdf().set(opt as any).from(element).save()
    } catch (err) {
      console.error("Export failed", err)
      window.print() // fallback
    } finally {
      setIsExporting(false)
    }
  }

  // Derived display values
  const displayBalance = `$${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const displayScore = trustScore?.trust_score != null
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
    <div id="dashboard-content" className="space-y-6 max-w-7xl mx-auto px-8 md:px-12 py-8">

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
          
          {walletAddress && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-4 flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 w-fit shadow-md group"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mr-2">Polygon Connected</span>
              <span className="text-xs font-mono text-slate-300 group-hover:text-white transition-colors select-all">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <button onClick={handleExport} disabled={isExporting} className="bg-white/50 hover:bg-white/80 border border-white/40 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
            {isExporting ? (
              <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            )}
            {isExporting ? "Exporting..." : "Export Report"}
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
          loading={false}
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
          value={transactions.length.toString()}
          sub="Updated in realtime"
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
              {transactions.slice(0, 4).map((tx) => (
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
