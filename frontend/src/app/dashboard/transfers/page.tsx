"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/AuthContext"
import {
  checkRecipient,
  compareRoutes
} from "@/lib/api"
import type {
  RecipientCheckResponse,
  RouteOption
} from "@/lib/api"
import Link from "next/link"
import { TransactionConfirmCard } from "@/components/ui/transaction-confirm-card"
import { ZiroTicket } from "@/components/ui/ziro-ticket"

// ─── Constants ───────────────────────────────────────────────
const CONTACTS = [
  { id: 1, handle: "@parteek", name: "Parteek", img: "https://i.pravatar.cc/150?img=11" },
  { id: 2, handle: "@darsh", name: "Darsh", img: "https://i.pravatar.cc/150?img=12" },
  { id: 3, handle: "@aditya", name: "Aditya", img: "https://i.pravatar.cc/150?img=13" },
  { id: 4, handle: "@nipun", name: "Nipun", img: "https://i.pravatar.cc/150?img=33" }
]

const FUNDING_SOURCES = [
  { 
    id: "vault", 
    name: "ZIROVAULT", 
    holder: "OLIVIA RHYE",
    cardNumber: "1234 1234 1234 1234",
    expiry: "06/28",
    balance: "$42,504.80", 
    cssClass: "card-purple"
  },
  { 
    id: "card", 
    name: "ZIROCARD", 
    holder: "ZAHRA MOHAMADI",
    cardNumber: "1253 5432 3521 3090",
    expiry: "09/30",
    balance: "Credit", 
    cssClass: "card-blue"
  }
]

const CURRENCIES = ["USD", "EUR", "GBP", "USDC"]
const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", USDC: "" }

// ─── Types ───────────────────────────────────────────────────
type PageView = "wallet" | "form" | "confirm" | "done"
type RecipientState = "idle" | "safe" | "warning" | "blocked"

// ─── Toast ───────────────────────────────────────────────────
function Toast({ message, type, onDismiss }: { message: string; type: "error" | "warning" | "info"; onDismiss: () => void }) {
  const colors = {
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`fixed top-6 right-6 z-50 max-w-sm rounded-2xl border px-5 py-4 shadow-lg backdrop-blur-md ${colors[type]}`}
    >
      <div className="flex items-start gap-3">
        <div className="text-sm font-semibold leading-relaxed flex-1">{message}</div>
        <button onClick={onDismiss} className="opacity-50 hover:opacity-100 transition-opacity mt-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
    </motion.div>
  )
}

// ─── Risk Modal ──────────────────────────────────────────────
function RiskModal({ warnings, onClose, onProceed }: { warnings: string[]; onClose: () => void; onProceed: () => void }) {
  const [confirmed, setConfirmed] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xl">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-white/95 backdrop-blur-3xl rounded-[32px] border border-white/60 shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-100/50 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          </div>
          <div className="text-slate-900 font-bold text-2xl tracking-tight mb-1">Security Review</div>
          <div className="text-sm text-slate-500 font-medium">AI Firewall paused this transaction</div>
        </div>
        <div className="space-y-3 mb-8 bg-amber-50/80 p-5 rounded-2xl border border-amber-100">
          {warnings.length > 0 ? warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-amber-900 font-medium"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />{w}</div>
          )) : <div className="text-sm text-amber-900 font-medium">Suspicious activity detected.</div>}
        </div>
        <label className="flex items-center gap-3 mb-8 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="peer appearance-none w-6 h-6 rounded-lg border-2 border-slate-300 checked:bg-slate-900 checked:border-slate-900 transition-colors cursor-pointer" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <span className="text-sm text-slate-700 font-bold group-hover:text-slate-900 transition-colors">I understand the risks, proceed</span>
        </label>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-base px-5 py-4 rounded-2xl transition-colors">Cancel</button>
          <button disabled={!confirmed} onClick={onProceed} className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-30 text-white font-bold text-base px-5 py-4 rounded-2xl transition-all shadow-md">Confirm</button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── PIN Modal ───────────────────────────────────────────────
function PinModal({ onSubmit, onCancel }: { onSubmit: (pin: string) => void; onCancel: () => void }) {
  const [pin, setPin] = useState("")
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xl">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-white/95 backdrop-blur-3xl rounded-[32px] border border-white/60 shadow-2xl p-8 max-w-sm w-full mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Enter PIN</h3>
          <p className="text-sm text-slate-500 mt-1 font-medium">Authorize your transaction</p>
        </div>
        <input type="password" maxLength={4} autoFocus value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} className="w-full text-center tracking-[1em] font-mono text-4xl bg-slate-50/50 border border-slate-200 rounded-3xl py-6 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all mb-8 shadow-inner" />
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-base px-5 py-4 rounded-2xl transition-colors">Cancel</button>
          <button disabled={pin.length < 4} onClick={() => onSubmit(pin)} className="flex-1 bg-slate-900 hover:bg-black disabled:opacity-30 text-white font-bold text-base px-5 py-4 rounded-2xl transition-all shadow-md">Authorize</button>
        </div>
      </motion.div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════
