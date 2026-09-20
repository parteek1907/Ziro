"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useHelpStore } from "@/store/useHelpStore"
import { useAuth } from "@/lib/AuthContext"

// --- CONSTANTS ---

const ZIRO_FEATURES = [
  {
    title: "Smart Settlement Engine",
    description: "Understand how Ziro routes payments across traditional and decentralized rails.",
    href: "/dashboard/transfers",
    cta: "Send Money"
  },
  {
    title: "AI Payment Firewall",
    description: "Learn how Ziro detects suspicious payments, scams, and address poisoning.",
    href: "/dashboard/activity",
    cta: "Review Activity"
  },
  {
    title: "Human Consultant",
    description: "Get one-to-one help from a verified payment consultant.",
    href: "/dashboard/consultants",
    cta: "Talk to a Consultant"
  },
  {
    title: "Offline Payment Engine",
    description: "Learn how transactions can be queued when you don't have an internet connection.",
    href: "/dashboard/vault",
    cta: "Open Vault"
  },
  {
    title: "TrustScore",
    description: "Understand your privacy-preserving financial TrustScore.",
    href: "/dashboard/trustscore",
    cta: "View TrustScore"
  },
  {
    title: "Identity & Profiles",
    description: "Manage your Ziro identity, profile, and account information.",
    href: "/dashboard/settings",
    cta: "Manage Settings"
  }
]

const FAQS = [
  {
    category: "PAYMENTS",
    questions: [
      { q: "How do I send money?", a: "Open Send Money, enter the recipient, amount, currency, and payment note, then review Ziro's security checks before sending." },
      { q: "Why is my payment being screened?", a: "Ziro screens transfers for potential security risks before they move. This helps identify suspicious destinations and potential scams." }
    ]
  },
  {
    category: "SECURITY",
    questions: [
      { q: "What is Ziro's AI Payment Firewall?", a: "Ziro's AI Payment Firewall analyzes payment activity and destination information to help identify suspicious transactions and address-poisoning risks." },
      { q: "What is address poisoning?", a: "Address poisoning is a scam technique where an attacker creates or uses a misleading payment address that resembles a legitimate destination. Always verify the recipient before sending funds." }
    ]
  },
  {
    category: "TRANSFERS",
    questions: [
      { q: "How does Ziro choose a settlement route?", a: "Ziro's Smart Settlement Engine evaluates available payment routes across traditional and decentralized rails to determine an appropriate settlement path." },
      { q: "Why is my transfer pending?", a: "A transfer may remain pending while payment and settlement processing is completed. Check Activity for the latest status." }
    ]
  },
  {
    category: "TRUSTSCORE",
    questions: [
      { q: "What is TrustScore?", a: "TrustScore is Ziro's privacy-preserving financial score designed to represent relevant financial behavior without exposing unnecessary personal information." },
      { q: "Can I improve my TrustScore?", a: "Consistent and responsible financial activity can contribute to your TrustScore. Use the TrustScore section to understand the factors available in your account." }
    ]
  },
  {
    category: "OFFLINE PAYMENTS",
    questions: [
      { q: "Can I make a payment without internet?", a: "Ziro's Offline Payment Engine can queue transactions when connectivity is unavailable. The transaction can be processed when connectivity becomes available." }
    ]
  },
  {
    category: "CONSULTANTS",
    questions: [
      { q: "What can a Ziro consultant help with?", a: "Consultants can provide one-to-one guidance for payment issues, transfers, remittances, and other supported Ziro payment questions." },
      { q: "How much does a consultation cost?", a: "Consultation pricing depends on the consultant and session duration. The final price is shown before you confirm your booking." }
    ]
  },
  {
    category: "ACCOUNT",
    questions: [
      { q: "How do I change my account information?", a: "Open Settings to manage your profile, preferences, security, notifications, and other account settings." }
    ]
  }
]

