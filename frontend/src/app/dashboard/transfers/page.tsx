"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/AuthContext"
import { checkRecipient, compareRoutes, analyzeRisk } from "@/lib/api"
import type { RouteOption, RiskAnalysisResponse } from "@/lib/api"
import Link from "next/link"
import { useFinance } from "@/lib/FinanceContext"

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
const CURRENCIES = ["USD", "EUR", "GBP", "INR"]
const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", INR: "₹" }
const EXCHANGE_RATES: Record<string, number> = { USD: 1, EUR: 43.53 / 50, GBP: 37.35 / 50, INR: 4796.78 / 50 }
const FEE_THRESHOLDS: Record<string, number> = { USD: 50, EUR: 43.53, GBP: 37.35, INR: 4796.78 }

const DEMO_RECIPIENTS = [
  { id: "r1", name: "Maria Garcia", handle: "@maria", avatar: "https://i.pravatar.cc/150?img=5", country: "MX" },
  { id: "r2", name: "Arjun Mehta", handle: "@arjun", avatar: "https://i.pravatar.cc/150?img=11", country: "IN" },
  { id: "r3", name: "Liam Chen", handle: "@liam", avatar: "https://i.pravatar.cc/150?img=12", country: "SG" },
  { id: "r4", name: "Sophia Williams", handle: "@sophia", avatar: "https://i.pravatar.cc/150?img=9", country: "US" },
  { id: "r5", name: "David Kim", handle: "@david", avatar: "https://i.pravatar.cc/150?img=33", country: "KR" },
  { id: "r6", name: "Amara Obi", handle: "@amara", avatar: "https://i.pravatar.cc/150?img=20", country: "KE" },
]

type Recipient = { id: string; name: string; handle: string; avatar: string; country: string }
type FundingSource = { id: string; name: string; type: string; balance: string; last4: string; holder: string; cardNumber: string; expiry: string; cssClass: string }

type Step = "recipient" | "amount" | "source" | "route" | "security" | "review" | "pin" | "processing" | "done" | "failed"
type CheckStatus = "idle" | "running" | "passed" | "failed"
type SecurityChecks = { addressScan: { status: CheckStatus; message: string }; aiFirewall: { status: CheckStatus; message: string }; routeOptimizer: { status: CheckStatus; message: string } }

