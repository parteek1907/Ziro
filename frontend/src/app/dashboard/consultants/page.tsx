"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import { Search, Filter, Star, Clock, Globe, ArrowRight, CheckCircle2, Shield, Calendar, MessagesSquare, ChevronRight } from "lucide-react"
import { useConsultantStore, Consultant } from "@/store/useConsultantStore"

function ConsultantCard({ consultant }: { consultant: Consultant }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4">
          <div className="relative">
            <img src={consultant.avatar} alt={consultant.name} className="w-14 h-14 rounded-full object-cover shadow-sm" />
            {consultant.verified && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px]">
                <CheckCircle2 size={16} className="text-[#4a72ff] fill-[#4a72ff]/10" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg leading-tight">{consultant.name}</h3>
            <p className="text-[#4a72ff] font-medium text-xs mt-0.5">{consultant.specialties[0]}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-slate-700 font-semibold">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            {consultant.rating}
          </div>
          <p className="text-slate-400 text-[10px]">{consultant.consultationCount} sessions</p>
        </div>
      </div>

      <p className="text-slate-500 text-sm mb-5 line-clamp-2 leading-relaxed">
        {consultant.bio}
      </p>

      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-6">
        <div className="flex items-center gap-1.5">
          <Globe size={14} className="text-slate-400" />
          {consultant.languages.slice(0, 2).join(' · ')}{consultant.languages.length > 2 && ' +'}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-slate-400" />
          {consultant.pricing[1].duration} min · ${consultant.pricing[1].price}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-auto">
        <Link 
          href={`/dashboard/consultants/${consultant.id}`}
          className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold py-2.5 rounded-full text-center transition-colors shadow-sm"
        >
          View Profile
        </Link>
        <Link 
          href={`/dashboard/consultants/${consultant.id}?book=true`}
          className="flex-1 bg-[#4a72ff] hover:bg-[#3b5bdb] text-white text-sm font-semibold py-2.5 rounded-full text-center transition-colors shadow-md"
        >
          Book Session
        </Link>
      </div>
    </motion.div>
  )
}

export default function ConsultantsPage() {
  const { consultants } = useConsultantStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  const CATEGORIES = [
    "Payment Issues", "International Transfers", "Ziro & TrustScore", 
    "Financial Documents", "Account & Security", "General Guidance"
  ]

  const filteredConsultants = consultants.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="w-full max-w-[1200px] mx-auto px-8 md:px-12 py-8 flex flex-col gap-12 pb-24">
      
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Hire a Consultant</h1>
          <p className="text-slate-500 font-medium">Get personal help from a verified payment specialist.</p>
        </div>
        <Link 
          href="/dashboard/consultants/my-consultations"
          className="bg-white/50 hover:bg-white/80 border border-white/40 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 shadow-sm"
        >
          <Calendar size={16} />
          My Consultations
        </Link>
      </div>

      {/* ── Hero / Intro Section ───────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-[32px] border border-white/60 p-10 shadow-sm flex flex-col md:flex-row gap-10 items-center overflow-hidden relative"
      >
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#4a72ff]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#4a72ff]/10 text-[#4a72ff] text-[10px] font-bold tracking-wider uppercase mb-6">
            <Shield size={12} /> Personal Financial Support
          </div>
          <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight leading-[1.1] mb-5">
            Sometimes you just need someone to help.
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-md">
            Connect with a verified consultant who can guide you through payments, transfers, remittances, TrustScore questions, and other financial tasks.
          </p>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => document.getElementById('consultants-list')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-slate-800 hover:bg-black text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-md"
            >
              Find a Consultant
            </button>
            <button 
              onClick={() => setShowHowItWorks(true)}
              className="text-slate-600 font-semibold hover:text-slate-800 transition-colors flex items-center gap-2"
            >
              How Ziro Consultants Work <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Premium UI Composition right side */}
        <div className="flex-1 w-full relative z-10 flex justify-center md:justify-end">
          <div className="bg-white/70 backdrop-blur-md border border-white p-5 rounded-[24px] shadow-xl w-full max-w-[320px] transform rotate-1 hover:rotate-0 transition-transform">
            <div className="flex items-center gap-4 mb-5 border-b border-slate-100 pb-5">
              <img src="https://i.pravatar.cc/150?u=maya" alt="Maya" className="w-12 h-12 rounded-full shadow-sm" />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-800">Maya Sharma</h4>
                  <CheckCircle2 size={14} className="text-[#4a72ff] fill-[#4a72ff]/10" />
                </div>
                <p className="text-slate-400 text-xs">Payment Consultant</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50/50 p-2.5 rounded-xl">
                <Calendar size={16} className="text-[#4a72ff]" /> 3:00 PM Today
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50/50 p-2.5 rounded-xl">
                <MessagesSquare size={16} className="text-[#4a72ff]" /> International Transfer
              </div>
              <div className="w-full bg-[#4a72ff]/10 text-[#4a72ff] font-semibold text-center py-2.5 rounded-xl text-sm mt-2">
                ● Session Active
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Categories ────────────────────────────────────────── */}
      <div id="categories">
        <h3 className="text-xl font-bold text-slate-800 mb-6">What can they help with?</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {CATEGORIES.map((category, i) => (
            <motion.div 
              key={category}
              onClick={() => {
                setSearchQuery(category === "General Guidance" ? "" : category);
                document.getElementById('consultants-list')?.scrollIntoView({ behavior: 'smooth' });
              }}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className="bg-white/40 hover:bg-white/70 backdrop-blur-sm border border-white/50 p-4 rounded-2xl cursor-pointer transition-colors flex items-center justify-between group"
            >
              <span className="font-semibold text-slate-700 text-sm">{category}</span>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-[#4a72ff] transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Find the right consultant ─────────────────────────── */}
      <div id="consultants-list" className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-xl font-bold text-slate-800">Find the right consultant</h3>
        </div>

        {/* Consultant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConsultants.map((c) => (
            <ConsultantCard key={c.id} consultant={c} />
          ))}
          {filteredConsultants.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 font-medium">
              No consultants found matching your search.
            </div>
          )}
        </div>
      </div>



      {/* ── Disclaimers ───────────────────────────────────────── */}
      <div className="pt-8 border-t border-slate-200/50 text-center">
        <p className="text-xs text-slate-400 font-medium max-w-2xl mx-auto">
          Consultants provide guidance and support and cannot guarantee transaction approval, recover funds, or override financial institutions. Never share passwords, OTPs, private keys, or full authentication credentials with a consultant.
        </p>
      </div>

      {/* ── How it Works Modal ────────────────────────────────── */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowHowItWorks(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl p-8 md:p-12 z-10"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-2">How Ziro Consultants Work</h3>
            <p className="text-slate-500 font-medium mb-8">Get expert, personalized help securely within Ziro.</p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#4a72ff]/10 text-[#4a72ff] font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">Find your specialist</h4>
                  <p className="text-slate-600">Browse verified consultants by specialty, language, and availability. Read reviews from other Ziro users.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#4a72ff]/10 text-[#4a72ff] font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">Book a session</h4>
                  <p className="text-slate-600">Choose a 15, 30, or 60-minute time slot. Provide context upfront so your consultant is prepared.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#4a72ff]/10 text-[#4a72ff] font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">Connect securely</h4>
                  <p className="text-slate-600">Join a secure video or chat room directly in Ziro. Share screenshots and resolve your issues privately.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowHowItWorks(false)}
              className="mt-10 w-full bg-slate-800 hover:bg-black text-white font-semibold py-4 rounded-full transition-colors"
            >
              Got it
            </button>
          </motion.div>
        </div>
      )}

    </div>
  )
}