const PAYMENT_ISSUES = {
  "Payment failed": "Check the payment details and try again. If the issue continues, review the transaction in Activity or contact support.",
  "Payment pending": "Transfers may take time depending on the settlement route. Please wait up to 24 hours.",
  "Wrong recipient": "If the transfer has not settled, contact support immediately. Completed transfers generally cannot be reversed.",
  "Suspicious payment": "Do not send additional funds. Review the recipient details and contact Ziro support if you believe the transaction is fraudulent.",
  "Transfer not received": "Verify the recipient address and ask the recipient to check their Activity log.",
  "I don't recognize a transaction": "Review the transaction details carefully. If it is unauthorized, contact support immediately.",
  "Other": "Please describe your issue below in a support request."
}

export default function HelpCenterPage() {
  const { user } = useAuth()
  const { tickets, addTicket } = useHelpStore()

  const [searchQuery, setSearchQuery] = useState("")

  // States
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null)
  const [showSupportForm, setShowSupportForm] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    issueType: "Payment",
    subject: "",
    description: "",
    transactionId: ""
  })

  // Derive filtered items
  const normalizedQuery = searchQuery.toLowerCase().trim()

  // Filter FAQs
  const filteredFaqs = FAQS.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q =>
      !normalizedQuery ||
      q.q.toLowerCase().includes(normalizedQuery) ||
      q.a.toLowerCase().includes(normalizedQuery)
    )
  })).filter(cat => cat.questions.length > 0)

  // Filter Features
  const filteredFeatures = ZIRO_FEATURES.filter(f =>
    !normalizedQuery ||
    f.title.toLowerCase().includes(normalizedQuery) ||
    f.description.toLowerCase().includes(normalizedQuery)
  )

  const hasNoResults = normalizedQuery && filteredFaqs.length === 0 && filteredFeatures.length === 0

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subject || !formData.description) return

    const id = addTicket({
      issueType: formData.issueType,
      subject: formData.subject,
      description: formData.description + (formData.transactionId ? `\n\nTxID: ${formData.transactionId}` : "")
    })

    setSubmitStatus(`Support request submitted. Ticket ID: ${id}`)
    setShowSupportForm(false)
    setFormData({ ...formData, subject: "", description: "", transactionId: "" })

    setTimeout(() => {
      setSubmitStatus(null)
    }, 5000)
  }

  // Determine if a consultant escalation makes sense based on search
  const showConsultantEscalation = normalizedQuery && (
    normalizedQuery.includes("international") ||
    normalizedQuery.includes("complicated") ||
    normalizedQuery.includes("scam") ||
    normalizedQuery.includes("help")
  )

  return (
    <div className="min-h-full p-6 md:p-10 lg:p-12 w-full max-w-[1000px] mx-auto pb-32">

      {/* Header */}
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-[2.5rem] md:text-[3.5rem] font-bold tracking-tight text-slate-900 leading-tight">
          Help Center
        </h1>
        <p className="text-slate-500 text-lg md:text-xl mt-3 max-w-2xl mx-auto md:mx-0">
          Get answers, solve payment issues, and find help when you need it.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-16">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          type="text"
          className="w-full bg-white/60 backdrop-blur-md border border-white/50 rounded-full py-4 pl-12 pr-6 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4a72ff]/50 shadow-sm text-lg transition-all"
          placeholder="Search Ziro help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Security Warning */}
      <div className="bg-[#4a72ff]/5 border border-[#4a72ff]/20 rounded-[24px] p-6 mb-16 flex items-start gap-4">
        <div className="shrink-0 mt-1 text-[#4a72ff]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-slate-900">Keep your account safe</h4>
          <p className="text-slate-600 text-sm mt-1 mb-2">
            Never share Passwords, OTPs, Recovery codes, Private keys, or Seed phrases with anyone claiming to be a Ziro representative or consultant.
          </p>
          <p className="text-slate-500 text-sm italic font-medium">
            Ziro consultants will never ask for your password, OTP, private key, or seed phrase.
          </p>
        </div>
      </div>

      {hasNoResults ? (
        <div className="text-center py-20 bg-white/40 rounded-[32px] border border-white/50">
          <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
          <p className="text-slate-500">Try a different search term or contact support.</p>
        </div>
      ) : (
        <>
          {/* Quick Support - Hide when searching heavily */}
          {!normalizedQuery && (
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">How can we help?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Payments", desc: "Sending, receiving, and understanding payments.", icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
                  { title: "Security", desc: "Protect your account and understand Ziro's payment security.", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
                  { title: "Transfers", desc: "International transfers, settlement, and payment status.", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
                  { title: "Account", desc: "Profile, TrustScore, settings, and account access.", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" }
                ].map((item) => (
                  <button key={item.title} onClick={() => setSearchQuery(item.title)} className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-6 text-left hover:border-[#4a72ff]/40 hover:shadow-sm transition-all group">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-4 group-hover:bg-[#4a72ff]/10 group-hover:text-[#4a72ff] transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon} />
                      </svg>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-slate-500 text-sm">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Consultant Escalation */}
          {showConsultantEscalation && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 bg-[#35E58A]/10 border border-[#35E58A]/30 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900">Need personal help?</h4>
                <p className="text-slate-600 text-sm">You may benefit from one-to-one help. Talk to a verified Ziro consultant.</p>
              </div>
              <Link href="/dashboard/consultants" className="shrink-0 bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-800 transition-colors">
                Hire a Consultant
              </Link>
            </motion.div>
          )}

          {/* Explore Ziro */}
          {filteredFeatures.length > 0 && (
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Explore Ziro</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFeatures.map((f, i) => {
                  const CardWrapper = f.href ? Link : "div"
                  return (
                    <CardWrapper href={f.href || "#"} key={i} className={`bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-6 flex flex-col h-full ${f.href ? 'hover:border-[#4a72ff]/40 hover:shadow-sm transition-all cursor-pointer' : ''}`}>
                      <h4 className="font-bold text-slate-900 mb-2">{f.title}</h4>
                      <p className="text-slate-500 text-sm flex-1">{f.description}</p>
                      {f.cta && (
                        <div className="mt-4 text-[#4a72ff] font-semibold text-sm">
                          {f.cta} &rarr;
                        </div>
                      )}
                    </CardWrapper>
                  )
                })}
              </div>
            </div>
          )}

          {/* FAQ Accordion */}
          {filteredFaqs.length > 0 && (
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Frequently asked questions</h3>
              <div className="space-y-8">
                {filteredFaqs.map((cat, idx) => (
                  <div key={idx}>
                    <h4 className="text-xs font-bold text-slate-400 tracking-wider mb-4 uppercase">{cat.category}</h4>
                    <div className="space-y-3">
                      {cat.questions.map((q, qIdx) => {
                        const isExpanded = expandedFaq === q.q
                        return (
                          <div key={qIdx} className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl overflow-hidden transition-all">
                            <button
                              onClick={() => setExpandedFaq(isExpanded ? null : q.q)}
                              className="w-full text-left px-6 py-4 flex items-center justify-between font-semibold text-slate-900 hover:bg-white/40"
                            >
                              <span className="pr-4">{q.q}</span>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </button>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="px-6 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 mt-2">
                                    {q.a}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Having Trouble with a Payment */}
          {!normalizedQuery && (
            <div className="mb-16 bg-white/60 backdrop-blur-md border border-white/50 rounded-[32px] p-8 md:p-10">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Having trouble with a payment?</h3>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3 shrink-0 space-y-2">
                  {Object.keys(PAYMENT_ISSUES).map(issue => (
                    <button
                      key={issue}
                      onClick={() => setSelectedIssue(issue)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${selectedIssue === issue
                          ? 'bg-[#4a72ff]/10 text-[#4a72ff]'
                          : 'text-slate-600 hover:bg-white/40'
                        }`}
                    >
                      {issue}
                    </button>
                  ))}
                </div>
                <div className="flex-1">
                  {selectedIssue ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                      <h4 className="font-bold text-slate-900 mb-2">{selectedIssue}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        {(PAYMENT_ISSUES as any)[selectedIssue]}
                      </p>
                      <button
                        onClick={() => {
                          setShowSupportForm(true);
                          setFormData({ ...formData, issueType: "Payment", subject: selectedIssue });
                          setTimeout(() => {
                            document.getElementById('support-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          }, 300);
                        }}
                        className="text-[#4a72ff] font-semibold text-sm hover:underline"
                      >
                        Contact Support about this &rarr;
                      </button>
                    </motion.div>
                  ) : (
                    <div className="h-full min-h-[150px] bg-white/40 rounded-2xl border border-dashed border-slate-300 flex items-center justify-center p-6 text-center text-slate-400 text-sm">
                      Select an issue on the left to see troubleshooting steps.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contact Support & Tickets */}
          {!normalizedQuery && (
            <div id="support-form-section" className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-20">
              {/* Still Need Help */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Still need help?</h3>
                <p className="text-slate-500 mb-6">Our support team can help you troubleshoot Ziro-related issues.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => {
                      if (!showSupportForm) {
                        setShowSupportForm(true);
                        setTimeout(() => {
                          document.getElementById('support-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        }, 300);
                      } else {
                        setShowSupportForm(false);
                      }
                    }}
                    className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-slate-800 transition-colors text-center"
                  >
                    Contact Support
                  </button>
                  <Link href="/dashboard/consultants" className="bg-white border border-slate-200 text-slate-800 px-6 py-3 rounded-full font-bold text-sm hover:bg-slate-50 transition-colors text-center">
                    Talk to a Consultant
                  </Link>
                </div>

                <AnimatePresence>
                  {showSupportForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <form id="support-form" onSubmit={handleSupportSubmit} className="mt-8 bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/50 shadow-sm space-y-4">
                        <h4 className="font-bold text-slate-900 mb-2">Submit Request</h4>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600">Issue Type</label>
                          <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none appearance-none text-sm" value={formData.issueType} onChange={e => setFormData({ ...formData, issueType: e.target.value })}>
                            {["Payment", "Transfer", "Security", "TrustScore", "Offline Payment", "Account", "Consultant", "Other"].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600">Subject</label>
                          <input required type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none text-sm" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} placeholder="Brief description of the issue" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600">Transaction ID (Optional)</label>
                          <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none text-sm" value={formData.transactionId} onChange={e => setFormData({ ...formData, transactionId: e.target.value })} placeholder="e.g. 0x123...abc" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600">Description</label>
                          <textarea required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none text-sm min-h-[120px]" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Provide detailed information about your issue..." />
                        </div>
                        <div className="pt-2">
                          <button type="submit" className="w-full bg-[#4a72ff] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#3d60db] transition-colors">
                            Submit Request
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {submitStatus && (
                  <div className="mt-4 p-4 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium border border-emerald-100">
                    {submitStatus}
                  </div>
                )}
              </div>

              {/* Support Tickets */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">My support requests</h3>
                {tickets.length === 0 ? (
                  <div className="bg-white/40 rounded-[32px] border border-white/50 p-8 text-center">
                    <p className="text-slate-500 font-medium">No support requests yet.</p>
                    <p className="text-slate-400 text-sm mt-1">Requests you submit will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.map(ticket => (
                      <div key={ticket.id} className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-slate-900 text-sm">{ticket.id}</span>
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                              }`}>
                              {ticket.status}
                            </span>
                          </div>
                          <div className="text-slate-600 font-medium text-sm">{ticket.subject}</div>
                          <div className="text-slate-400 text-xs mt-1">Submitted on {new Date(ticket.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Explicit Bottom Spacer for Scroll Container */}
      <div className="h-16 shrink-0 w-full" />
    </div>
  )
}