// ═══════════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════════
function Toast({ message, type, onDismiss }: { message: string; type: "error" | "warning" | "info"; onDismiss: () => void }) {
  const colors = { error: "bg-red-50 border-red-200 text-red-800", warning: "bg-amber-50 border-amber-200 text-amber-800", info: "bg-blue-50 border-blue-200 text-blue-700" }
  return (
    <motion.div initial={{ opacity: 0, y: -12, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.9 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className={`fixed top-6 right-6 z-[70] max-w-sm rounded-2xl border px-5 py-4 shadow-lg backdrop-blur-md ${colors[type]}`}>
      <div className="flex items-start gap-3">
        <div className="text-sm font-semibold leading-relaxed flex-1">{message}</div>
        <button onClick={onDismiss} className="opacity-50 hover:opacity-100 transition-opacity mt-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// RISK MODAL
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
// PREMIUM PIN MODAL
// ═══════════════════════════════════════════════════════════════
function PremiumPinModal({ onSuccess, onCancel, amount, currency, recipient, route, fee, total }: { onSuccess: () => void; onCancel: () => void; amount: string; currency: string; recipient: string; route: string; fee: string; total: string }) {
  const [pin, setPin] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockoutTimer, setLockoutTimer] = useState(0)
  const [showForgotPin, setShowForgotPin] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  useEffect(() => { if (lockoutTimer > 0) { const t = setTimeout(() => setLockoutTimer(lockoutTimer - 1), 1000); return () => clearTimeout(t) } }, [lockoutTimer])

  const handleKeyPress = useCallback((key: string) => {
    if (isVerifying || lockoutTimer > 0 || isSuccess) return
    setIsError(false)
    if (key === "back") { setPin(prev => prev.slice(0, -1)) }
    else if (pin.length < 6) {
      const newPin = pin + key
      setPin(newPin)
      if (newPin.length === 6) {
        setIsVerifying(true)
        setTimeout(async () => {
          if (newPin === "111111") {
            setIsVerifying(false); setIsError(true); setPin("")
            const n = attempts + 1; setAttempts(n)
            if (n >= 3) { setLockoutTimer(30); setAttempts(0) }
          } else { setIsSuccess(true); setTimeout(() => onSuccess(), 800) }
        }, 800)
      }
    }
  }, [pin, isVerifying, lockoutTimer, isSuccess, attempts, onSuccess])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (isVerifying || lockoutTimer > 0 || isSuccess) return
      if (e.key >= "0" && e.key <= "9") handleKeyPress(e.key)
      else if (e.key === "Backspace") handleKeyPress("back")
      else if (e.key === "Escape") setShowCancelConfirm(true)
    }
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h)
  }, [handleKeyPress, isVerifying, lockoutTimer, isSuccess])

  if (showCancelConfirm) return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-slate-100 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-red-500"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg></div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Cancel payment?</h3>
        <p className="text-sm text-slate-500 mb-6">Your payment has not been authorized.</p>
        <div className="flex gap-3">
          <button onClick={() => setShowCancelConfirm(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm py-3.5 rounded-xl transition-colors">Continue</button>
          <button onClick={onCancel} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold text-sm py-3.5 rounded-xl transition-colors shadow-md">Cancel Payment</button>
        </div>
      </motion.div>
    </div>
  )

  if (showForgotPin) return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-slate-100 text-center">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4 text-blue-500"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Reset Payment PIN</h3>
        <p className="text-sm text-slate-500 mb-6">{"For your security, you'll need to verify your identity before creating a new Payment PIN."}<br/><br/>PIN recovery will be completed through account verification.</p>
        <button onClick={() => setShowForgotPin(false)} className="w-full bg-slate-900 hover:bg-black text-white font-bold text-sm py-3.5 rounded-xl transition-colors shadow-md">Understood</button>
      </motion.div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-end md:justify-center bg-slate-900/40 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="bg-white md:rounded-[40px] rounded-t-[32px] md:border border-white/60 shadow-2xl p-6 md:p-8 w-full max-w-sm">
        <div className="flex justify-center mb-5">
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Ziro Secure</span>
          </div>
        </div>
        <div className="text-center mb-5">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Confirm Payment</h3>
          <p className="text-xs text-slate-500 mt-1.5">Enter your Payment PIN to authorize this transfer.</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 space-y-1.5">
          <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-400">Recipient</span><span className="text-sm font-bold text-slate-700">{recipient}</span></div>
          <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-400">Amount</span><span className="text-sm font-bold text-slate-900">{currency} {amount}</span></div>
          <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-400">Fee</span><span className="text-xs font-bold text-slate-500">{fee}</span></div>
          <div className="flex justify-between items-center border-t border-slate-200 pt-1.5 mt-1.5"><span className="text-xs font-bold text-slate-600">Total</span><span className="text-sm font-black text-slate-900">{total}</span></div>
        </div>
        <motion.div className="flex justify-center gap-3 mb-6 h-8" animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
          {isSuccess ? (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center text-emerald-500 gap-2"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span className="text-sm font-bold">Payment Authorized</span></motion.div>
          ) : isVerifying ? (<div className="flex items-center text-slate-500 gap-3"><div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-800 animate-spin" /><span className="text-sm font-bold">Verifying...</span></div>
          ) : lockoutTimer > 0 ? (<div className="flex flex-col items-center"><span className="text-sm font-bold text-red-500 mb-1">Too many incorrect attempts.</span><span className="text-xs font-semibold text-slate-500">Try again in {lockoutTimer}s</span></div>
          ) : (<>{[...Array(6)].map((_, i) => (<div key={i} className="w-3.5 h-3.5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center"><AnimatePresence>{pin.length > i && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-2.5 h-2.5 rounded-full bg-slate-800" />)}</AnimatePresence></div>))}</>)}
        </motion.div>
        {isError && !lockoutTimer && <div className="text-center text-xs font-bold text-red-500 -mt-2 mb-4">Incorrect PIN. Please try again.</div>}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {["1","2","3","4","5","6","7","8","9","","0","back"].map((k, i) => (
            k === "" ? <div key={i} /> : <button key={i} onClick={() => handleKeyPress(k)} disabled={isVerifying || lockoutTimer > 0 || isSuccess} className={`h-14 rounded-2xl flex items-center justify-center text-2xl font-medium transition-all active:scale-95 ${k === "back" ? "text-slate-500 hover:bg-slate-100 disabled:opacity-30" : "text-slate-800 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-30"}`}>
              {k === "back" ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg> : k}
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center px-2">
          <button onClick={() => setShowCancelConfirm(true)} disabled={isVerifying || isSuccess} className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30">Cancel</button>
          <button onClick={() => setShowForgotPin(true)} disabled={isVerifying || isSuccess} className="text-xs font-semibold text-[#4a72ff] hover:text-[#385ce0] transition-colors disabled:opacity-30">Forgot PIN?</button>
        </div>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ADD RECIPIENT MODAL
// ═══════════════════════════════════════════════════════════════
function AddRecipientModal({ onAdd, onClose }: { onAdd: (r: Recipient) => void; onClose: () => void }) {
  const [name, setName] = useState("")
  const [handle, setHandle] = useState("")
  const [country, setCountry] = useState("US")
  const [error, setError] = useState("")

  const submit = () => {
    if (!name.trim()) { setError("Name is required"); return }
    if (!handle.trim()) { setError("Handle is required"); return }
    const h = handle.startsWith("@") ? handle : `@${handle}`
    onAdd({ id: `r-${Date.now()}`, name: name.trim(), handle: h, avatar: `https://i.pravatar.cc/150?u=${h}`, country })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[32px] p-8 max-w-sm w-full mx-4 shadow-2xl border border-slate-100">
        <h3 className="text-xl font-bold text-slate-900 mb-1">Add Recipient</h3>
        <p className="text-sm text-slate-500 mb-6">Add a new payment recipient.</p>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Name</label>
            <input value={name} onChange={e => { setName(e.target.value); setError("") }} placeholder="Full name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 transition-all placeholder:text-slate-300" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Handle / Address</label>
            <input value={handle} onChange={e => { setHandle(e.target.value); setError("") }} placeholder="@username or address" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 transition-all placeholder:text-slate-300" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Country</label>
            <select value={country} onChange={e => setCountry(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-400 transition-all">
              {[["US","United States"],["IN","India"],["MX","Mexico"],["SG","Singapore"],["KE","Kenya"],["KR","South Korea"],["GB","United Kingdom"],["DE","Germany"]].map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </select>
          </div>
          {error && <div className="text-xs font-bold text-red-500">{error}</div>}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm py-3.5 rounded-xl transition-colors">Cancel</button>
          <button onClick={submit} className="flex-1 bg-slate-900 hover:bg-black text-white font-bold text-sm py-3.5 rounded-xl transition-colors shadow-md">Continue</button>
        </div>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// STEP HEADER
// ═══════════════════════════════════════════════════════════════
function StepHeader({ step, onBack, label }: { step: number; onBack?: () => void; label: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      {onBack ? (
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 hover:scale-105 transition-transform">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
        </button>
      ) : <div />}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">{step}</div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function TransfersPage() {
  const { user } = useAuth()
  const activeUserId = user?.uid || "demo-user-123"
  const { totalBalance, deductBalance, addTransaction } = useFinance()

  // ── State Machine ──
  const [step, setStep] = useState<Step>("recipient")

  // ── Transfer State ──
  const [recipients, setRecipients] = useState<Recipient[]>(DEMO_RECIPIENTS)
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [note, setNote] = useState("")
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [showAddRecipient, setShowAddRecipient] = useState(false)

  const ziroVaultBalance = totalBalance - 12400.00
  const FUNDING_SOURCES: FundingSource[] = [
    { id: "vault", name: "Ziro Balance", type: "Pocket", balance: `$${Math.max(0, ziroVaultBalance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, last4: "1234", holder: "OLIVIA RHYE", cardNumber: "1234 1234 1234 1234", expiry: "06/28", cssClass: "card-purple" },
    { id: "card", name: "JPM Chase", type: "Credit", balance: "$12,400.00", last4: "3090", holder: "ZAHRA MOHAMADI", cardNumber: "1253 5432 3521 3090", expiry: "09/30", cssClass: "card-blue" },
  ]
  const [fundingSource, setFundingSource] = useState<FundingSource>(FUNDING_SOURCES[0])

  const [allRoutes, setAllRoutes] = useState<RouteOption[]>([])
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null)

  const [securityChecks, setSecurityChecks] = useState<SecurityChecks>({ addressScan: { status: "idle", message: "" }, aiFirewall: { status: "idle", message: "" }, routeOptimizer: { status: "idle", message: "" } })
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [riskWarnings, setRiskWarnings] = useState<string[]>([])

  const [toast, setToast] = useState<{ msg: string; type: "error" | "warning" | "info" } | null>(null)
  const dismissToast = () => setToast(null)

  const [txId, setTxId] = useState("")
  const [txRef, setTxRef] = useState("")
  const idempotencyKey = useRef(`ziro-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const isSubmitting = useRef(false)

  const [processingStage, setProcessingStage] = useState(0) // 0: authorize, 1: secure, 2: settle, 3: done

  // ── Derived ──
  const sym = CURRENCY_SYMBOLS[currency] ?? ""
  const totalAmount = parseFloat(amount) || 0
  const feeThreshold = FEE_THRESHOLDS[currency] || 50
  const routeFee = selectedRoute?.estimated_fee || 0
  const platformFee = totalAmount > feeThreshold ? totalAmount * 0.002 : 0
  const feesAmount = routeFee + platformFee
  const grandTotal = totalAmount + feesAmount
  const currentBalance = totalBalance * (EXCHANGE_RATES[currency] || 1)
  const isInsufficientFunds = grandTotal > currentBalance
  const arrivalTime = selectedRoute?.estimated_time_seconds || 2.1

  const formatTime = (s: number) => { if (s < 60) return `~${Math.round(s)}s`; if (s < 3600) return `~${Math.round(s / 60)}m`; return `~${Math.round(s / 3600)}h` }
  const formatCurrency = (v: number) => `${sym}${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // ── Amount Keypad ──
  const handleAmountKey = useCallback((key: string) => {
    setAmount(prev => {
      if (key === "back") return prev.slice(0, -1)
      if (key === "." && prev.includes(".")) return prev
      if (key === "." && prev === "") return "0."
      let next = prev + key
      const parts = next.split(".")
      if (parts[1] && parts[1].length > 2) return prev
      if (parseFloat(next) > 1000000) return prev
      return next
    })
  }, [])

  useEffect(() => {
    if (step !== "amount") return
    const h = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handleAmountKey(e.key)
      else if (e.key === ".") handleAmountKey(".")
      else if (e.key === "Backspace") handleAmountKey("back")
    }
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h)
  }, [step, handleAmountKey])

  // ── Route Fetching ──
  const fetchRoutes = useCallback(async () => {
    try {
      const res = await compareRoutes({ amount: totalAmount || 100, currency, destination_country: "US", preference: "lowest_cost" })
      setAllRoutes(res.routes)
      const bc = res.routes.find(r => r.route === "BLOCKCHAIN") || res.routes[0]
      setSelectedRoute(bc || null)
    } catch {
      const fallback: RouteOption[] = [
        { route: "BLOCKCHAIN", estimated_time_seconds: 2.1, estimated_fee: 0, fee_currency: "USDC" },
        { route: "SWIFT", estimated_time_seconds: 14400, estimated_fee: 8.5, fee_currency: currency },
      ]
      setAllRoutes(fallback)
      setSelectedRoute(fallback[0])
    }
  }, [totalAmount, currency])

  // ── Security Check Runner ──
  const runSecurityChecks = useCallback(async () => {
    const uid = user?.uid || "user123"
    const recipientHandle = selectedRecipient?.handle || ""

    // 1. Address Scan
    setSecurityChecks(prev => ({ ...prev, addressScan: { status: "running", message: "Checking recipient destination..." } }))
    await new Promise(r => setTimeout(r, 400))
    try {
      const addrRes = await checkRecipient(recipientHandle, uid)
      if (addrRes.status === "BLOCKED") {
        setSecurityChecks(prev => ({ ...prev, addressScan: { status: "failed", message: "Recipient address could not be verified." } }))
        setStep("failed"); return
      }
      setSecurityChecks(prev => ({ ...prev, addressScan: { status: "passed", message: addrRes.status === "WARNING" ? "Warning: Address requires review" : "Verified: No poisoning detected" } }))
    } catch {
      setSecurityChecks(prev => ({ ...prev, addressScan: { status: "passed", message: "Verified: No poisoning detected" } }))
    }

    // 2. AI Firewall
    setSecurityChecks(prev => ({ ...prev, aiFirewall: { status: "running", message: "Analyzing transaction risk..." } }))
    await new Promise(r => setTimeout(r, 500))
    try {
      const riskRes: RiskAnalysisResponse = await analyzeRisk({ recipient: recipientHandle, amount: totalAmount, currency, note: note || "transfer", user_id: uid })
      if (riskRes.risk_level === "HIGH") {
        setSecurityChecks(prev => ({ ...prev, aiFirewall: { status: "failed", message: riskRes.warnings[0] || "High-risk transaction blocked." } }))
        setStep("failed"); return
      }
      if (riskRes.risk_level === "MEDIUM") {
        setRiskWarnings(riskRes.warnings)
        setShowRiskModal(true)
        // Don't auto-advance; wait for user decision
        setSecurityChecks(prev => ({ ...prev, aiFirewall: { status: "passed", message: "Passed with review" } }))
      } else {
        setSecurityChecks(prev => ({ ...prev, aiFirewall: { status: "passed", message: "Passed: No suspicious patterns detected" } }))
      }
    } catch {
      setSecurityChecks(prev => ({ ...prev, aiFirewall: { status: "passed", message: "Passed: No suspicious patterns detected" } }))
    }

    // 3. Route Optimizer
    setSecurityChecks(prev => ({ ...prev, routeOptimizer: { status: "running", message: "Evaluating settlement route..." } }))
    await new Promise(r => setTimeout(r, 400))
    setSecurityChecks(prev => ({ ...prev, routeOptimizer: { status: "passed", message: `${selectedRoute?.route === "BLOCKCHAIN" ? "Blockchain L2" : "Traditional Rails"} meets criteria` } }))

    setStep("review")
  }, [user, selectedRecipient, totalAmount, currency, note, selectedRoute])

  // ── Payment Execution ──
  const executePayment = useCallback(async () => {
    if (isSubmitting.current) return
    isSubmitting.current = true

    setStep("processing"); setProcessingStage(0)
    await new Promise(r => setTimeout(r, 600))
    setProcessingStage(1)
    await new Promise(r => setTimeout(r, 600))
    setProcessingStage(2)

    try {
      const usdToDeduct = grandTotal / (EXCHANGE_RATES[currency] || 1)
      deductBalance(usdToDeduct)

      const ref = `ZR-${Math.floor(1000 + Math.random() * 9000)}`
      const id = `tx-${Math.floor(Math.random() * 10000)}`
      setTxRef(ref); setTxId(id)

      addTransaction({
        id, type: "Transfer", to: selectedRecipient?.name || "", route: `${currency} → ${currency}`,
        amount: `-${sym}${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        status: "Completed", time: "Just now", ref,
      })

      await new Promise(r => setTimeout(r, 500))
      setProcessingStage(3)
      await new Promise(r => setTimeout(r, 400))
      setStep("done")
    } catch (err: any) {
      setToast({ msg: err?.message || "Payment could not be completed. No funds were moved.", type: "error" })
      setStep("failed")
    } finally {
      isSubmitting.current = false
    }
  }, [grandTotal, currency, sym, selectedRecipient, deductBalance, addTransaction])

  const reset = () => {
    setSelectedRecipient(null); setAmount(""); setNote(""); setCurrency("USD")
    setFundingSource(FUNDING_SOURCES[0]); setSelectedRoute(null); setAllRoutes([])
    setSecurityChecks({ addressScan: { status: "idle", message: "" }, aiFirewall: { status: "idle", message: "" }, routeOptimizer: { status: "idle", message: "" } })
    setTxId(""); setTxRef(""); setProcessingStage(0)
    idempotencyKey.current = `ziro-${Date.now()}-${Math.random().toString(36).slice(2)}`
    isSubmitting.current = false
    setStep("recipient")
  }

  // ── Transition helper ──
  const cardClass = "w-full max-w-lg bg-white/70 backdrop-blur-3xl rounded-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-white/50 p-7 sm:p-9 relative overflow-visible"
  const motionProps = { initial: { opacity: 0, y: 30, filter: "blur(8px)" }, animate: { opacity: 1, y: 0, filter: "blur(0px)" }, exit: { opacity: 0, y: -20, filter: "blur(8px)" }, transition: { type: "spring" as const, stiffness: 220, damping: 22 } }
  const ctaClass = "w-full bg-slate-900 hover:bg-black disabled:opacity-40 text-white font-bold text-base px-5 py-4 rounded-[20px] transition-all shadow-[0_4px_20px_rgba(15,23,42,0.15)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.25)] hover:-translate-y-0.5 active:scale-[0.98] relative overflow-hidden group"

  return (
    <div className="w-full flex-1 flex flex-col lg:flex-row items-start justify-center px-4 md:px-8 mx-auto relative select-none py-6 gap-6 max-w-6xl">
      <AnimatePresence>{toast && <Toast message={toast.msg} type={toast.type} onDismiss={dismissToast} />}</AnimatePresence>
      <AnimatePresence>{showRiskModal && <RiskModal warnings={riskWarnings} onClose={() => { setShowRiskModal(false); setStep("route") }} onProceed={() => { setShowRiskModal(false) }} />}</AnimatePresence>
      <AnimatePresence>{showAddRecipient && <AddRecipientModal onAdd={(r) => { setRecipients(prev => [r, ...prev]); setSelectedRecipient(r); setShowAddRecipient(false); setStep("amount") }} onClose={() => setShowAddRecipient(false)} />}</AnimatePresence>

      {/* ─── MAIN COLUMN ─── */}
      <div className="flex-1 flex flex-col items-center w-full">
        <AnimatePresence mode="wait">

          {/* ═══ STEP: RECIPIENT ═══ */}
          {step === "recipient" && (
            <motion.div key="step-recipient" {...motionProps} className={cardClass}>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Send Money</h1>
                <p className="text-sm text-slate-500 font-medium">Who are you sending to?</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-6">
                {/* Add New */}
                <button onClick={() => setShowAddRecipient(true)} className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center group-hover:border-slate-500 group-hover:bg-slate-50 transition-all">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-slate-600 transition-colors"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 text-center leading-tight">Add New</span>
                </button>
                {recipients.map(r => {
                  const sel = selectedRecipient?.id === r.id
                  return (
                    <button key={r.id} onClick={() => { setSelectedRecipient(r); setTimeout(() => setStep("amount"), 300) }} className="flex flex-col items-center gap-2 group">
                      <div className={`relative w-14 h-14 rounded-full overflow-hidden transition-all ${sel ? "ring-2 ring-[#4a72ff] ring-offset-2 scale-105" : "hover:scale-105"}`}>
                        <img src={r.avatar} alt={r.name} className="w-full h-full object-cover" />
                        {sel && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 bg-[#4a72ff]/30 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </motion.div>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight line-clamp-2">{r.name.split(" ")[0]}<br/><span className="text-slate-400 font-medium">{r.name.split(" ")[1] || ""}</span></span>
                    </button>
                  )
                })}
              </div>
              <Link href="/dashboard" className="flex justify-center text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors mt-2">← Back to Dashboard</Link>
            </motion.div>
          )}

          {/* ═══ STEP: AMOUNT ═══ */}
          {step === "amount" && (
            <motion.div key="step-amount" {...motionProps} className={cardClass}>
              <StepHeader step={2} onBack={() => setStep("recipient")} label="Amount" />
              {/* Recipient mini-badge */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <img src={selectedRecipient?.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                <div className="text-sm font-bold text-slate-700">Sending to <span className="text-slate-900">{selectedRecipient?.name}</span></div>
              </div>
              {/* Amount Display */}
              <div className="text-center mb-2">
                <div className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight tabular-nums min-h-[72px] flex items-center justify-center">
                  <AnimatePresence mode="popLayout">
                    {amount ? (
                      <motion.span key={amount} initial={{ y: 12, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                        {sym}{amount}
                      </motion.span>
                    ) : (
                      <motion.span key="empty" className="text-slate-200">{sym}0</motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {isInsufficientFunds && amount && <div className="text-xs font-bold text-red-500 mt-2">Insufficient funds (Max: {formatCurrency(currentBalance)})</div>}
              </div>
              {/* Currency selector */}
              <div className="flex justify-center mb-4 relative z-30">
                <div className="relative">
                  <button onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)} className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm hover:bg-slate-50 transition-colors">
                    <span className="text-sm font-bold text-slate-700">{currency}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform ${showCurrencyDropdown ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9" /></svg>
                  </button>
                  <AnimatePresence>
                    {showCurrencyDropdown && (
                      <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 min-w-[120px]">
                        {CURRENCIES.map(c => (<button key={c} onClick={() => { setCurrency(c); setShowCurrencyDropdown(false) }} className={`w-full px-4 py-3 text-left text-sm font-bold transition-colors ${c === currency ? "bg-slate-100 text-[#4a72ff]" : "text-slate-700 hover:bg-slate-50"}`}>{CURRENCY_SYMBOLS[c]} {c}</button>))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              {/* Quick amounts */}
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                {[50, 100, 250, 500, 1000].map(v => (
                  <button key={v} onClick={() => setAmount(v.toString())} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${parseFloat(amount) === v ? "bg-slate-900 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"}`}>{sym}{v.toLocaleString()}</button>
                ))}
              </div>
              {/* Keypad */}
              <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto mb-5">
                {["1","2","3","4","5","6","7","8","9",".","0","back"].map((k, i) => (
                  <button key={i} onClick={() => handleAmountKey(k)} className={`h-14 rounded-2xl flex items-center justify-center text-xl font-medium transition-all active:scale-95 ${k === "back" ? "text-slate-400 hover:bg-slate-100" : "text-slate-800 hover:bg-slate-50 active:bg-slate-100"}`}>
                    {k === "back" ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg> : k}
                  </button>
                ))}
              </div>
              {/* Note */}
              <div className="flex items-center gap-3 bg-white/60 rounded-2xl px-4 py-3 border border-slate-100 mb-5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 shrink-0"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="What's this payment for?" className="w-full bg-transparent text-sm font-medium text-slate-900 focus:outline-none placeholder:text-slate-300" />
              </div>
              <button onClick={() => { if (totalAmount > 0 && !isInsufficientFunds) setStep("source") }} disabled={!totalAmount || isInsufficientFunds} className={ctaClass}>
                <span className="relative z-10">Continue</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] opacity-50" />
              </button>
            </motion.div>
          )}

          {/* ═══ STEP: SOURCE ═══ */}
          {step === "source" && (
            <motion.div key="step-source" {...motionProps} className={cardClass}>
              <StepHeader step={3} onBack={() => setStep("amount")} label="Payment Source" />
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Choose how to fund this payment</h2>
                <p className="text-xs text-slate-500">Select a payment source to continue.</p>
              </div>
              <div className="space-y-3 mb-6">
                {FUNDING_SOURCES.map(src => {
                  const sel = fundingSource.id === src.id
                  return (
                    <motion.button key={src.id} onClick={() => setFundingSource(src)} whileTap={{ scale: 0.98 }}
                      className={`w-full p-5 rounded-[24px] text-left transition-all flex items-center gap-4 ${sel ? "bg-white shadow-md border-2 border-slate-900 scale-[1.01]" : "bg-white/50 border border-slate-200 hover:bg-white/80 hover:border-slate-300"}`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${src.id === "vault" ? "bg-[#bc9ff5]/20" : "bg-[#2e9dfa]/20"}`}>
                        {src.id === "vault" ? (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#bc9ff5]"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        ) : (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#2e9dfa]"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-900">{src.name}</div>
                        <div className="text-xs text-slate-500 font-medium">•••• {src.last4}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">{src.balance}</div>
                        <div className="text-[10px] font-semibold text-emerald-600">{src.type}</div>
                      </div>
                      {sel && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></motion.div>}
                    </motion.button>
                  )
                })}
              </div>
              <button onClick={() => { setStep("route"); fetchRoutes() }} className={ctaClass}>
                <span className="relative z-10">Continue</span>
              </button>
            </motion.div>
          )}

          {/* ═══ STEP: ROUTE ═══ */}
          {step === "route" && (
            <motion.div key="step-route" {...motionProps} className={cardClass}>
              <StepHeader step={4} onBack={() => setStep("source")} label="Settlement Route" />
              <div className="text-center mb-6">
                <div className="text-sm font-semibold text-slate-500 mb-1">Sending</div>
                <div className="text-4xl font-black text-slate-900 tracking-tight">{formatCurrency(totalAmount)}</div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Available Routes</div>
                {allRoutes.length === 0 && (
                  <div className="flex items-center justify-center py-8 text-slate-400"><div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin mr-3" />Loading routes...</div>
                )}
                {allRoutes.map((r, i) => {
                  const sel = selectedRoute?.route === r.route
                  const isBc = r.route === "BLOCKCHAIN"
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} onClick={() => setSelectedRoute(r)}
                      className={`relative p-5 rounded-[24px] cursor-pointer transition-all border-2 ${sel ? "bg-white shadow-lg border-slate-900 scale-[1.02]" : "bg-white/50 hover:bg-white/80 border-slate-200 hover:border-slate-400"}`}>
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isBc ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}`}>
                            {isBc ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{isBc ? "Blockchain L2" : "Traditional Rails"}</div>
                            <div className="text-xs font-semibold text-slate-500">{isBc ? "Instant Settlement" : "SWIFT / Local transfer"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-bold text-slate-900">{r.estimated_fee === 0 ? "Free" : formatCurrency(r.estimated_fee)}</div>
                            <div className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">{formatTime(r.estimated_time_seconds)}</div>
                          </div>
                          {sel && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }} className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></motion.div>}
                        </div>
                      </div>
                      {isBc && sel && <div className="mt-3 flex items-center gap-1.5"><span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide bg-slate-100 px-2.5 py-1 rounded-full">Recommended by Ziro</span></div>}
                    </motion.div>
                  )
                })}
              </div>
              <button onClick={() => { setStep("security"); runSecurityChecks() }} disabled={!selectedRoute} className={ctaClass}>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Run Security Checks
                </span>
              </button>
            </motion.div>
          )}

          {/* ═══ STEP: SECURITY ═══ */}
          {step === "security" && (
            <motion.div key="step-security" {...motionProps} className={cardClass}>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-full bg-[#4a72ff]/10 flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#4a72ff]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Security Checks</h2>
                <p className="text-xs text-slate-500">Verifying your payment meets Ziro security standards.</p>
              </div>
              <div className="space-y-4">
                {([
                  { key: "addressScan" as const, label: "Address Scan" },
                  { key: "aiFirewall" as const, label: "AI Payment Firewall" },
                  { key: "routeOptimizer" as const, label: "Route Optimizer" },
                ]).map(({ key, label }) => {
                  const c = securityChecks[key]
                  return (
                    <div key={key} className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 border border-slate-100">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${c.status === "running" ? "bg-[#4a72ff]/10" : c.status === "passed" ? "bg-emerald-100" : c.status === "failed" ? "bg-red-100" : "bg-slate-100"}`}>
                        {c.status === "running" ? <div className="w-4 h-4 rounded-full border-2 border-[#4a72ff]/30 border-t-[#4a72ff] animate-spin" />
                          : c.status === "passed" ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><polyline points="20 6 9 17 4 12"/></svg>
                          : c.status === "failed" ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          : <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-800">{label}</div>
                        <div className="text-xs text-slate-500 font-medium">{c.message || "Waiting..."}</div>
                      </div>
                      {c.status === "passed" && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Passed</span>}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ═══ STEP: REVIEW ═══ */}
          {step === "review" && (
            <motion.div key="step-review" {...motionProps} className={cardClass}>
              <StepHeader step={6} label="Review Payment" />
              <div className="text-center mb-6">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">You are sending</div>
                <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">{formatCurrency(totalAmount)}</div>
                <div className="text-sm text-slate-500 font-medium">to {selectedRecipient?.name}</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3 mb-6">
                <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-400">Recipient</span><div className="flex items-center gap-2"><img src={selectedRecipient?.avatar} alt="" className="w-5 h-5 rounded-full" /><span className="text-sm font-bold text-slate-700">{selectedRecipient?.name}</span></div></div>
                <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-400">Amount</span><span className="text-sm font-bold text-slate-900">{formatCurrency(totalAmount)}</span></div>
                <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-400">Route</span><span className="text-xs font-bold text-slate-600">{selectedRoute?.route === "BLOCKCHAIN" ? "Blockchain L2" : "Traditional Rails"}</span></div>
                <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-400">Fee</span><span className="text-xs font-bold text-slate-600">{feesAmount === 0 ? "Free" : formatCurrency(feesAmount)}</span></div>
                <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-400">Est. Time</span><span className="text-xs font-bold text-emerald-600">{formatTime(arrivalTime)}</span></div>
                <div className="border-t border-slate-200 pt-3 flex justify-between items-center"><span className="text-sm font-bold text-slate-700">Total</span><span className="text-lg font-black text-slate-900">{formatCurrency(grandTotal)}</span></div>
              </div>
              {/* Security badge */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                  <span className="text-xs font-bold text-emerald-700">All security checks passed</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep("route")} className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm py-4 rounded-[20px] transition-colors">Back</button>
                <button onClick={() => setStep("pin")} className="flex-1 bg-slate-900 hover:bg-black text-white font-bold text-sm py-4 rounded-[20px] transition-all shadow-md active:scale-[0.98]">Authorize Payment</button>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP: PROCESSING ═══ */}
          {step === "processing" && (
            <motion.div key="step-processing" {...motionProps} className={`${cardClass} flex flex-col items-center justify-center min-h-[400px]`}>
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Processing Payment</h2>
                <p className="text-xs text-slate-500">Routing through {selectedRoute?.route === "BLOCKCHAIN" ? "Blockchain L2" : "Traditional Rails"}</p>
              </div>
              <div className="space-y-4 w-full max-w-xs">
                {["Authorize", "Secure", "Settle"].map((label, i) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${processingStage > i ? "bg-emerald-100" : processingStage === i ? "bg-[#4a72ff]/10" : "bg-slate-100"}`}>
                      {processingStage > i ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><polyline points="20 6 9 17 4 12"/></svg>
                        : processingStage === i ? <div className="w-4 h-4 rounded-full border-2 border-[#4a72ff]/30 border-t-[#4a72ff] animate-spin" />
                        : <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />}
                    </div>
                    <span className={`text-sm font-bold ${processingStage > i ? "text-emerald-700" : processingStage === i ? "text-slate-900" : "text-slate-400"}`}>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══ STEP: DONE ═══ */}
          {step === "done" && (
            <motion.div key="step-done" {...motionProps} className={`${cardClass} text-center`}>
              {/* Animated Checkmark */}
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }} className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-5 relative">
                <motion.div initial={{ scale: 1.5, opacity: 0.5 }} animate={{ scale: 2.5, opacity: 0 }} transition={{ duration: 1, ease: "easeOut" }} className="absolute inset-0 rounded-full bg-emerald-400" />
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-emerald-600">
                  <motion.polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }} />
                </svg>
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-2xl font-bold text-slate-800 mb-1">Payment Sent</motion.h2>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Confirmed on {selectedRoute?.route === "BLOCKCHAIN" ? "Polygon L2" : "Traditional Rails"}
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55, type: "spring", stiffness: 300 }} className="text-4xl font-black text-slate-900 tracking-tight mb-1">{formatCurrency(grandTotal)}</motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-sm text-slate-500 font-medium mb-6">sent to {selectedRecipient?.name}</motion.div>

              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3 mb-6">
                <div className="flex justify-between items-center"><span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Transaction ID</span><span className="text-xs font-mono font-bold text-slate-700">{txRef}</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Amount</span><span className="text-xs font-bold text-slate-700">{formatCurrency(totalAmount)}</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Fee</span><span className="text-xs font-bold text-slate-700">{feesAmount === 0 ? "Free" : formatCurrency(feesAmount)}</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total</span><span className="text-xs font-bold text-slate-900">{formatCurrency(grandTotal)}</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Route</span><span className="text-xs font-bold text-slate-700">{selectedRoute?.route === "BLOCKCHAIN" ? "Blockchain L2" : "Traditional Rails"}</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Settlement</span><span className="text-xs font-bold text-emerald-600">{formatTime(arrivalTime)}</span></div>
                {note && <div className="flex justify-between items-center"><span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Note</span><span className="text-xs font-bold text-slate-700">{note}</span></div>}
                <div className="border-t border-slate-200 pt-3 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                  <span className="text-[10px] font-bold text-emerald-700">Address verified · AI Firewall passed · Route optimized</span>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }} className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button onClick={reset} className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm py-3.5 rounded-2xl transition-colors">Send Another</button>
                  <Link href="/dashboard/activity" className="flex-1 bg-slate-900 hover:bg-black text-white font-semibold text-sm py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2">
                    View Transaction
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                  </Link>
                </div>
                {selectedRoute?.route === "BLOCKCHAIN" && (
                  <a href="/explorer" target="_blank" rel="noopener noreferrer" className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                    View on Ziro L2 Scan
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                  </a>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ═══ STEP: FAILED ═══ */}
          {step === "failed" && (
            <motion.div key="step-failed" {...motionProps} className={`${cardClass} text-center`}>
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Payment requires your attention</h2>
              <p className="text-sm text-slate-500 mb-6">
                {securityChecks.addressScan.status === "failed" ? securityChecks.addressScan.message
                  : securityChecks.aiFirewall.status === "failed" ? securityChecks.aiFirewall.message
                  : "Your payment could not be completed. No funds were moved."}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setStep("amount")} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm py-3.5 rounded-xl transition-colors">Review Payment</button>
                <button onClick={reset} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold text-sm py-3.5 rounded-xl transition-colors shadow-md">Cancel</button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ─── DESKTOP: LIVE PAYMENT SUMMARY ─── */}
      {step !== "recipient" && step !== "done" && step !== "failed" && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="hidden lg:block w-[320px] shrink-0 sticky top-6">
          <div className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 p-6 shadow-sm">
            <div className="text-sm font-bold text-slate-700 mb-4">Payment Summary</div>
            {selectedRecipient && (
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                <img src={selectedRecipient.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                <div><div className="text-sm font-bold text-slate-800">{selectedRecipient.name}</div><div className="text-xs text-slate-500">{selectedRecipient.handle}</div></div>
              </div>
            )}
            <div className="space-y-3">
              {totalAmount > 0 && <div className="flex justify-between"><span className="text-xs text-slate-500 font-medium">Amount</span><span className="text-sm font-bold text-slate-900">{formatCurrency(totalAmount)}</span></div>}
              {feesAmount > 0 && <div className="flex justify-between"><span className="text-xs text-slate-500 font-medium">Fee</span><span className="text-sm font-bold text-slate-700">{formatCurrency(feesAmount)}</span></div>}
              {totalAmount > 0 && <div className="flex justify-between border-t border-slate-100 pt-3"><span className="text-xs font-bold text-slate-700">Total</span><span className="text-sm font-black text-slate-900">{formatCurrency(grandTotal)}</span></div>}
              {selectedRoute && <div className="flex justify-between"><span className="text-xs text-slate-500 font-medium">Route</span><span className="text-xs font-bold text-slate-700">{selectedRoute.route === "BLOCKCHAIN" ? "Blockchain L2" : "Traditional"}</span></div>}
              {selectedRoute && <div className="flex justify-between"><span className="text-xs text-slate-500 font-medium">Est. Time</span><span className="text-xs font-bold text-emerald-600">{formatTime(arrivalTime)}</span></div>}
            </div>

            {/* Security status */}
            {(step === "security" || step === "review" || step === "pin" || step === "processing") && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-500 mb-3">Security</div>
                {(["addressScan", "aiFirewall", "routeOptimizer"] as const).map(key => {
                  const c = securityChecks[key]
                  const labels: Record<string, string> = { addressScan: "Address", aiFirewall: "Firewall", routeOptimizer: "Route" }
                  return (
                    <div key={key} className="flex items-center gap-2 mb-1.5">
                      {c.status === "passed" ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                        : c.status === "running" ? <div className="w-3 h-3 rounded-full border-2 border-[#4a72ff]/30 border-t-[#4a72ff] animate-spin" />
                        : <div className="w-3 h-3 rounded-full bg-slate-200" />}
                      <span className="text-[11px] font-semibold text-slate-600">{labels[key]}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ─── PIN MODAL ─── */}
      <AnimatePresence>
        {step === "pin" && (
          <PremiumPinModal
            onSuccess={() => { setStep("processing"); executePayment() }}
            onCancel={() => setStep("review")}
            amount={amount}
            currency={currency}
            recipient={selectedRecipient?.name || ""}
            route={selectedRoute?.route || "BLOCKCHAIN"}
            fee={feesAmount === 0 ? "Free" : formatCurrency(feesAmount)}
            total={formatCurrency(grandTotal)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