export default function TransfersPage() {
  const { user } = useAuth()
  const activeUserId = user?.uid || "demo-user-123"

  const [view, setView] = useState<PageView>("wallet")
  const [fundingSource, setFundingSource] = useState(FUNDING_SOURCES[0])

  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [note, setNote] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)

  const [recipientState, setRecipientState] = useState<RecipientState>("idle")
  const [toast, setToast] = useState<{ msg: string; type: "error" | "warning" | "info" } | null>(null)
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [riskWarnings, setRiskWarnings] = useState<string[]>([])
  const [showPinModal, setShowPinModal] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionStatus, setExecutionStatus] = useState("")

  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null)
  const [currentPayment, setCurrentPayment] = useState<any | null>(null)
  const [checkingRecipient, setCheckingRecipient] = useState(false)

  const dismissToast = () => setToast(null)
  const currencySymbol = CURRENCY_SYMBOLS[currency] ?? ""

  // Auto-fetch route when amount changes
  useEffect(() => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) { setSelectedRoute(null); return }
    const timer = setTimeout(async () => {
      try {
        const routesRes = await compareRoutes({ amount: amt, currency, destination_country: "US", preference: "lowest_cost" })
        const blockchain = routesRes.routes.find((r) => r.route === "BLOCKCHAIN") || routesRes.routes[0]
        setSelectedRoute(blockchain || null)
      } catch {
        setSelectedRoute({ route: "BLOCKCHAIN", estimated_time_seconds: 2.1, estimated_fee: 0, fee_currency: currency })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [amount, currency])

  // Remove scrolling for the Confirmation Card and the Wallet view
  useEffect(() => {
    if (view === "confirm" || view === "wallet") {
      const scrollParent = document.querySelector(".custom-scrollbar");
      if (scrollParent) {
        scrollParent.classList.add("overflow-hidden");
        scrollParent.classList.remove("overflow-y-auto");
      }
      return () => {
        if (scrollParent) {
          scrollParent.classList.remove("overflow-hidden");
          scrollParent.classList.add("overflow-y-auto");
        }
      };
    }
  }, [view]);

  const handleRecipientBlur = useCallback(async () => {
    if (!recipient.trim()) return
    setCheckingRecipient(true); setRecipientState("idle")
    try {
      const res: RecipientCheckResponse = await checkRecipient(recipient.trim(), activeUserId)
      if (res.status === "BLOCKED") { setRecipientState("blocked"); setToast({ msg: "WARNING: Possible Address Poisoning detected.", type: "error" }) }
      else if (res.status === "WARNING") { setRecipientState("warning") }
      else { setRecipientState("safe") }
    } catch { setRecipientState("idle") }
    finally { setCheckingRecipient(false) }
  }, [recipient, activeUserId])

  // "Continue" just validates and goes to the confirm card — NO API call
  const handleContinue = useCallback(() => {
    if (!amount || !recipient.trim() || recipientState === "blocked") return
    setView("confirm")
  }, [amount, recipient, recipientState])

  // "Confirm & Send" on the confirmation card
  const handleConfirmSend = useCallback(async () => {
    try {
      setView("done")
    } catch (err: any) {
      console.error("Payment execution error:", err)
      setToast({ msg: err?.message || "Failed to process payment.", type: "error" })
    }
  }, [activeUserId, recipient, amount, currency, note, fundingSource])

  const handleRiskProceed = useCallback(async () => {
    setShowRiskModal(false)
    setShowPinModal(true)
  }, [currentPayment])

  const handlePinSubmit = useCallback(async (pin: string) => {
    setShowPinModal(false)
    setIsExecuting(true); setExecutionStatus("Signing & Broadcasting...")
    try {
      await new Promise(r => setTimeout(r, 1500))
      setExecutionStatus("Awaiting Settlement...")
      await new Promise(r => setTimeout(r, 1500))
      setIsExecuting(false)
      setView("done")
    } catch { setIsExecuting(false); setToast({ msg: "Execution failed.", type: "error" }) }
  }, [currentPayment])

  const reset = () => {
    setRecipient(""); setAmount(""); setNote(""); setCurrency("USD")
    setView("wallet"); setRecipientState("idle")
    setSelectedRoute(null); setCurrentPayment(null)
    setIsRecurring(false); setIsExecuting(false); setExecutionStatus("")
  }

  const totalAmount = parseFloat(amount) || 0
  const feesAmount = totalAmount > 50 ? totalAmount * 0.002 : 0
  const arrivalTime = selectedRoute?.estimated_time_seconds || 2.1

  const currentBalance = fundingSource ? parseFloat(fundingSource.balance.replace(/[^0-9.]/g, '')) : 0
  const isInsufficientFunds = (totalAmount + feesAmount) > currentBalance

  return (
    <div className={`w-full flex-1 flex flex-col items-center justify-center px-4 md:px-8 mx-auto relative select-none ${view === "confirm" ? "py-2 overflow-hidden" : "py-8"}`}>
      {/* Wallet CSS — properly scoped, cards stay BELOW title */}
      <style dangerouslySetInnerHTML={{ __html: `
        .ziro-wallet {
          position: relative; width: 330px; height: 320px;
          cursor: default; perspective: 1000px;
          display: flex; justify-content: center; align-items: flex-end;
          transition: transform 0.4s ease;
          margin-top: 16px;
        }
        .ziro-wallet-back {
          position: absolute; bottom: 0; width: 320px; height: 260px;
          background: #0a0a0a; /* Black back */
          border-radius: 22px 22px 60px 60px; z-index: 5;
          box-shadow: inset 0 25px 35px rgba(0,0,0,0.5), inset 0 5px 15px rgba(0,0,0,0.8), 0 20px 60px rgba(0,0,0,0.25);
        }
        .ziro-card {
          position: absolute; width: 290px; height: 175px; left: 20px;
          border-radius: 14px; padding: 0; color: white;
          background: #222222;
          box-shadow: 0 -8px 20px rgba(0,0,0,0.4);
          transition: transform 0.6s cubic-bezier(0.34,1.56,0.64,1), z-index 0s, box-shadow 0.3s;
          cursor: pointer; user-select: none;
          overflow: hidden;
        }
        .ziro-card > div {
          position: relative; z-index: 10;
        }
        
        .card-purple {
          bottom: 120px; z-index: 20;
          transform: translateY(0) rotate(-6deg);
        }
        .card-purple::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%;
          background: #bc9ff5; pointer-events: none; z-index: 0;
        }

        .card-blue {
          bottom: 75px; z-index: 30;
          transform: translateY(0) rotate(-2deg);
        }
        .card-blue::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%;
          background: #2e9dfa; pointer-events: none; z-index: 0;
        }

        .ziro-pocket {
          position: absolute; bottom: 0; width: 320px; height: 140px; z-index: 40;
          background: #141414; /* Black leather */
          border-radius: 18px 18px 60px 60px;
          filter: drop-shadow(0 -5px 15px rgba(0,0,0,0.4));
          box-shadow: inset 0 3px 12px rgba(255,255,255,0.06);
          border-top: 1.5px solid #282828;
        }
        /* Leather Stitched edges */
        .ziro-pocket::before {
          content: ''; position: absolute; top: 12px; left: 14px; right: 14px; bottom: 18px;
          border: 1.5px dashed rgba(255, 255, 255, 0.15);
          border-radius: 10px 10px 50px 50px;
          pointer-events: none;
        }
        .ziro-pocket-content {
          position: absolute; top: 35px; width: 100%; text-align: center; z-index: 50;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
        }
        .ziro-balance-real {
          color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .ziro-balance-label {
          color: #888888; font-size: 13px; font-weight: 600;
        }

        /* ── Hover: pop cards out prominently ── */
        .ziro-wallet:hover { transform: translateY(-5px); }
        .ziro-wallet:hover .card-purple { transform: translateY(-40px) rotate(-8deg); }
        .ziro-wallet:hover .card-blue { transform: translateY(-10px) rotate(-1deg); }

        /* Individual card hover — lifts card out prominently */
        .ziro-card:hover { z-index: 100 !important; }
        .ziro-wallet:hover .card-purple:hover { transform: translateY(-55px) scale(1.05) rotate(0); box-shadow: 0 0 0 2px #bc9ff5, 0 15px 45px rgba(188,159,245,0.3); }
        .ziro-wallet:hover .card-blue:hover { transform: translateY(-30px) scale(1.05) rotate(0); box-shadow: 0 0 0 2px #2e9dfa, 0 15px 45px rgba(46,157,250,0.3); }
      `}} />

      <AnimatePresence>{toast && <Toast message={toast.msg} type={toast.type} onDismiss={dismissToast} />}</AnimatePresence>
      <AnimatePresence>{showRiskModal && <RiskModal warnings={riskWarnings} onClose={() => setShowRiskModal(false)} onProceed={handleRiskProceed} />}</AnimatePresence>
      <AnimatePresence>{showPinModal && <PinModal onSubmit={handlePinSubmit} onCancel={() => setShowPinModal(false)} />}</AnimatePresence>

      {/* Executing Overlay */}
      <AnimatePresence>
        {isExecuting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-md">
            <div className="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/10">
              <div className="w-12 h-12 rounded-full border-[3px] border-white/20 border-t-white animate-spin" />
              <div className="text-white font-bold text-lg tracking-wide">{executionStatus}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* VIEW: WALLET                                           */}
      {/* ═══════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {view === "wallet" && (
          <motion.div
            key="wallet-view"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="text-center relative z-50">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Send Money</h1>
              <p className="text-slate-500 font-medium text-sm">Select a payment source to continue</p>
            </div>

            <div className="ziro-wallet">
              <div className="ziro-wallet-back" />
              {FUNDING_SOURCES.map((source, idx) => (
                <div
                  key={source.id}
                  className={`ziro-card ${source.cssClass}`}
                  onClick={() => { setFundingSource(source); setView("form") }}
                >
                  <div className="flex flex-col justify-between h-full p-5 pointer-events-none">
                    <div className="flex justify-between items-start">
                      <div className="flex items-baseline gap-1">
                        <div className="font-black text-2xl tracking-tighter italic text-white drop-shadow-sm">ZIRO</div>
                        <div className="text-[10px] font-bold tracking-widest text-white/80 uppercase mb-[2px]">{source.id}</div>
                      </div>
                      {source.id === "vault" ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                          <rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line>
                        </svg>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1 mt-auto">
                      <div className="flex justify-end items-end">
                        <div className="text-[10px] font-bold text-white/60 tracking-wider uppercase">{source.expiry}</div>
                      </div>
                      <div className="flex justify-between items-center mt-0.5">
                        <div className="font-mono text-base font-bold tracking-[1.5px] whitespace-pre">
                          ••••  ••••  ••••  {source.cardNumber.slice(-4)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="ziro-pocket">
                <div className="ziro-pocket-content">
                  <div className="ziro-balance-real">$54,904.80</div>
                  <div className="ziro-balance-label">Total Balance</div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-medium italic">Hover to preview — Click a card to pay from it</p>
            <Link href="/dashboard" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mt-2">← Back to Dashboard</Link>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* VIEW: FORM                                              */}
        {/* ═══════════════════════════════════════════════════════ */}
        {view === "form" && (
          <motion.div
            key="form-view"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-full max-w-lg bg-white/70 backdrop-blur-3xl rounded-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-white/50 p-8 sm:p-10 relative overflow-visible"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-emerald-50/30 pointer-events-none -z-10 rounded-[40px]" />

            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center relative z-20">
                <button onClick={() => setView("wallet")} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 hover:scale-105 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                </button>
                <div className="px-4 py-2 bg-slate-100 rounded-full">
                  <span className="text-xs font-bold text-slate-600">From: {fundingSource.name}</span>
                </div>
              </div>

              {/* Amount — uses correct currency symbol */}
              <div className="text-center relative pt-4 pb-2">
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="text" inputMode="decimal"
                    value={amount ? `${currencySymbol}${amount}${currency === "USDC" ? " USDC" : ""}` : ""}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9.]/g, '');
                      const parts = val.split('.'); if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                      if (val.length > 10) val = val.slice(0, 10);
                      if (parseFloat(val) > 1000000) val = "1000000";
                      setAmount(val);
                    }}
                    placeholder={`${currencySymbol}0`}
                    className="w-full bg-transparent text-center text-6xl font-black text-slate-900 placeholder:text-slate-200 focus:outline-none transition-all"
                  />
                </div>
                
                {isInsufficientFunds && (
                  <div className="text-red-500 text-xs font-bold mt-2 text-center absolute w-full left-0 bottom-[-5px]">
                    Insufficient funds (Max: {fundingSource?.balance})
                  </div>
                )}

                {/* Currency Pill — positioned below amount, not overlapping */}
                <div className="flex justify-center mt-4 relative z-30">
                  <div className="relative">
                    <button
                      onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                      className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-sm font-bold text-slate-700">{currency}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
                    </button>
                    <AnimatePresence>
                      {showCurrencyDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 min-w-[120px]"
                        >
                          {CURRENCIES.map(c => (
                            <button
                              key={c}
                              onClick={() => { setCurrency(c); setShowCurrencyDropdown(false) }}
                              className={`w-full px-4 py-3 text-left text-sm font-bold transition-colors ${c === currency ? 'bg-slate-100 text-[#4a72ff]' : 'text-slate-700 hover:bg-slate-50'}`}
                            >
                              {CURRENCY_SYMBOLS[c]}{CURRENCY_SYMBOLS[c] ? " " : ""}{c}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Contacts & Form */}
              <div className="space-y-4">
                <motion.div className="flex items-center gap-3 overflow-x-auto pt-4 pb-3 px-3 -mt-2 scrollbar-none" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                  {CONTACTS.map((contact) => (
                    <motion.button
                      key={contact.id}
                      onClick={() => { setRecipient(contact.handle); setRecipientState("idle") }}
                      variants={{ hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1 } }}
                      whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center gap-1 shrink-0 group p-1"
                    >
                      <div className={`w-12 h-12 rounded-full overflow-hidden transition-all ${recipient === contact.handle ? 'ring-2 ring-[#4a72ff] ring-offset-2 ring-offset-white' : 'hover:ring-2 hover:ring-slate-300 hover:ring-offset-2 hover:ring-offset-white'}`}>
                        <img src={contact.img} alt={contact.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-800">{contact.name}</span>
                    </motion.button>
                  ))}
                </motion.div>

                <div className="bg-white/50 backdrop-blur-md p-3 rounded-[32px] border border-white/60 shadow-sm">
                  <div className="flex items-center gap-4 bg-white rounded-[24px] px-5 py-4 shadow-sm mb-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest w-10 shrink-0">To</div>
                    <input type="text" value={recipient} onChange={(e) => { setRecipient(e.target.value); setRecipientState("idle") }} onBlur={handleRecipientBlur} placeholder="@username or address" className="w-full bg-transparent text-slate-900 font-bold text-base focus:outline-none placeholder:text-slate-300" />
                    {checkingRecipient && <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin shrink-0" />}
                    {!checkingRecipient && recipientState === "safe" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 shrink-0"><polyline points="20 6 9 17 4 12" /></svg>}
                  </div>
                  <div className="flex items-center gap-4 bg-white rounded-[24px] px-5 py-4 shadow-sm">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest w-10 shrink-0">For</div>
                    <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What's this for?" className="w-full bg-transparent text-slate-900 font-medium text-base focus:outline-none placeholder:text-slate-300" />
                  </div>
                </div>

                {/* Recurring Toggle */}
                <div className="flex items-center justify-between px-2 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21v-5h5" /></svg>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Recurring Payment</div>
                      <AnimatePresence>
                        {isRecurring && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-[#4a72ff] font-semibold mt-0.5">Repeats monthly</motion.div>}
                      </AnimatePresence>
                    </div>
                  </div>
                  <button type="button" onClick={() => setIsRecurring(!isRecurring)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isRecurring ? 'bg-[#4a72ff]' : 'bg-slate-200'}`}>
                    <motion.span layout className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isRecurring ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* CTA — "Continue" goes to confirm card, no API call */}
              <div className="pt-2">
                <button
                  onClick={handleContinue}
                  disabled={!amount || !recipient || recipientState === "blocked" || isInsufficientFunds}
                  className="w-full bg-slate-900 hover:bg-black disabled:opacity-50 disabled:hover:bg-slate-900 text-white font-bold text-lg px-5 py-5 rounded-[24px] transition-all shadow-[0_4px_20px_rgba(15,23,42,0.2)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.3)] hover:-translate-y-1 relative overflow-hidden group"
                >
                  <span className="relative z-10 tracking-wide">Continue</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] opacity-50" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* VIEW: CONFIRM (Animated Dashboard Card)                 */}
        {/* ═══════════════════════════════════════════════════════ */}
        {view === "confirm" && (
          <motion.div
            key="confirm-view"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <TransactionConfirmCard
              totalAmount={totalAmount}
              currency={currency}
              arrivalTimeSeconds={arrivalTime}
              feesAmount={feesAmount}
              feesCurrency={currency}
              onConfirm={handleConfirmSend}
              onCancel={() => setView("form")}
            />
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* VIEW: DONE — Ticket Confirmation Card with Confetti     */}
        {/* ═══════════════════════════════════════════════════════ */}
        {view === "done" && (
          <motion.div
            key="done-view"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex items-center justify-center w-full"
          >
            <ZiroTicket
              paymentId={currentPayment?.payment_id || "ZR-" + Math.floor(Math.random() * 10000000)}
              amount={totalAmount}
              fees={feesAmount}
              currency={currency}
              recipient={recipient}
              fundingSource={fundingSource.name}
              onDone={reset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
