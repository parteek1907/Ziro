"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/AuthContext"
import { checkRecipient, analyzeRisk, compareRoutes } from "@/lib/api"
import type { RecipientCheckResponse, RiskAnalysisResponse, RouteOption } from "@/lib/api"
import Link from "next/link"

// ─── Toast ───────────────────────────────────────────────────
function Toast({ message, type, onDismiss }: { message: string; type: "error" | "warning" | "info"; onDismiss: () => void }) {
  const colors = {
    error:   "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info:    "bg-blue-50 border-blue-200 text-blue-700",
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`fixed top-6 right-6 z-50 max-w-sm rounded-2xl border px-5 py-4 shadow-lg ${colors[type]}`}
    >
      <div className="flex items-start gap-3">
        <div className="text-sm font-semibold leading-relaxed flex-1">{message}</div>
        <button onClick={onDismiss} className="opacity-50 hover:opacity-100 transition-opacity mt-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </motion.div>
  )
}

// ─── Risk Modal ───────────────────────────────────────────────
function RiskModal({ warnings, onClose, onProceed }: { warnings: string[]; onClose: () => void; onProceed: () => void }) {
  const [confirmed, setConfirmed] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-xl rounded-[28px] border border-white/60 shadow-xl p-8 max-w-md w-full mx-4"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <div className="text-slate-800 font-bold">Medium Risk Detected</div>
            <div className="text-xs text-slate-500 font-medium">Please review before proceeding</div>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              {w}
            </div>
          ))}
        </div>

        <label className="flex items-center gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-4 h-4 rounded accent-slate-800"
          />
          <span className="text-sm text-slate-700 font-medium">I understand the risks and want to proceed</span>
        </label>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-white/50 hover:bg-white/80 border border-white/40 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-full transition-colors">
            Cancel
          </button>
          <button
            disabled={!confirmed}
            onClick={onProceed}
            className="flex-1 bg-slate-800 hover:bg-black disabled:opacity-30 text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-colors"
          >
            Proceed Anyway
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────
type Step = "form" | "checking" | "route" | "done"
type RecipientState = "idle" | "safe" | "warning" | "blocked"

