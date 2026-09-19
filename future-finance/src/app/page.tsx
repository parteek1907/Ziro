"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import CreditCard from '@/components/shared-assets/credit-card/credit-card'
import { Footer } from "@/components/Footer"

export default function Home() {
  const [sendAmount, setSendAmount] = useState(250)
  const traditionalFee = (sendAmount * 0.075 + 3).toFixed(2)
  const l2Fee = "0.0008"

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      
      {/* FULL BLEED HERO CONTAINER WITH ROUNDED BOTTOM */}
      <section className="relative w-full bg-[#0B0B0D] rounded-b-[48px] lg:rounded-b-[80px] overflow-hidden flex flex-col min-h-[85vh] md:min-h-[80vh] lg:min-h-[88vh]">
        
        {/* NAV INSIDE HERO */}
        <nav className="w-full px-8 py-8 flex items-center justify-between relative z-50">
          {/* Logo */}
          <Link href="/" className="text-white font-bold text-2xl tracking-tight">
            Ziro
          </Link>
          
          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8">
            {["Encryption", "Features", "Security"].map((item) => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="text-[#8B8F98] hover:text-white transition-colors text-sm font-medium">
                {item}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-[#8B8F98] hover:text-white transition-colors text-sm font-medium hidden sm:block">
              Log in
            </Link>
            <Link href="/app" className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#F4F5F7] transition-colors flex items-center gap-2 group">
              Launch app
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </nav>

        {/* HERO CONTENT */}
        <div className="flex-1 flex flex-col lg:flex-row px-8 lg:px-16 pt-4 pb-8 lg:py-10 relative z-10">
          
          {/* LEFT: Typography & CTA (42-45%) */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center relative z-40 mb-12 lg:mb-0">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-white text-[4rem] md:text-[5.5rem] lg:text-[5.5rem] leading-[1.05] font-bold tracking-tight mb-6"
            >
              Finance<br />
              without<br />
              borders.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[#8B8F98] text-lg lg:text-xl leading-relaxed mb-8 max-w-sm font-medium"
            >
              Move value across borders, build trust without traditional credit, and stay connected even offline.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href="/app" className="inline-flex items-center gap-3 bg-white hover:bg-[#F4F5F7] text-black px-8 py-4 rounded-full font-bold text-base transition-colors group">
                Launch app
                <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* RIGHT: Overlapping Visual Composition (55-58%) */}
          <div className="w-full lg:w-[55%] relative min-h-[350px] lg:min-h-full">
            
            {/* BOTTOM CARD (Blue) */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: [0, 4, 0] }}
              transition={{ duration: 1, delay: 0.2, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
              className="absolute z-10 w-[75%] max-w-[420px] aspect-[1.586] right-[5%] lg:right-[15%] bottom-[15%] lg:bottom-[25%]"
              style={{ transform: "rotate(-6deg)" }}
            >
              <CreditCard type="dark-cyan" style={{ width: '100%', height: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} />
            </motion.div>

            {/* TOP CARD (Gradient) */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: -20 }}
              animate={{ opacity: 1, x: 0, y: [0, -4, 0] }}
              transition={{ duration: 1, delay: 0.4, y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
              className="absolute z-20 w-[75%] max-w-[420px] aspect-[1.586] left-[5%] lg:left-[15%] top-[10%] lg:top-[15%]"
              style={{ transform: "rotate(-18deg)" }}
            >
              <CreditCard type="gradient-strip" style={{ width: '100%', height: '100%', boxShadow: '0 35px 60px -15px rgba(0,0,0,0.6)' }} />
            </motion.div>

            {/* Decorative Details */}
            <svg className="absolute top-[35%] lg:top-[45%] left-[5%] lg:left-[10%] z-0 opacity-40 pointer-events-none w-24 h-24 lg:w-40 lg:h-40" viewBox="0 0 100 100" fill="none">
              <path d="M10,80 C30,90 60,60 50,40 C40,20 80,10 90,30" stroke="white" strokeWidth="1" strokeLinecap="round" />
            </svg>

          </div>
        </div>

        {/* BOTTOM STATS / INFO */}
        <div className="mt-auto px-8 lg:px-16 pb-8 pt-8 border-t border-white/5 relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          
          <div className="flex flex-col max-w-[220px]">
            <div className="text-white text-lg font-bold mb-2">Global access</div>
            <div className="text-[#8B8F98] text-sm leading-relaxed font-medium">Financial infrastructure designed for every connection.</div>
          </div>

          <div className="hidden md:flex justify-center flex-1">
            <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-[#F4F5F7] transition-colors cursor-pointer group shadow-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-y-1 transition-transform">
                <path d="M12 5v14M19 12l-7 7-7-7"/>
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-10 md:gap-16">
            <div>
              <div className="text-white text-2xl lg:text-3xl font-bold tracking-tight mb-1">2.1s</div>
              <div className="text-[#8B8F98] text-xs uppercase tracking-wider font-medium">Settlement</div>
            </div>
            <div>
              <div className="text-white text-2xl lg:text-3xl font-bold tracking-tight mb-1">99.9%</div>
              <div className="text-[#8B8F98] text-xs uppercase tracking-wider font-medium">Lower cost</div>
            </div>
            <div>
              <div className="text-white text-2xl lg:text-3xl font-bold tracking-tight mb-1">0kb</div>
              <div className="text-[#8B8F98] text-xs uppercase tracking-wider font-medium">Internet required</div>
            </div>
          </div>

        </div>

      </section>

      {/* 2. CARD SHOWCASE */}
      <section className="py-24 px-6 bg-[#F8F9FA]">
        
        {/* HEADLINE */}
        <h2 className="text-center mx-auto mb-14 font-medium text-slate-900 tracking-[-0.02em] px-4" style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 1.2, maxWidth: '700px' }}>
          Easy to use mobile app that support on android and ios.
        </h2>

        {/* 3-COLUMN CSS GRID — full width */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          
          {/* PANEL 1: Blue */}
          <div className="bg-[#3B7DFF] rounded-[28px] relative overflow-hidden aspect-[3/4] p-8 md:p-10 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start relative z-30">
              <h3 className="text-white text-[36px] md:text-[44px] leading-[1.05] font-medium tracking-tight">
                Visa<br/><span className="font-bold">Support</span>
              </h3>
              <div className="text-white text-4xl font-light mt-1">✳</div>
            </div>
            
            {/* Credit Card */}
            <CreditCard 
              type="gradient-strip" 
              style={{ width: '135%', aspectRatio: '1.586', bottom: '-20%', left: '-10%', transform: 'rotate(30deg)' }} 
            />
          </div>

          {/* PANEL 2: Pale / Light */}
          <div className="bg-[#E4EFF2] rounded-[28px] relative overflow-hidden aspect-[3/4] p-8 md:p-10 flex flex-col justify-end">
            
            {/* Credit Card */}
            <CreditCard 
              type="gradient-strip"
              style={{ width: '140%', aspectRatio: '1.586', top: '-10%', left: '-10%', transform: 'rotate(75deg)' }} 
            />

            {/* Bottom text */}
            <h3 className="text-[#1A1A2E] text-[36px] md:text-[44px] leading-[1.05] tracking-tight text-center relative z-20">
              Always <span className="font-bold">there</span>
            </h3>
          </div>

          {/* PANEL 3: Black */}
          <div className="bg-[#0A0A0A] rounded-[28px] relative overflow-hidden aspect-[3/4] p-8 md:p-10 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start relative z-30">
              <h3 className="text-white text-[36px] md:text-[44px] font-medium leading-[1.05] tracking-tight">
                Design your<br/><span className="italic text-[#6EE7B7]">Personalized</span><br/>Card
              </h3>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white/60 mt-1">
                <path d="M8.5 16.5a5 5 0 0 1 7 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M5.5 13.5a9 9 0 0 1 13 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M2.5 10.5a13 13 0 0 1 19 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="12" cy="20" r="1" fill="currentColor"/>
              </svg>
            </div>
            
            {/* Credit Card */}
            <CreditCard 
              type="gradient-strip"
              style={{ width: '150%', aspectRatio: '1.586', bottom: '-30%', right: '-35%', transform: 'rotate(90deg)' }} 
            />
          </div>

        </div>
      </section>

      {/* 3. CALCULATOR / FEATURES LIST (Clean Editorial Style) */}
      <section className="py-24 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
              }}
              className="flex-1"
            >
              <motion.h2 
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                }} 
                className="text-[3rem] md:text-[4rem] font-bold tracking-tight text-black mb-8 leading-tight"
              >
                Instant transfers. <br/> Zero fees.
              </motion.h2>
              <motion.ul 
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                }} 
                className="space-y-8 mb-8"
              >
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
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
              }}
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
                    <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Ziro L2</div>
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

      <Footer />
    </div>
  )
}
