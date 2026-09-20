"use client"

import { useState, use, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useConsultantStore } from "@/store/useConsultantStore"
import { useFinance } from "@/lib/FinanceContext"
import Link from "next/link"
import { ArrowLeft, Star, Globe, Clock, CheckCircle2, Calendar, FileText, Lock, Shield } from "lucide-react"

export default function ConsultantProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { consultants, bookConsultation } = useConsultantStore()
  
  const consultant = consultants.find(c => c.id === resolvedParams.id)
  
  const [step, setStep] = useState(1) // 1: Topic, 2: Duration, 3: Date/Time, 4: Describe, 5: Payment
  
  // Booking State
  const [selectedTopic, setSelectedTopic] = useState("")
  const [selectedDuration, setSelectedDuration] = useState<number>(30)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [description, setDescription] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  if (!consultant) return <div className="p-12 text-center">Consultant not found</div>

  const selectedPricing = consultant.pricing.find(p => p.duration === selectedDuration) || consultant.pricing[0]
  const platformFee = 2
  const totalAmount = selectedPricing.price + platformFee

  const { deductBalance, addTransaction } = useFinance()
  const [screenshotName, setScreenshotName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const DATES = useMemo(() => {
    const dates = ["Today", "Tomorrow"]
    const today = new Date()
    for (let i = 2; i < 4; i++) {
      const nextDate = new Date(today)
      nextDate.setDate(today.getDate() + i)
      const month = nextDate.toLocaleString('default', { month: 'short' })
      const day = nextDate.getDate()
      dates.push(`${month} ${day}`)
    }
    return dates
  }, [])

  const TIMES = ["10:00 AM", "11:30 AM", "1:00 PM", "3:30 PM", "5:00 PM"]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshotName(e.target.files[0].name)
    }
  }

  const handleBook = () => {
    setIsProcessing(true)
    setTimeout(() => {
      bookConsultation({
        userId: "user-1",
        consultantId: consultant.id,
        topic: selectedTopic,
        description,
        date: selectedDate,
        time: selectedTime,
        duration: selectedDuration,
        consultantPrice: selectedPricing.price,
        platformFee,
        totalAmount
      })
      deductBalance(totalAmount, "card")
      addTransaction({
        id: `tx-${Date.now()}`,
        type: "Consultation",
        to: consultant.name,
        route: "USD",
        amount: `-$${totalAmount.toFixed(2)}`,
        status: "Completed",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ref: `CS-${Math.floor(Math.random() * 10000)}`
      })
      router.push("/dashboard/consultants/my-consultations")
    }, 1500)
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-8 md:px-12 py-8 pb-24">
      <Link href="/dashboard/consultants" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Consultants
      </Link>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* ── Left Column: Profile Details ───────────────────────── */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img src={consultant.avatar} alt={consultant.name} className="w-24 h-24 rounded-full object-cover shadow-sm border-4 border-white/60" />
              {consultant.verified && (
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-[3px] shadow-sm">
                  <CheckCircle2 size={24} className="text-[#4a72ff] fill-[#4a72ff]/10" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{consultant.name}</h1>
              <p className="text-[#4a72ff] font-semibold text-sm mt-1 mb-2">Verified Payment Consultant</p>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5"><Star size={14} className="fill-amber-400 text-amber-400" /> {consultant.rating} ({consultant.reviewCount})</span>
                <span>{consultant.consultationCount} sessions</span>
                <span>{consultant.experienceYears} yrs experience</span>
              </div>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-sm border border-white/50 rounded-[24px] p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-3">About</h3>
            <p className="text-slate-600 leading-relaxed text-sm mb-8">{consultant.bio}</p>

            <h3 className="text-lg font-bold text-slate-800 mb-3">Expertise</h3>
            <div className="flex flex-wrap gap-2 mb-8">
              {consultant.specialties.map(s => (
                <span key={s} className="px-3 py-1.5 bg-slate-100/50 text-slate-700 text-xs font-semibold rounded-full border border-slate-200/50">
                  {s}
                </span>
              ))}
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-3">Languages</h3>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-8">
              <Globe size={16} className="text-[#4a72ff]" />
              {consultant.languages.join(", ")}
            </div>
            
            <div className="bg-[#4a72ff]/5 border border-[#4a72ff]/10 rounded-2xl p-5 flex items-start gap-4">
              <Shield size={24} className="text-[#4a72ff] shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Trust & Verification</h4>
                <ul className="text-xs text-slate-600 space-y-1 font-medium">
                  <li>✓ Identity Verified</li>
                  <li>✓ Payment Expertise Verified</li>
                  <li>✓ Background Checked</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Booking Wizard ───────────────────────── */}
        <div className="w-full lg:w-[440px]">
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[32px] p-8 shadow-xl sticky top-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Book a Consultation</h2>
            
            {/* Step Indicators */}
            <div className="flex justify-between mb-8 relative">
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-slate-100 rounded-full z-0"></div>
              <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-[#4a72ff] rounded-full z-0 transition-all duration-300" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${step >= i ? 'bg-[#4a72ff] text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {i}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1 */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="font-bold text-slate-800 mb-4">What do you need help with?</h3>
                  <div className="space-y-2">
                    {["Payment issue", "International transfer", "Remittance", "TrustScore", "Account/security", "Other"].map(topic => (
                      <button 
                        key={topic}
                        onClick={() => setSelectedTopic(topic)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ${selectedTopic === topic ? 'bg-[#4a72ff]/10 border-[#4a72ff] text-[#4a72ff]' : 'bg-white border-slate-200 text-slate-600 hover:border-[#4a72ff]/30'}`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                  <button 
                    disabled={!selectedTopic}
                    onClick={() => setStep(2)}
                    className="w-full mt-6 bg-slate-800 disabled:bg-slate-300 hover:bg-black text-white font-semibold py-3 rounded-full transition-colors"
                  >
                    Continue
                  </button>
                </motion.div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="font-bold text-slate-800 mb-4">Select duration</h3>
                  <div className="space-y-3">
                    {consultant.pricing.map(p => (
                      <button 
                        key={p.duration}
                        onClick={() => setSelectedDuration(p.duration)}
                        className={`w-full flex justify-between items-center px-5 py-4 rounded-xl border transition-colors ${selectedDuration === p.duration ? 'bg-[#4a72ff]/10 border-[#4a72ff] text-[#4a72ff]' : 'bg-white border-slate-200 text-slate-600 hover:border-[#4a72ff]/30'}`}
                      >
                        <span className="font-bold">{p.duration} minutes</span>
                        <span className="font-bold text-lg">${p.price}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep(1)} className="px-6 py-3 rounded-full bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200">Back</button>
                    <button 
                      onClick={() => setStep(3)}
                      className="flex-1 bg-slate-800 hover:bg-black text-white font-semibold py-3 rounded-full transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="font-bold text-slate-800 mb-4">Select date & time</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                    {DATES.map(d => (
                      <button 
                        key={d}
                        onClick={() => setSelectedDate(d)}
                        className={`shrink-0 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${selectedDate === d ? 'bg-[#4a72ff] border-[#4a72ff] text-white' : 'bg-white border-slate-200 text-slate-600'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {TIMES.map(t => (
                      <button 
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        disabled={!selectedDate}
                        className={`py-2 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-50 ${selectedTime === t ? 'bg-[#4a72ff]/10 border-[#4a72ff] text-[#4a72ff]' : 'bg-white border-slate-200 text-slate-600 hover:border-[#4a72ff]/30'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep(2)} className="px-6 py-3 rounded-full bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200">Back</button>
                    <button 
                      disabled={!selectedDate || !selectedTime}
                      onClick={() => setStep(4)}
                      className="flex-1 bg-slate-800 disabled:bg-slate-300 hover:bg-black text-white font-semibold py-3 rounded-full transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="font-bold text-slate-800 mb-2">Describe the issue</h3>
                  <p className="text-xs text-slate-500 mb-4">Provide details so {consultant.name.split(' ')[0]} can prepare.</p>
                  
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="I sent an international transfer yesterday and it is still pending. I would like to understand what happened."
                    className="w-full h-32 bg-white/60 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4a72ff]/30 text-slate-700 placeholder:text-slate-400 resize-none mb-2"
                  />
                  <div>
                    <input 
                      type="file" 
                      accept="image/png" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileChange}
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 text-sm text-[#4a72ff] font-semibold hover:underline"
                    >
                      <FileText size={16} /> {screenshotName || "Attach screenshot (optional)"}
                    </button>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep(3)} className="px-6 py-3 rounded-full bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200">Back</button>
                    <button 
                      disabled={!description.trim()}
                      onClick={() => setStep(5)}
                      className="flex-1 bg-slate-800 disabled:bg-slate-300 hover:bg-black text-white font-semibold py-3 rounded-full transition-colors"
                    >
                      Review
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: Payment */}
              {step === 5 && (
                <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Lock size={18} className="text-emerald-500"/> Complete your booking</h3>
                  
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6">
                    <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                      <span>Consultation</span>
                      <span className="text-slate-800 font-bold">{consultant.name}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                      <span>Date & Time</span>
                      <span className="text-slate-800 font-bold">{selectedDate}, {selectedTime}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-slate-600 mb-4 pb-4 border-b border-slate-200">
                      <span>Duration</span>
                      <span className="text-slate-800 font-bold">{selectedDuration} minutes</span>
                    </div>
                    
                    <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                      <span>Consultation fee</span>
                      <span>${selectedPricing.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-slate-600 mb-4">
                      <span>Ziro service fee</span>
                      <span>${platformFee.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                      <span className="font-bold text-slate-800">Total</span>
                      <span className="font-extrabold text-xl text-[#4a72ff]">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button disabled={isProcessing} onClick={() => setStep(4)} className="px-6 py-3 rounded-full bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200">Back</button>
                    <button 
                      onClick={handleBook}
                      disabled={isProcessing}
                      className="flex-1 bg-[#4a72ff] hover:bg-[#3b5bdb] text-white font-semibold py-3 rounded-full transition-colors flex justify-center items-center gap-2"
                    >
                      {isProcessing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Pay & Book"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
