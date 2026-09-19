"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export default function Home() {
  const [sendAmount, setSendAmount] = useState(250)
  
  const traditionalFee = (sendAmount * 0.075 + 3).toFixed(2)
  const l2Fee = "0.0008"

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  return (
    <div className="min-h-screen bg-white selection:bg-slate-200">
      
      {/* 1. HERO SECTION */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-20"
          >
            <motion.div variants={fadeUpVariant} className="flex-1 lg:w-2/3">
              <h1 className="text-[4rem] md:text-[5.5rem] leading-[1.05] font-bold tracking-[-0.03em] text-black">
                Remittances & <br />
                credit with <br />
                privacy first
              </h1>
            </motion.div>
            
            <motion.div variants={fadeUpVariant} className="flex-1 lg:w-1/3 flex flex-col justify-end pb-4">
              <p className="text-slate-500 text-lg leading-relaxed mb-8 font-medium">
                Gas-abstracted L2 router for instant payments. Zero-knowledge credentials for scoreless credit. Accessible even with zero internet connectivity.
              </p>
              <div>
                <button className="bg-black hover:bg-slate-800 text-white px-8 py-4 rounded-[2rem] font-semibold text-lg transition-all shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)]">
                  Start building
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. PREMIUM ART-DIRECTED FEATURE COMPOSITION */}
      <section className="py-32 px-4 sm:px-6 bg-white overflow-hidden">
        
        {/* --- DESKTOP COMPOSITION --- */}
        <div className="hidden lg:block relative w-full max-w-7xl mx-auto h-[800px] bg-white rounded-[3rem] border border-[#F4F5F7] shadow-[0_10px_60px_rgba(0,0,0,0.03)]">
          
          {/* BACKGROUND CONNECTING LINES (Z-0) */}
          <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" preserveAspectRatio="none">
            {/* Subtle path connecting the three systems */}
            <path d="M 200 400 Q 500 100 800 350 T 1100 600" stroke="#F4F5F7" strokeWidth="2" fill="none" strokeDasharray="6 6" />
            <circle cx="200" cy="400" r="4" fill="#F4F5F7" />
            <circle cx="800" cy="350" r="4" fill="#F4F5F7" />
            <circle cx="1100" cy="600" r="4" fill="#F4F5F7" />
          </svg>

          {/* CENTER PANEL: TrustScore (Z-10) */}
          <motion.div 
            className="absolute left-[30%] top-[8%] w-[38%] h-[60%] bg-[#F4F5F7] rounded-[2.5rem] p-12 z-10 flex flex-col justify-end"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-[3.5rem] leading-[1.05] font-medium tracking-tight text-[#0B1220]">Trust<br/>Score</div>
          </motion.div>

          {/* LEFT PANEL: L2 Support (Z-20) */}
          <motion.div 
            className="absolute left-[4%] top-[18%] w-[32%] h-[55%] bg-[#2161E8] rounded-[2.5rem] p-12 z-20 shadow-[20px_0_50px_rgba(0,0,0,0.08)]"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="text-[3.5rem] leading-[1.05] font-medium tracking-tight text-white mb-6">L2<br/>Support</div>
            <div className="text-white/80 text-xl tracking-wide font-medium">Gasless<br/>remittance</div>
          </motion.div>

          {/* RIGHT PANEL: Offline Vault (Z-20) */}
          <motion.div 
            className="absolute left-[64%] top-[25%] w-[32%] h-[55%] bg-[#0A0A0A] rounded-[2.5rem] p-12 z-20 shadow-[-20px_0_50px_rgba(0,0,0,0.15)]"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="text-[3.5rem] leading-[1.05] font-medium tracking-tight text-white">Offline<br/>Vault</div>
          </motion.div>

          {/* FLOATING OBJECT 1: Settlement (Z-30) */}
          <motion.div 
            className="absolute left-[22%] top-[55%] w-[300px] bg-white rounded-3xl p-8 shadow-[0_30px_60px_rgba(0,0,0,0.12)] z-30 border border-[#F4F5F7]"
            initial={{ y: 0, rotate: -4 }}
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
          >
            <div className="flex justify-between items-center mb-8">
              <span className="text-[10px] font-bold text-[#0B1220]/40 uppercase tracking-widest">SETTLEMENT</span>
              <span className="text-[10px] font-bold text-[#2161E8] bg-[#2161E8]/5 px-2.5 py-1 rounded-sm tracking-widest uppercase">L2 NETWORK</span>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" stroke="#F4F5F7" strokeWidth="6" fill="none" />
                  <motion.circle 
                    cx="50" cy="50" r="45" stroke="#2161E8" strokeWidth="6" fill="none" strokeDasharray="282.7" strokeDashoffset="80" strokeLinecap="round"
                    initial={{ strokeDashoffset: 282.7 }}
                    whileInView={{ strokeDashoffset: 80 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  />
                </svg>
              </div>
              <div>
                <div className="text-4xl font-medium text-[#0B1220] tracking-tight">2.1s</div>
                <div className="text-[10px] font-bold text-[#35E58A] tracking-widest mt-2">FINALIZED</div>
              </div>
            </div>
          </motion.div>

          {/* FLOATING OBJECT 2: Behavioral Data (Z-30) */}
          <motion.div 
            className="absolute left-[48%] top-[20%] w-[320px] bg-white rounded-3xl p-8 shadow-[0_30px_60px_rgba(0,0,0,0.1)] z-30 border border-[#F4F5F7]"
            initial={{ y: 0, rotate: 3 }}
            animate={{ y: [8, -8, 8] }}
            transition={{ duration: 8, ease: "easeInOut", repeat: Infinity, delay: 1 }}
          >
            <div className="flex justify-between items-end mb-10">
              <div className="text-[10px] font-bold text-[#0B1220]/40 uppercase tracking-widest mb-1.5">BEHAVIORAL DATA</div>
              <div className="text-right">
                <div className="text-5xl font-medium text-[#0B1220] tracking-tight leading-none">740</div>
                <div className="text-[10px] font-bold text-[#0B1220]/40 tracking-widest mt-2 uppercase">Confidence</div>
              </div>
            </div>
            
            <div className="flex items-end gap-2 h-20">
              <div className="flex-1 bg-[#F4F5F7] h-[35%] rounded-sm"></div>
              <div className="flex-1 bg-[#F4F5F7] h-[65%] rounded-sm"></div>
              <div className="flex-1 bg-[#0B1220] h-[95%] rounded-sm shadow-md relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#2161E8]"></div>
              </div>
              <div className="flex-1 bg-[#F4F5F7] h-[45%] rounded-sm"></div>
              <div className="flex-1 bg-[#F4F5F7] h-[80%] rounded-sm"></div>
            </div>
          </motion.div>

          {/* FLOATING OBJECT 3: WebCrypto (Z-30) */}
          <motion.div 
            className="absolute right-[10%] top-[60%] w-[300px] bg-[#111111]/95 backdrop-blur-md rounded-3xl p-8 shadow-[0_30px_60px_rgba(0,0,0,0.4)] z-30 border border-white/5"
            initial={{ y: 0, rotate: -2 }}
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, delay: 2 }}
          >
            <div className="flex justify-between items-center mb-8">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">WEBCRYPTO</span>
              <span className="text-[10px] font-bold text-[#35E58A] bg-[#35E58A]/10 px-2.5 py-1 rounded-sm tracking-widest uppercase">SECURE</span>
            </div>
            
            <div className="text-2xl font-medium text-white tracking-wide mb-8">ECDSA KEY</div>
            
            <div className="space-y-2 opacity-80">
              <div className="flex gap-1.5">
                <div className="h-1.5 w-10 bg-[#333] rounded-full"></div>
                <div className="h-1.5 w-4 bg-[#333] rounded-full"></div>
                <div className="h-1.5 w-16 bg-[#333] rounded-full"></div>
              </div>
              <div className="flex gap-1.5">
                <div className="h-1.5 w-14 bg-[#2161E8] rounded-full shadow-[0_0_10px_rgba(33,97,232,0.5)]"></div>
                <div className="h-1.5 w-8 bg-[#333] rounded-full"></div>
                <div className="h-1.5 w-6 bg-[#333] rounded-full"></div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* --- MOBILE FALLBACK --- */}
        <div className="lg:hidden flex flex-col gap-16 max-w-md mx-auto">
          {/* Mobile Card 1 */}
          <div className="relative pt-10">
            <div className="bg-[#2161E8] rounded-[2.5rem] p-10 pb-36 shadow-xl">
              <div className="text-4xl leading-[1.05] font-medium tracking-tight text-white mb-4">L2<br/>Support</div>
              <div className="text-white/80 text-xl font-medium tracking-wide">Gasless<br/>remittance</div>
            </div>
            <div className="absolute bottom-0 left-6 right-6 bg-white rounded-3xl p-6 shadow-2xl border border-[#F4F5F7] rotate-[-2deg]">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold text-[#0B1220]/40 uppercase tracking-widest">SETTLEMENT</span>
                <span className="text-[10px] font-bold text-[#2161E8] bg-[#2161E8]/5 px-2 py-1 rounded-sm uppercase tracking-widest">L2 NETWORK</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative w-14 h-14">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" stroke="#F4F5F7" strokeWidth="6" fill="none" />
                    <circle cx="50" cy="50" r="45" stroke="#2161E8" strokeWidth="6" fill="none" strokeDasharray="282.7" strokeDashoffset="80" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-medium text-[#0B1220] tracking-tight">2.1s</div>
                  <div className="text-[10px] font-bold text-[#35E58A] tracking-widest mt-1">FINALIZED</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Card 2 */}
          <div className="relative pt-10">
            <div className="bg-[#F4F5F7] rounded-[2.5rem] p-10 pb-40 shadow-inner">
              <div className="text-4xl leading-[1.05] font-medium tracking-tight text-[#0B1220]">Trust<br/>Score</div>
            </div>
            <div className="absolute bottom-0 left-6 right-6 bg-white rounded-3xl p-6 shadow-2xl border border-[#F4F5F7] rotate-[2deg]">
              <div className="flex justify-between items-end mb-8">
                <div className="text-[10px] font-bold text-[#0B1220]/40 uppercase tracking-widest mb-1">BEHAVIORAL DATA</div>
                <div className="text-right">
                  <div className="text-4xl font-medium text-[#0B1220] tracking-tight leading-none">740</div>
                  <div className="text-[10px] font-bold text-[#0B1220]/40 tracking-widest mt-1 uppercase">Confidence</div>
                </div>
              </div>
              <div className="flex items-end gap-2 h-16">
                <div className="flex-1 bg-[#F4F5F7] h-[40%] rounded-sm"></div>
                <div className="flex-1 bg-[#F4F5F7] h-[70%] rounded-sm"></div>
                <div className="flex-1 bg-[#0B1220] h-[95%] rounded-sm relative"></div>
                <div className="flex-1 bg-[#F4F5F7] h-[50%] rounded-sm"></div>
              </div>
            </div>
          </div>

          {/* Mobile Card 3 */}
          <div className="relative pt-10">
            <div className="bg-[#0A0A0A] rounded-[2.5rem] p-10 pb-36 shadow-2xl">
              <div className="text-4xl leading-[1.05] font-medium tracking-tight text-white">Offline<br/>Vault</div>
            </div>
            <div className="absolute bottom-0 left-6 right-6 bg-[#111111] rounded-3xl p-6 shadow-2xl border border-[#333] rotate-[-2deg]">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">WEBCRYPTO</span>
                <span className="text-[10px] font-bold text-[#35E58A] bg-[#35E58A]/10 px-2 py-1 rounded-sm uppercase tracking-widest">SECURE</span>
              </div>
              <div className="text-lg font-medium text-white tracking-wide mb-6">ECDSA KEY</div>
              <div className="flex gap-1 mb-2 opacity-80">
                <div className="w-8 h-1 bg-[#333] rounded-full"></div>
                <div className="w-12 h-1 bg-[#333] rounded-full"></div>
              </div>
              <div className="flex gap-1 opacity-80">
                <div className="w-12 h-1 bg-[#2161E8] rounded-full"></div>
                <div className="w-6 h-1 bg-[#333] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 3. CALCULATOR / FEATURES LIST (Clean Editorial Style) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="flex-1"
            >
              <motion.h2 variants={fadeUpVariant} className="text-[3rem] md:text-[4rem] font-bold tracking-tight text-black mb-8 leading-tight">
                Instant transfers. <br/> Zero fees.
              </motion.h2>
              <motion.ul variants={fadeUpVariant} className="space-y-8 mb-8">
                {[
                  { title: "Gas Abstraction", desc: "Users pay fees in the transferred asset, no native tokens needed." },
                  { title: "Smart Routing", desc: "Automated liquidity pool bridging for the absolute best FX rate." },
                  { title: "Sub-second Finality", desc: "Transactions settle on our L2 faster than a database write." }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="text-slate-300 font-bold text-xl mt-1">/0{i+1}</div>
                    <div>
                      <h4 className="text-xl font-bold text-black mb-1">{item.title}</h4>
                      <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </motion.ul>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUpVariant}
              className="flex-1 w-full bg-slate-50 rounded-[3rem] p-10 lg:p-14 relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-12 relative z-10">
                <div className="font-bold text-slate-400 text-xs tracking-widest uppercase">Transfer amount</div>
                <motion.div key={sendAmount} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="text-5xl font-bold tracking-tight text-black">
                  ${sendAmount}
                </motion.div>
              </div>
              
              <input 
                type="range" 
                min="50" max="1000" step="10"
                value={sendAmount}
                onChange={(e) => setSendAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-black mb-16 relative z-10"
              />
              
              <div className="space-y-4 relative z-10">
                <div className="p-6 rounded-[2rem] bg-white border border-slate-100 flex justify-between items-center shadow-sm">
                  <div>
                    <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Traditional Bank</div>
                    <div className="text-lg font-bold text-black">3-5 Days</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Fee</div>
                    <div className="text-2xl font-bold text-slate-500">${traditionalFee}</div>
                  </div>
                </div>
                
                <div className="p-6 rounded-[2rem] bg-black text-white flex justify-between items-center shadow-xl">
                  <div>
                    <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">FutureFinance L2</div>
                    <div className="text-lg font-bold text-white">~2 Seconds</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Fee</div>
                    <div className="text-2xl font-bold text-white">${l2Fee}</div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
      
    </div>
  )
}
