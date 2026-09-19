"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/AuthContext"
import { syncOfflineTransactions } from "@/lib/api"
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

export default function VaultPage() {
  const { user } = useAuth()

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
    setIsOnline(navigator.onLine)
    setQueue(getQueue())

    const handleOnline  = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online",  handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online",  handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      handleSync()
    }
  }, [isOnline]) // eslint-disable-line react-hooks/exhaustive-deps

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
    const updated = [...queue, tx]
    setQueue(updated)
    saveQueue(updated)
    setRecipient(""); setAmount(""); setNote("")
  }, [recipient, amount, currency, note, queue])

  const handleSync = useCallback(async () => {
    if (!user || syncing || queue.length === 0) return
    setSyncing(true)
    try {
      const result = await syncOfflineTransactions({
        transactions: queue,
        device_id: user.uid,
      })
      setSyncResult({ synced: result.synced, failed: result.failed })
      // Clear synced transactions
      const failedIds = result.results.filter((r) => r.status !== "success").map((r) => r.id)
      const remaining = queue.filter((tx) => failedIds.includes(tx.id))
      setQueue(remaining)
      saveQueue(remaining)
      setLastSynced(new Date().toLocaleTimeString())
    } catch {
      setSyncResult({ synced: 0, failed: queue.length })
    } finally {
      setSyncing(false)
    }
  }, [user, syncing, queue])

  const removeFromQueue = (id: string) => {
    const updated = queue.filter((tx) => tx.id !== id)
    setQueue(updated)
    saveQueue(updated)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pt-2">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold tracking-tight text-slate-800 mb-2">
            Offline Vault
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-sm font-medium text-slate-500">
            Queue transactions without internet. They sync automatically when you reconnect.
          </motion.p>
        </div>
        <Link href="/dashboard" className="bg-white/50 hover:bg-white/80 border border-white/40 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-full transition-colors shadow-sm">
          ← Back
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Status + Sync */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-4"
        >
          {/* Connection status */}
          <div className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-3 h-3 rounded-full transition-colors ${isOnline ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]"}`} />
              <div className="text-slate-800 font-bold text-sm">{isOnline ? "Online" : "Offline"}</div>
            </div>
            <div className="text-slate-600 text-sm font-semibold mb-1">Offline Vault</div>
            <div className={`text-[11px] font-bold px-2 py-1 rounded-md inline-block mb-4 ${isOnline ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
              {isOnline ? "Ready" : "Offline Mode"}
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Transactions can be signed without an internet connection. They will be queued here and synced when you reconnect.
            </p>
            {lastSynced && (
              <div className="mt-4 text-[10px] text-slate-400 font-medium">
                Last synced: {lastSynced}
              </div>
            )}
          </div>

          {/* Sync button */}
          {queue.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <div className="text-slate-800 font-bold text-sm">Pending Queue</div>
                <div className="bg-amber-100 text-amber-600 text-[11px] font-bold px-2 py-1 rounded-md">{queue.length} queued</div>
              </div>
              <button
                onClick={handleSync}
                disabled={!isOnline || syncing}
                className="w-full bg-slate-800 hover:bg-black disabled:opacity-30 text-white font-semibold text-sm px-5 py-3 rounded-full transition-colors flex items-center justify-center gap-2"
              >
                {syncing ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Syncing...</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                  </svg> Sync Now</>
                )}
              </button>
              {!isOnline && <p className="text-[10px] text-slate-400 text-center mt-2">Connect to internet to sync</p>}
            </motion.div>
          )}

          {/* Sync result */}
          <AnimatePresence>
            {syncResult && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 p-5 shadow-sm">
                <div className="text-xs font-bold text-slate-700 mb-2">Last Sync Result</div>
                <div className="flex gap-4">
                  <div>
                    <div className="text-xl font-bold text-emerald-600">{syncResult.synced}</div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Synced</div>
                  </div>
                  {syncResult.failed > 0 && (
                    <div>
                      <div className="text-xl font-bold text-red-500">{syncResult.failed}</div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Failed</div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Queue form + list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 flex flex-col gap-5"
        >
          {/* Add to queue form */}
          <div className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 p-7 shadow-sm">
            <h3 className="text-slate-800 font-bold text-base mb-5">Queue a Transaction</h3>
            <div className="space-y-4">
              <div>
                <label className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 block">Recipient</label>
                <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="@username or 0x..." className="w-full bg-white/50 border border-white/40 rounded-2xl px-4 py-3 text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#4a72ff] transition-colors text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 block">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-white/50 border border-white/40 rounded-2xl pl-8 pr-4 py-3 text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#4a72ff] transition-colors text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 block">Currency</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-white/50 border border-white/40 rounded-2xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:border-[#4a72ff] transition-colors text-sm">
                    <option>USD</option><option>EUR</option><option>GBP</option><option>INR</option><option>KES</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 block">Note (optional)</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. rent payment" className="w-full bg-white/50 border border-white/40 rounded-2xl px-4 py-3 text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#4a72ff] transition-colors text-sm" />
              </div>
              <button onClick={queueTransaction} disabled={!recipient.trim() || !amount} className="w-full bg-slate-800 hover:bg-black disabled:opacity-30 text-white font-bold text-sm px-5 py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-md">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Add to Offline Queue
              </button>
            </div>
          </div>

          {/* Queue list */}
          {queue.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-black/5">
                <h3 className="text-slate-800 font-bold text-base">Queued Transactions</h3>
              </div>
              <div className="divide-y divide-black/5">
                {queue.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/40 transition-colors">
                    <div>
                      <div className="text-sm font-bold text-slate-800 mb-0.5">{tx.recipient}</div>
                      <div className="text-xs text-slate-500 font-medium">{tx.note || "No note"} · {new Date(tx.queued_at).toLocaleTimeString()}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-800">{tx.amount} {tx.currency}</div>
                        <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Queued</div>
                      </div>
                      <button onClick={() => removeFromQueue(tx.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {queue.length === 0 && (
            <div className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 p-8 shadow-sm flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className="text-slate-600 font-bold text-sm">Vault is empty</div>
              <div className="text-slate-400 text-xs font-medium">Queue a transaction above to use offline signing.</div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
