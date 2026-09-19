"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useFinance } from "@/lib/FinanceContext"

type FilterType = "All" | "Transfer" | "Settlement" | "Payment"
type StatusFilter = "All" | "Completed" | "Pending" | "Failed"

function StatusBadge({ status }: { status: string }) {
  if (status === "Completed") return <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full">Completed</span>
  if (status === "Pending")   return <span className="bg-amber-100 text-amber-600 text-[10px] font-bold px-3 py-1 rounded-full">Pending</span>
  return <span className="bg-red-100 text-red-500 text-[10px] font-bold px-3 py-1 rounded-full">Failed</span>
}

export default function ActivityPage() {
  const { transactions } = useFinance()
  const [typeFilter,   setTypeFilter]   = useState<FilterType>("All")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
  const [search, setSearch]             = useState("")

  const filtered = transactions.filter((tx) => {
    const matchType   = typeFilter   === "All" || tx.type   === typeFilter
    const matchStatus = statusFilter === "All" || tx.status === statusFilter
    const matchSearch = search === "" || tx.to.toLowerCase().includes(search.toLowerCase()) || tx.ref.toLowerCase().includes(search.toLowerCase())
    return matchType && matchStatus && matchSearch
  })

  const totals = {
    in:  52700.40, // Hardcoded as requested
    out: transactions.filter((t) => t.amount.startsWith("-")).reduce((s, t) => s + parseFloat(t.amount.replace(/[^0-9.]/g, "")), 0),
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-8 md:px-12 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold tracking-tight text-slate-800 mb-2">
            Activity
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-sm font-medium text-slate-500">
            Your complete transaction history.
          </motion.p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white/50 hover:bg-white/80 border border-white/40 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-full transition-colors shadow-sm flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
          <Link href="/dashboard" className="bg-white/50 hover:bg-white/80 border border-white/40 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-full transition-colors shadow-sm">
            ← Back
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: "Total In",   value: `+$${totals.in.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,  badge: "Received", color: "blue"   as const },
          { label: "Total Out",  value: `-$${totals.out.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, badge: "Sent",     color: "orange" as const },
          { label: "Transfers",  value: `${filtered.length}`,               badge: "Filtered", color: "blue"   as const },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }} className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="text-slate-600 text-sm font-semibold">{s.label}</div>
              <div className={`text-[11px] font-bold px-2 py-1 rounded-md ${s.color === "blue" ? "bg-[#4a72ff]/10 text-[#4a72ff]" : "bg-orange-100 text-orange-600"}`}>{s.badge}</div>
            </div>
            <div className="text-slate-800 text-[2rem] font-bold tracking-tight leading-none">{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters + Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 shadow-sm overflow-hidden">

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-black/5">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by recipient or ref..." className="w-full bg-white/50 border border-white/40 rounded-full pl-8 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#4a72ff] transition-colors" />
          </div>

          {/* Type filter */}
          <div className="flex gap-1">
            {(["All", "Transfer", "Settlement", "Payment"] as FilterType[]).map((f) => (
              <button key={f} onClick={() => setTypeFilter(f)} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${typeFilter === f ? "bg-slate-800 text-white" : "bg-black/5 text-slate-500 hover:text-slate-800"}`}>{f}</button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex gap-1">
            {(["All", "Completed", "Pending", "Failed"] as StatusFilter[]).map((f) => (
              <button key={f} onClick={() => setStatusFilter(f)} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${statusFilter === f ? "bg-slate-800 text-white" : "bg-black/5 text-slate-500 hover:text-slate-800"}`}>{f}</button>
            ))}
          </div>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-black/5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <div className="col-span-1">TYPE</div>
          <div className="col-span-3">RECIPIENT</div>
          <div className="col-span-2">ROUTE</div>
          <div className="col-span-2">REF</div>
          <div className="col-span-2">TIME</div>
          <div className="col-span-1 text-right">AMOUNT</div>
          <div className="col-span-1 text-right">STATUS</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-black/5">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm font-medium">No transactions match your filters.</div>
          ) : filtered.map((tx) => (
            <div key={tx.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/40 transition-colors cursor-pointer">
              <div className="col-span-1 text-xs font-bold text-slate-600">{tx.type}</div>
              <div className="col-span-3 text-xs font-bold text-slate-800">{tx.to}</div>
              <div className="col-span-2 text-xs text-slate-500 font-medium">{tx.route}</div>
              <div className="col-span-2 text-xs text-slate-400 font-medium">{tx.ref}</div>
              <div className="col-span-2 text-xs text-slate-500 font-medium">{tx.time}</div>
              <div className={`col-span-1 text-xs font-bold text-right ${tx.amount.startsWith("+") ? "text-emerald-600" : "text-slate-800"}`}>{tx.amount}</div>
              <div className="col-span-1 flex justify-end"><StatusBadge status={tx.status} /></div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