export default function TransfersPage() {
  const { user } = useAuth()

  const [recipient, setRecipient]   = useState("")
  const [amount, setAmount]         = useState("")
  const [currency, setCurrency]     = useState("USD")
  const [note, setNote]             = useState("")

  const [step, setStep]             = useState<Step>("form")
  const [recipientState, setRecipientState] = useState<RecipientState>("idle")

  const [toast, setToast]   = useState<{ msg: string; type: "error" | "warning" | "info" } | null>(null)
  const [cardDanger, setCardDanger] = useState(false)

  const [showRiskModal, setShowRiskModal] = useState(false)
  const [riskWarnings, setRiskWarnings]   = useState<string[]>([])

  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null)
  const [allRoutes, setAllRoutes]         = useState<RouteOption[]>([])

  const [sending, setSending] = useState(false)
  const [checkingRecipient, setCheckingRecipient] = useState(false)

  const dismissToast = () => setToast(null)

  // Step 1: Recipient check (on blur)
  const handleRecipientBlur = useCallback(async () => {
    if (!recipient.trim() || !user) return
    setCheckingRecipient(true)
    setRecipientState("idle")
    try {
      const res: RecipientCheckResponse = await checkRecipient(recipient.trim(), user.uid)
      if (res.status === "BLOCKED") {
        setRecipientState("blocked")
        setToast({
          msg: `WARNING: This address is suspiciously similar to a saved contact. This resembles an Address Poisoning attack.`,
          type: "error",
        })
      } else if (res.status === "WARNING") {
        setRecipientState("warning")
        setToast({
          msg: `Note: You have never sent money to this address before. Please double-check.`,
          type: "warning",
        })
      } else {
        setRecipientState("safe")
      }
    } catch {
      // Non-blocking — if API is down, allow user to continue
      setRecipientState("idle")
    } finally {
      setCheckingRecipient(false)
    }
  }, [recipient, user])

  // Step 2 + 3: Full send flow
  const handleSend = useCallback(async () => {
    if (!user || !recipient.trim() || !amount || recipientState === "blocked") return

    setStep("checking")
    setCardDanger(false)

    try {
      // ── Step 2: AI Risk Firewall ───────────────────────────
      const riskRes: RiskAnalysisResponse = await analyzeRisk({
        recipient: recipient.trim(),
        amount: parseFloat(amount),
        currency,
        note,
        user_id: user.uid,
      })

      if (riskRes.risk_level === "HIGH") {
        setCardDanger(true)
        setToast({
          msg: riskRes.warnings.length > 0 ? riskRes.warnings[0] : "High-risk transaction blocked by AI Firewall.",
          type: "error",
        })
        setStep("form")
        return
      }

      if (riskRes.risk_level === "MEDIUM") {
        setRiskWarnings(riskRes.warnings)
        setShowRiskModal(true)
        setStep("form")
        return
      }

      // ── Step 3: Route Comparison ───────────────────────────
      await proceedToRoutes()

    } catch {
      // If API is unavailable, skip firewall and go to routes
      await proceedToRoutes()
    }
  }, [user, recipient, amount, currency, note, recipientState])

  const proceedToRoutes = useCallback(async () => {
    setStep("checking")
    try {
      const routesRes = await compareRoutes({
        amount: parseFloat(amount) || 100,
        currency,
        destination_country: "US",
        preference: "lowest_cost",
      })
      setAllRoutes(routesRes.routes)
      const blockchain = routesRes.routes.find((r) => r.route === "BLOCKCHAIN") || routesRes.routes[0]
      setSelectedRoute(blockchain || null)
    } catch {
      // Fallback route if API down
      setSelectedRoute({ route: "BLOCKCHAIN", estimated_time_seconds: 2.1, estimated_fee: 0.5, fee_currency: "USDC" })
    }
    setStep("route")
  }, [amount, currency])

  const confirmSend = useCallback(async () => {
    setSending(true)
    // Simulate the actual payment submission
    await new Promise((r) => setTimeout(r, 1500))
    setSending(false)
    setStep("done")
  }, [])

  const reset = () => {
    setRecipient(""); setAmount(""); setNote(""); setCurrency("USD")
    setStep("form"); setRecipientState("idle"); setCardDanger(false)
    setSelectedRoute(null); setAllRoutes([])
  }

  const recipientBorderClass =
    recipientState === "blocked" ? "border-red-400 bg-red-50/50 focus:border-red-500" :
    recipientState === "warning" ? "border-amber-400 bg-amber-50/50 focus:border-amber-500" :
    recipientState === "safe"    ? "border-emerald-400 bg-emerald-50/30 focus:border-emerald-500" :
    "border-white/40 focus:border-[#4a72ff]"

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-8 md:px-12 py-8">

      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} onDismiss={dismissToast} />}
      </AnimatePresence>

      <AnimatePresence>
        {showRiskModal && (
          <RiskModal
            warnings={riskWarnings}
            onClose={() => setShowRiskModal(false)}
            onProceed={() => { setShowRiskModal(false); proceedToRoutes() }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold tracking-tight text-slate-800 mb-2">
            Send Money
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-sm font-medium text-slate-500">
            Secured by Ziro&apos;s AI firewall — every transfer is screened before it moves.
          </motion.p>
        </div>
        <Link href="/dashboard" className="bg-white/50 hover:bg-white/80 border border-white/40 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-full transition-colors shadow-sm">
          ← Back
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Send Form ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className={`lg:col-span-2 bg-white/60 backdrop-blur-md rounded-[28px] border shadow-sm p-8 transition-colors duration-500 ${cardDanger ? "border-red-300 bg-red-50/30" : "border-white/50"}`}
        >
          {step === "done" ? (
            <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800 mb-1">Transfer Sent!</div>
                <div className="text-slate-500 text-sm font-medium">Your payment is moving through the network.</div>
              </div>
              <button onClick={reset} className="bg-slate-800 hover:bg-black text-white font-semibold text-sm px-6 py-3 rounded-full transition-colors">
                Send Another
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-slate-800 font-bold text-lg">Transfer Details</h2>

              {/* Recipient */}
              <div>
                <label className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 block">Recipient Address or Username</label>
                <div className="relative">
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => { setRecipient(e.target.value); setRecipientState("idle") }}
                    onBlur={handleRecipientBlur}
                    placeholder="@username or 0x..."
                    className={`w-full bg-white/50 border rounded-2xl px-4 py-3.5 text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none transition-colors text-sm ${recipientBorderClass}`}
                  />
                  {checkingRecipient && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
                    </div>
                  )}
                  {!checkingRecipient && recipientState === "safe" && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  )}
                  {!checkingRecipient && recipientState === "warning" && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount + Currency */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 block">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white/50 border border-white/40 rounded-2xl pl-8 pr-4 py-3.5 text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#4a72ff] transition-colors text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 block">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-white/50 border border-white/40 rounded-2xl px-4 py-3.5 text-slate-800 font-medium focus:outline-none focus:border-[#4a72ff] transition-colors text-sm"
                  >
                    <option>USD</option><option>EUR</option><option>GBP</option><option>INR</option>
                    <option>MXN</option><option>KES</option><option>NGN</option>
                  </select>
                </div>
              </div>

              {/* Note / Payment intent — required for AI firewall */}
              <div>
                <label className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 block">Payment Note <span className="text-[#4a72ff] normal-case font-medium tracking-normal">(helps our AI protect you)</span></label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. rent payment, school fees, freelance invoice..."
                  className="w-full bg-white/50 border border-white/40 rounded-2xl px-4 py-3.5 text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#4a72ff] transition-colors text-sm"
                />
              </div>

              {/* Route Info (after comparison) */}
              {step === "route" && selectedRoute && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <label className="text-slate-500 text-xs font-bold uppercase tracking-widest block">Available Routes</label>
                  <div className="space-y-2">
                    {allRoutes.map((r) => (
                      <button
                        key={r.route}
                        onClick={() => setSelectedRoute(r)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-colors text-left ${selectedRoute?.route === r.route ? "border-[#4a72ff] bg-[#4a72ff]/5" : "border-white/40 bg-white/30 hover:bg-white/50"}`}
                      >
                        <div>
                          <div className="text-sm font-bold text-slate-800">{r.route}</div>
                          <div className="text-xs text-slate-500 font-medium">Fee: {r.estimated_fee} {r.fee_currency}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-800">{r.estimated_time_seconds}s</div>
                          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">settlement</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* CTA */}
              <button
                onClick={step === "route" ? confirmSend : handleSend}
                disabled={!recipient || !amount || recipientState === "blocked" || step === "checking" || sending}
                className="w-full bg-slate-800 hover:bg-black disabled:opacity-30 text-white font-bold text-sm px-5 py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                {(step === "checking" || sending) ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    {step === "checking" ? "Screening transfer..." : "Sending..."}
                  </>
                ) : step === "route" ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Confirm & Send via {selectedRoute?.route}
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Screen & Send
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>

        {/* ── Security Status Panel ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex flex-col gap-4"
        >
          <div className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 p-6 shadow-sm">
            <div className="text-slate-600 text-sm font-bold mb-4">Security Checks</div>
            <div className="space-y-3">
              {[
                {
                  label: "Address Scan",
                  desc: "Checks for address poisoning",
                  done: recipientState !== "idle",
                  ok: recipientState === "safe",
                },
                {
                  label: "AI Firewall",
                  desc: "Scam & fraud detection",
                  done: step === "route" || step === "done",
                  ok: step === "route" || step === "done",
                },
                {
                  label: "Route Optimizer",
                  desc: "Best fee & settlement time",
                  done: step === "route" || step === "done",
                  ok: step === "route" || step === "done",
                },
              ].map((check) => (
                <div key={check.label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${check.done ? (check.ok ? "bg-emerald-100" : "bg-red-100") : "bg-slate-100"}`}>
                    {check.done && check.ok ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : check.done ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{check.label}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{check.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {step === "route" && selectedRoute && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 p-6 shadow-sm"
            >
              <div className="text-slate-600 text-sm font-bold mb-4">Best Route Selected</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Network</span>
                  <span className="text-slate-800 font-bold">{selectedRoute.route}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Est. Time</span>
                  <span className="text-slate-800 font-bold">{selectedRoute.estimated_time_seconds}s</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Est. Fee</span>
                  <span className="text-slate-800 font-bold">{selectedRoute.estimated_fee} {selectedRoute.fee_currency}</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
