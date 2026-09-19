"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useConsultantStore, Consultation } from "@/store/useConsultantStore"
import { Calendar, Clock, Video, Star, ArrowLeft } from "lucide-react"

export default function MyConsultationsPage() {
  const { consultations, consultants } = useConsultantStore()
  const [activeTab, setActiveTab] = useState<"Upcoming" | "Past" | "Cancelled">("Upcoming")

  const filtered = consultations.filter(c => {
    if (activeTab === "Upcoming") return c.status === "Upcoming"
    if (activeTab === "Past") return c.status === "Completed"
    return c.status === "Cancelled"
  })

  return (
    <div className="w-full max-w-[1200px] mx-auto px-8 md:px-12 py-8 pb-24">
      <Link href="/dashboard/consultants" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Consultants
      </Link>

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">My Consultations</h1>
          <p className="text-slate-500 font-medium">Manage your upcoming and past expert sessions.</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 mb-8">
        {["Upcoming", "Past", "Cancelled"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-semibold text-sm transition-colors relative ${activeTab === tab ? 'text-[#4a72ff]' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4a72ff]" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white/40 border border-white/50 rounded-3xl">
            <Calendar size={32} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">No {activeTab.toLowerCase()} consultations</h3>
            <p className="text-slate-500 font-medium mb-6">You don't have any {activeTab.toLowerCase()} expert sessions.</p>
            {activeTab === "Upcoming" && (
              <Link href="/dashboard/consultants" className="bg-slate-800 hover:bg-black text-white font-semibold px-6 py-2.5 rounded-full transition-colors shadow-sm inline-block">
                Find a Consultant
              </Link>
            )}
          </div>
        )}

        {filtered.map(c => {
          const consultant = consultants.find(co => co.id === c.consultantId)
          if (!consultant) return null

          return (
            <motion.div 
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 p-6 shadow-sm flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <img src={consultant.avatar} alt={consultant.name} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                  <div>
                    <h3 className="font-bold text-slate-800">{consultant.name}</h3>
                    <p className="text-slate-500 text-sm font-medium">{c.topic} Consultation</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-lg text-slate-800">${c.totalAmount}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-6 bg-slate-50/50 p-4 rounded-2xl">
                <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <Calendar size={16} className="text-[#4a72ff]" /> {c.date}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <Clock size={16} className="text-[#4a72ff]" /> {c.time} ({c.duration} mins)
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <span className="text-slate-400 font-mono text-xs ml-1">ID: {c.id}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-auto">
                {activeTab === "Upcoming" && (
                  <>
                    <button className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold py-2.5 rounded-full text-center transition-colors shadow-sm">
                      Reschedule
                    </button>
                    <Link 
                      href={`/dashboard/consultants/consultation/${c.id}`}
                      className="flex-1 bg-[#4a72ff] hover:bg-[#3b5bdb] text-white text-sm font-semibold py-2.5 rounded-full text-center transition-colors shadow-md flex justify-center items-center gap-2"
                    >
                      <Video size={16} /> Enter Room
                    </Link>
                  </>
                )}
                {activeTab === "Past" && (
                  <>
                    <button className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold py-2.5 rounded-full text-center transition-colors shadow-sm flex justify-center items-center gap-2">
                      <Star size={16} /> Rate Session
                    </button>
                    <Link 
                      href={`/dashboard/consultants/consultation/${c.id}`}
                      className="flex-1 bg-slate-800 hover:bg-black text-white text-sm font-semibold py-2.5 rounded-full text-center transition-colors shadow-md"
                    >
                      View Summary
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
