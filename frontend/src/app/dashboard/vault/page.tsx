"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { useAuth } from "@/lib/AuthContext"
import { syncOfflineTransactions } from "@/lib/api"
import { useFinance } from "@/lib/FinanceContext"
import type { OfflineTransaction } from "@/lib/api"
import Link from "next/link"

const STORAGE_KEY = "ziro_offline_queue"

function getQueue(): OfflineTransaction[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  } catch { return [] }
}

function saveQueue(q: OfflineTransaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(q))
}

const springConfig = { type: "spring" as const, stiffness: 300, damping: 24 }

export default function VaultPage() {
  const { user } = useAuth()
  const { addTransaction, deductBalance } = useFinance()

  const [isOnline, setIsOnline]       = useState(true)
  const [queue, setQueue]             = useState<OfflineTransaction[]>([])
  const [syncing, setSyncing]         = useState(false)
  const [lastSynced, setLastSynced]   = useState<string | null>(null)
  const [syncResult, setSyncResult]   = useState<{ synced: number; failed: number } | null>(null)

  // Offline transaction form
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount]       = useState("")
  const [currency, setCurrency]   = useState("USD")
  const [note, setNote]           = useState("")

  useEffect(() => {
    Promise.resolve().then(() => {
      setIsOnline(navigator.onLine)
      setQueue(getQueue())
    })

    const handleOnline  = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online",  handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online",  handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])



  const handleSync = useCallback(async () => {
    if (syncing || queue.length === 0) return
    setSyncing(true)
    try {
      // Simulate network delay for UX visualization
      await new Promise(r => setTimeout(r, 1200))

      const result = await syncOfflineTransactions({
        transactions: queue,
        device_id: user?.uid || "demo-user-123",
      })
      setSyncResult({ synced: result.synced, failed: result.failed })
      
      const successfulIds = result.results.filter((r) => r.status === "success").map((r) => r.id)
      const successfulTxs = queue.filter((tx) => successfulIds.includes(tx.id))
      
      successfulTxs.forEach((tx) => {
        addTransaction({
          id: tx.id,
          type: "Transfer (Offline)",
          to: tx.recipient,
          route: `${tx.currency} (Vault)`,
          amount: `-$${tx.amount.toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2})}`,
          status: "Completed",
          time: "Just now",
          ref: `ZR-OFF-${tx.id.substring(8, 12)}`
        })
        if (tx.currency === "USD") {
          deductBalance(tx.amount)
        }
      })

      const failedIds = result.results.filter((r) => r.status !== "success").map((r) => r.id)
      const remaining = queue.filter((tx) => failedIds.includes(tx.id))
      setQueue(remaining)
      saveQueue(remaining)
      setLastSynced(new Date().toLocaleTimeString())
    } catch {
      setSyncResult({ synced: 0, failed: queue.length })
    } finally {
      setSyncing(false)
      // Hide result after 4 seconds
      setTimeout(() => setSyncResult(null), 4000)
    }
  }, [user, syncing, queue, addTransaction, deductBalance])

  const queueTransaction = useCallback(() => {
    if (!recipient.trim() || !amount) return
    const tx: OfflineTransaction = {
      id: `offline-${Date.now()}`,
      recipient: recipient.trim(),
      amount: parseFloat(amount),
      currency,
      note,
      queued_at: new Date().toISOString(),
    }
    const updated = [tx, ...queue] // Prepend so new items animate at the top
    setQueue(updated)
    saveQueue(updated)
    setRecipient(""); setAmount(""); setNote("")
    if (isOnline) {
      setTimeout(handleSync, 100)
    }
  }, [recipient, amount, currency, note, queue, isOnline, handleSync])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      handleSync()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline])
  const removeFromQueue = (id: string) => {
    const updated = queue.filter((tx) => tx.id !== id)
    setQueue(updated)
    saveQueue(updated)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-8 md:px-12 py-8 relative">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-slate-400/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-black tracking-tight text-slate-800 mb-2">
            Offline Vault
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-base font-medium text-slate-500">
            Queue transactions seamlessly. Cryptographically signs when you reconnect.
          </motion.p>
        </div>
        <Link href="/dashboard">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-white/70 hover:bg-white backdrop-blur-sm border border-slate-200/60 text-slate-700 font-bold text-sm px-6 py-3 rounded-full transition-colors shadow-sm flex items-center justify-center">
            ← Back to Overview
          </motion.div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Status + Sync ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ...springConfig }}
          className="flex flex-col gap-5"
        >
          {/* Connection status (Uses Layout to resize smoothly) */}
          <motion.div layout className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden">
            <motion.div 
              layout
              className={`absolute top-0 left-0 w-full h-1 ${isOnline ? "bg-emerald-400" : "bg-red-400"}`}
            />
            
            <div className="flex items-center gap-3 mb-5 mt-1">
              <motion.div 
                animate={{ scale: isOnline ? [1, 1.2, 1] : 1, opacity: isOnline ? [0.7, 1, 0.7] : 1 }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`w-3.5 h-3.5 rounded-full ${isOnline ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" : "bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.8)]"}`} 
              />
              <div className="text-slate-800 font-black text-lg tracking-tight">{isOnline ? "Connected to Network" : "Disconnected (Air-gapped)"}</div>
            </div>
            
            <motion.div layout className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg inline-block mb-4 ${isOnline ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
              {isOnline ? "System Ready" : "Vault Offline Mode Active"}
            </motion.div>
            
            <motion.p layout className="text-sm text-slate-500 font-medium leading-relaxed">
              Transactions can be signed without an internet connection. They are securely queued in the vault and will automatically execute when connectivity is restored.
            </motion.p>
            
            <AnimatePresence>
              {lastSynced && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-5 text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Last synced: {lastSynced}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Sync button orchestration */}
          <AnimatePresence>
            {queue.length > 0 && (
              <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={springConfig} className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <div className="flex justify-between items-center mb-5">
                  <div className="text-slate-800 font-black tracking-tight text-lg">Pending Queue</div>
                  <motion.div key={queue.length} initial={{ scale: 1.5, color: "#4a72ff" }} animate={{ scale: 1, color: "#d97706" }} className="bg-amber-50 border border-amber-100 text-amber-600 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
                    {queue.length} waiting
                  </motion.div>
                </div>
                
                <div className="relative">
                  {syncing && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1.2, opacity: 0 }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                      className="absolute inset-0 bg-indigo-500 rounded-full z-0"
                    />
                  )}
                  <motion.button
                    whileHover={!syncing && isOnline ? { scale: 1.02, y: -2, boxShadow: "0 10px 25px -5px rgba(74,114,255,0.4)" } : {}}
                    whileTap={!syncing && isOnline ? { scale: 0.98 } : {}}
                    onClick={handleSync}
                    disabled={!isOnline || syncing}
                    className={`w-full relative z-10 text-white font-bold text-base px-5 py-4 rounded-full transition-colors flex items-center justify-center gap-3 overflow-hidden ${!isOnline ? "bg-slate-300" : syncing ? "bg-indigo-500" : "bg-[#4a72ff] hover:bg-[#3b63f0]"}`}
                  >
                    {syncing ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                        Encrypting & Syncing...
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
                        Force Sync Now
                      </motion.div>
                    )}
                  </motion.button>
                </div>
                {!syncing && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setQueue([]); saveQueue([]); }}
                    className="w-full mt-3 text-slate-500 font-bold text-sm px-5 py-3 rounded-full transition-colors flex items-center justify-center hover:bg-slate-100 hover:text-slate-800"
                  >
                    Cancel Queue
                  </motion.button>
                )}
                {!isOnline && <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider text-center mt-4">Waiting for network connection</p>}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sync result (Fluid) */}
          <AnimatePresence>
            {syncResult && (
              <motion.div layout initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, height: 0 }} className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white p-6 shadow-sm overflow-hidden">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Sync Completed</div>
                <div className="flex gap-6">
                  <div>
                    <div className="text-3xl font-black tracking-tighter text-emerald-500">{syncResult.synced}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Success</div>
                  </div>
                  {syncResult.failed > 0 && (
                    <div>
                      <div className="text-3xl font-black tracking-tighter text-red-500">{syncResult.failed}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Failed</div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Queue form + list ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ...springConfig }}
          className="lg:col-span-2 flex flex-col gap-6"
        >
          {/* Add to queue form */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-slate-100 to-transparent rounded-bl-full pointer-events-none" />
            
            <h3 className="text-slate-800 font-black text-xl tracking-tight mb-8 relative z-10">Queue a Transaction</h3>
            
            <div className="space-y-5 relative z-10">
              <div>
                <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 block">Recipient</label>
                <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="@username or 0x..." className="w-full bg-slate-50/50 border border-slate-200/60 rounded-2xl px-5 py-4 text-slate-800 placeholder:text-slate-300 font-bold focus:outline-none focus:border-[#4a72ff] focus:bg-white transition-all text-base shadow-inner" />
              </div>
              <div className="grid grid-cols-3 gap-5">
                <div className="col-span-2">
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 block">Amount</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-black text-lg">$</span>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-50/50 border border-slate-200/60 rounded-2xl pl-10 pr-5 py-4 text-slate-800 placeholder:text-slate-300 font-black focus:outline-none focus:border-[#4a72ff] focus:bg-white transition-all text-base shadow-inner" />
                  </div>
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 block">Currency</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200/60 rounded-2xl px-5 py-4 text-slate-800 font-bold focus:outline-none focus:border-[#4a72ff] focus:bg-white transition-all text-base shadow-inner cursor-pointer appearance-none">
                    <option>USD</option><option>EUR</option><option>GBP</option><option>INR</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 block">Note (optional)</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. offline payment" className="w-full bg-slate-50/50 border border-slate-200/60 rounded-2xl px-5 py-4 text-slate-800 placeholder:text-slate-300 font-bold focus:outline-none focus:border-[#4a72ff] focus:bg-white transition-all text-base shadow-inner" />
              </div>
              
              <motion.button 
                whileHover={recipient.trim() && amount ? { scale: 1.02, y: -2, boxShadow: "0 10px 25px -5px rgba(15,23,42,0.2)" } : {}}
                whileTap={recipient.trim() && amount ? { scale: 0.98 } : {}}
                onClick={queueTransaction} 
                disabled={!recipient.trim() || !amount} 
                className="w-full bg-slate-900 hover:bg-black disabled:opacity-40 text-white font-bold text-base px-6 py-4 rounded-2xl transition-all flex items-center justify-center gap-3 mt-4"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Secure to Offline Vault
              </motion.button>
            </div>
          </div>

          {/* Swipe-to-delete Queue list */}
          <AnimatePresence mode="popLayout">
            {queue.length > 0 ? (
              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="text-slate-800 font-black text-lg tracking-tight">Queued Ledger</h3>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Swipe Left to Delete</div>
                </div>
                
                <div className="divide-y divide-slate-100/80">
                  <AnimatePresence mode="popLayout">
                    {queue.map((tx) => (
                      <motion.div 
                        layout 
                        key={tx.id} 
                        initial={{ opacity: 0, x: -50, height: 0 }} 
                        animate={{ opacity: 1, x: 0, height: "auto" }} 
                        exit={{ opacity: 0, scale: 0.9, height: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="relative overflow-hidden group bg-white"
                      >
                        {/* Swipe Delete Background (Red) */}
                        <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-8 z-0">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </div>
                        
                        {/* Swipable Item */}
                        <motion.div
                          drag="x"
                          dragConstraints={{ left: -100, right: 0 }}
                          dragElastic={0.2}
                          onDragEnd={(e, { offset }) => {
                            if (offset.x < -75) removeFromQueue(tx.id)
                          }}
                          className="bg-white relative z-10 flex items-center justify-between px-8 py-5 cursor-grab active:cursor-grabbing border-l-4 border-transparent hover:border-indigo-100 transition-colors"
                        >
                          <div>
                            <div className="text-base font-black text-slate-800 mb-1">{tx.recipient}</div>
                            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{tx.note || "No memo"} · {new Date(tx.queued_at).toLocaleTimeString()}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1 pointer-events-none">
                            <div className="text-base font-black text-slate-900 tracking-tight">{tx.amount.toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2})} <span className="text-slate-400 text-sm">{tx.currency}</span></div>
                            <div className="bg-amber-50 text-amber-500 border border-amber-100 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                              Queued
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center text-center gap-4 min-h-[300px]">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-slate-800 font-black text-lg tracking-tight mb-1">Vault is empty</div>
                  <div className="text-slate-500 text-sm font-medium">Queue a transaction above to secure it offline.</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
