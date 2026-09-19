"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import Link from "next/link"
import CreditCard from '@/components/shared-assets/credit-card/credit-card'
import { Footer } from "@/components/Footer"

function AnimatedNumber({ value, duration = 2 }: { value: number, duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: "easeOut" });
    return controls.stop;
  }, [count, value, duration]);

  return <motion.span>{rounded}</motion.span>;
}

function AnimatedFloat({ value, duration = 2 }: { value: number, duration?: number }) {
  const count = useMotionValue(0);
  const formatted = useTransform(count, (latest) => latest.toFixed(1));

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: "easeOut" });
    return controls.stop;
  }, [count, value, duration]);

  return <motion.span>{formatted}</motion.span>;
}

export default function Home() {
  const [sendAmount, setSendAmount] = useState(250)
  const traditionalFee = (sendAmount * 0.075 + 3).toFixed(2)
  const l2Fee = "0.0008"

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      
      {/* FULL BLEED HERO CONTAINER WITH ROUNDED BOTTOM */}
      <section className="relative w-full bg-[#0F1012] rounded-b-[48px] lg:rounded-b-[60px] overflow-hidden flex flex-col min-h-screen pb-16 lg:pb-20">
        
        {/* NAV INSIDE HERO */}
        <nav className="w-full px-8 py-8 flex items-center justify-between relative z-50">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Ziro Logo" className="h-16 md:h-20 w-auto object-contain brightness-0 invert" />
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
            <Link href="/dashboard" className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#F4F5F7] transition-colors flex items-center gap-2 group">
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
              className="text-white text-[3.5rem] md:text-[5rem] lg:text-[5rem] leading-[1.05] font-bold tracking-tight mb-8"
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
              <Link href="/dashboard" className="inline-flex items-center gap-4 bg-[#2161E8] hover:bg-[#1a4bba] text-white pl-8 pr-2 py-2 rounded-full font-bold text-base transition-colors group">
                Launch app
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </Link>
            </motion.div>

          </div>

          {/* Decorative Details (White Thread with Twist) */}
          <svg className="absolute bottom-[20%] lg:bottom-[15%] left-[15%] lg:left-[30%] z-30 opacity-70 pointer-events-none w-56 h-28 lg:w-80 lg:h-40" viewBox="0 0 250 100" fill="none">
            <path d="M 40 80 C 70 55, 115 50, 130 25 C 135 10, 105 5, 95 25 C 85 45, 140 60, 190 35" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>

          {/* RIGHT: Overlapping Visual Composition (55-58%) */}
          <div className="w-full lg:w-[55%] relative min-h-[400px] lg:min-h-full mt-12 lg:mt-0">
            
            {/* BOTTOM CARD (Blue) */}
            <motion.div
              initial={{ opacity: 0, y: 80, rotate: -6 }}
              animate={{ opacity: 1, y: 0, rotate: -6 }}
              transition={{ duration: 1.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute z-10 w-[75%] max-w-[420px] aspect-[1.586] right-[5%] lg:right-[15%] top-[25%] lg:top-[30%]"
            >
              <CreditCard type="dark-cyan" style={{ width: '100%', height: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} />
            </motion.div>

            {/* TOP CARD (Gradient) */}
            <motion.div
              initial={{ opacity: 0, y: 100, rotate: -18 }}
              animate={{ opacity: 1, y: 0, rotate: -18 }}
              transition={{ duration: 1.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute z-20 w-[75%] max-w-[420px] aspect-[1.586] left-[5%] lg:left-[15%] top-[5%] lg:top-[10%]"
            >
              <CreditCard type="gradient-strip" style={{ width: '100%', height: '100%', boxShadow: '0 35px 60px -15px rgba(0,0,0,0.6)' }} />
            </motion.div>

          </div>
        </div>

      </section>

      {/* NEW PREMIUM SECTION (Fintech & Global Payments) */}
      <section className="py-24 px-6 lg:px-12 bg-[#F8F9FA] flex flex-col md:flex-row gap-6 lg:gap-8 max-w-[1440px] mx-auto w-full">
        
        {/* LEFT CARD: Build a fintech */}
        <div className="flex-1 bg-white rounded-[40px] p-10 lg:p-12 flex flex-col relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[450px] lg:min-h-[550px]">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-[2rem] lg:text-[2.6rem] font-bold leading-[1.1] tracking-tight mb-4 text-black uppercase max-w-md"
          >
            Build a fintech with<br />banking as a service
          </motion.h2>
          <p className="text-[#8B8F98] text-sm lg:text-base leading-relaxed mb-8 max-w-md font-medium">
            Keep your business account and all your finance needs safely organized under one roof. Manage money quickly, easily & efficiently. Whether you're alone or leading a team.
          </p>

          {/* Form Mockup Area */}
          <div className="bg-[#F8F9FA] rounded-[32px] p-5 lg:p-6 relative mt-auto border border-slate-100 max-w-[400px]">
            {/* Toggle */}
            <div className="flex bg-slate-100 rounded-full p-1.5 mb-6 w-fit shadow-inner">
              <div className="bg-white px-5 py-2 rounded-full text-xs font-bold shadow-sm">Pay by Cards</div>
              <div className="px-5 py-2 rounded-full text-xs font-bold text-slate-500">Pay with Paypal</div>
            </div>
            
            {/* Inputs */}
            <div className="space-y-4 w-[85%]">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">Email address</label>
                <div className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-400 text-xs shadow-sm">johndoe@mail.com</div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">Card details</label>
                <div className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-400 text-xs flex items-center gap-2 shadow-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                  Card number
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">Billing address</label>
                <div className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 h-10 shadow-sm"></div>
              </div>
            </div>

            {/* Floating Widget Overlap */}
            <div className="absolute right-[-15%] lg:right-[-10%] bottom-6 bg-white rounded-3xl p-5 shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-slate-50 w-[240px] lg:w-[260px]">
              <div className="space-y-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-xs">🇺🇸</div>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold leading-tight text-black">Bill Chunky <span className="font-medium text-slate-400">purchased iPhone 14 Pro Mockup</span></div>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-500">$23.00</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-xs">🌐</div>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold leading-tight text-black">Alana <span className="font-medium text-slate-400">upgraded to Team Pro License</span></div>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-500">$23.00</div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center pt-4 border-t border-slate-100">
                <div className="w-8 h-8 bg-black rounded-full mb-2 flex items-center justify-center text-white text-lg">✳</div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-black">Cyber Bank</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: Accept and optimize payment */}
        <div className="flex-1 bg-white rounded-[40px] p-10 lg:p-12 flex flex-col relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[450px] lg:min-h-[550px]">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-[2rem] lg:text-[2.6rem] font-bold leading-[1.1] tracking-tight mb-4 text-black uppercase max-w-md"
          >
            Accept and optimize payment globally
          </motion.h2>
          <p className="text-[#8B8F98] text-sm lg:text-base leading-relaxed mb-8 max-w-md font-medium">
            Keep your business account and all your finance needs safely organized under one roof. Manage money quickly, easily & efficiently. Whether you're alone or leading a team.
          </p>

          {/* Overlapping Vertical Cards (Cut off at bottom) */}
          <div className="absolute right-0 bottom-0 w-[350px] lg:w-[450px] h-[300px] lg:h-[400px]">
             
             {/* Gradient Strip Card (Now in Front) */}
             <motion.div 
                initial={{ opacity: 0, y: 80, rotate: -90 }}
                whileInView={{ opacity: 1, y: 0, rotate: -90 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute z-20 w-[280px] lg:w-[350px] aspect-[1.586] right-[40px] lg:right-[80px] bottom-[10px] lg:bottom-[0px]"
             >
                <CreditCard type="gradient-strip" style={{ width: '100%', height: '100%', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.6)' }} />
             </motion.div>

             {/* Blue Card (Now in Back) */}
             <motion.div 
                initial={{ opacity: 0, y: 100, rotate: -90 }}
                whileInView={{ opacity: 1, y: 0, rotate: -90 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute z-10 w-[280px] lg:w-[350px] aspect-[1.586] right-[140px] lg:right-[180px] bottom-[50px] lg:bottom-[40px]"
             >
                <CreditCard type="dark-cyan" style={{ width: '100%', height: '100%', boxShadow: '0 35px 60px -15px rgba(0,0,0,0.7)' }} />
             </motion.div>

          </div>
        </div>

      </section>

      {/* 2. APP FEATURES (3-Box Grid) */}
      <section className="py-24 px-6 lg:px-12 bg-white w-full">
        <div className="max-w-[1440px] mx-auto flex flex-col items-center">
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-[2.2rem] lg:text-[3.5rem] font-bold tracking-tight text-center text-[#0B1220] mb-16 max-w-4xl leading-[1.1]"
          >
            Easy to use mobile app that<br />support on android and ios.
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full h-auto md:h-[600px] lg:h-[650px]">
            
            {/* Box 1: Visa Support */}
            <div className="relative bg-[#3B7DFF] rounded-[40px] p-8 lg:p-10 overflow-hidden flex flex-col min-h-[450px] lg:min-h-full shadow-xl">
              <div className="flex justify-between items-start relative z-20">
                <div className="relative">
                  <h3 className="text-[2.5rem] lg:text-[3.5rem] font-medium text-white tracking-tight leading-[1.05]">Visa<br />Support</h3>
                </div>
                <div className="text-white text-4xl lg:text-5xl mt-2 font-light">✳</div>
              </div>
              
              {/* Lilac/Black Card */}
              <motion.div 
                initial={{ opacity: 0, y: 100, rotate: -30 }}
                whileInView={{ opacity: 1, y: 0, rotate: -30 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-[-20px] lg:left-[-40px] bottom-[-20px] lg:bottom-[-40px] w-[340px] lg:w-[460px] aspect-[1.586] z-10"
              >
                <CreditCard type="lilac-black" style={{ width: '100%', height: '100%' }} />
              </motion.div>
            </div>

            {/* Box 2: Always there */}
            <div className="relative bg-[#EAF2F2] rounded-[40px] p-8 lg:p-10 overflow-hidden flex flex-col justify-end min-h-[450px] lg:min-h-full shadow-xl">
              {/* Cyan/Black Card rotated ~110deg so black is on left/top */}
              <motion.div 
                initial={{ opacity: 0, y: -100, rotate: 110 }}
                whileInView={{ opacity: 1, y: 0, rotate: 110 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-[10px] lg:left-[20px] top-[-20px] lg:top-[-40px] w-[340px] lg:w-[480px] aspect-[1.586] z-10 origin-center"
              >
                 <CreditCard type="cyan-black" style={{ width: '100%', height: '100%' }} />
              </motion.div>

              <h3 className="text-[2.5rem] lg:text-[3.2rem] font-medium text-[#1A1A2E] tracking-tight relative z-20 text-center mt-auto w-full">Always <span className="font-bold">there</span></h3>
            </div>

            {/* Box 3: Design your Personalized Card */}
            <div className="relative bg-[#0F0F0F] rounded-[40px] p-8 lg:p-10 overflow-hidden flex flex-col min-h-[450px] lg:min-h-full shadow-xl">
              <h3 className="text-[2.5rem] lg:text-[3.2rem] font-medium text-white tracking-tight leading-[1.05] relative z-20">
                Design your<br />
                <span className="text-[#35E58A] italic">Personalized</span><br />
                Card
              </h3>
              
              {/* Lilac/Black Card horizontally centered but anchored to bottom */}
              {/* rotated 90deg so black is left, lilac is right */}
              <motion.div 
                initial={{ opacity: 0, y: 100, x: "-50%", rotate: 90 }}
                whileInView={{ opacity: 1, y: 0, x: "-50%", rotate: 90 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-[50%] bottom-[-40px] w-[320px] lg:w-[420px] aspect-[1.586] z-10"
              >
                <CreditCard type="lilac-black" style={{ width: '100%', height: '100%' }} />
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* GLOBAL COMMERCE SECTION */}
      <section className="py-24 px-6 lg:px-12 bg-[#F8F9FA] w-full">
        <div className="max-w-[1440px] mx-auto bg-white rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 lg:p-16 flex flex-col lg:flex-row relative">
          
          {/* Left: Text Content */}
          <div className="w-full lg:w-[40%] flex flex-col justify-center lg:pr-10 mb-12 lg:mb-0">
            <div className="text-[#3B7DFF] font-bold tracking-wide text-xs lg:text-sm mb-6">Global Scale</div>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-[2.5rem] lg:text-[3.2rem] font-bold uppercase leading-[1.05] mb-8 text-black tracking-tight"
            >
              Sell everywhere<br />in global<br />commerce
            </motion.h2>
            <p className="text-[#8B8F98] text-sm lg:text-base leading-relaxed max-w-md font-medium">
              When you sell your software products to global customers, accepting local payment methods is critical in capturing the total market opportunity. Don't let payment friction get in the way of a single sale. Allow customers to pay in their local currency.
            </p>
          </div>

          {/* Right: Map and Stats */}
          <div className="w-full lg:w-[60%] flex flex-col relative min-h-[400px]">
            
            {/* Map Area */}
            <div className="relative flex-1 w-full min-h-[300px]">
              <img src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg" alt="World Map" className="w-full h-full object-contain opacity-[0.1] filter grayscale pointer-events-none" />

              {/* Widget 1 (USA) */}
              <div className="absolute top-[10%] left-[5%] lg:left-[10%] bg-white rounded-2xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center gap-3 border border-slate-50 w-[200px] z-10 hover:scale-105 transition-transform">
                <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-[10px]">🇺🇸</div>
                <div className="flex-1">
                  <div className="text-[9px] font-bold leading-tight text-black">Bill Chunky <span className="font-medium text-slate-400">purchased iPhone 14 Pro Mockup</span></div>
                </div>
                <div className="text-[10px] font-bold text-emerald-500">$23.00</div>
              </div>

              {/* Widget 2 (India/Asia) */}
              <div className="absolute top-[40%] right-[0%] lg:right-[10%] bg-white rounded-2xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center gap-3 border border-slate-50 w-[200px] z-10 hover:scale-105 transition-transform">
                <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 text-[10px]">🇮🇳</div>
                <div className="flex-1">
                  <div className="text-[9px] font-bold leading-tight text-black">Nishatna <span className="font-medium text-slate-400">purchased iPhone 14 Pro Mockup</span></div>
                </div>
                <div className="text-[10px] font-bold text-emerald-500">$23.00</div>
              </div>

              {/* Widget 3 (Global/Africa) */}
              <div className="absolute bottom-[20%] left-[30%] lg:left-[35%] bg-white rounded-2xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center gap-3 border border-slate-50 w-[200px] z-10 hover:scale-105 transition-transform">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-[10px]">🌐</div>
                <div className="flex-1">
                  <div className="text-[9px] font-bold leading-tight text-black">Alana <span className="font-medium text-slate-400">upgraded to Team Pro License</span></div>
                </div>
                <div className="text-[10px] font-bold text-emerald-500">$52.00</div>
              </div>
            </div>

            {/* Stats Area */}
            <div className="flex flex-wrap items-center justify-between gap-6 lg:gap-12 mt-8 lg:mt-12 pt-8 border-t border-slate-50 lg:pl-12">
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-black mb-1 tracking-tight">132+</div>
                <div className="text-[10px] lg:text-[11px] text-slate-400 font-bold uppercase tracking-wider">Currencies supported</div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-black mb-1 tracking-tight">85.5%</div>
                <div className="text-[10px] lg:text-[11px] text-slate-400 font-bold uppercase tracking-wider">businesses using Ziro</div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-black mb-1 tracking-tight">150M</div>
                <div className="text-[10px] lg:text-[11px] text-slate-400 font-bold uppercase tracking-wider">API request per day</div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* CTA SECTION (Simplifying Payments) */}
      <section className="py-24 px-6 lg:px-12 bg-[#F8F9FA] w-full">
        <div className="max-w-[1440px] mx-auto bg-[#3B7DFF] rounded-[40px] shadow-[0_20px_60px_rgba(59,125,255,0.25)] p-10 lg:p-20 flex flex-col relative overflow-hidden min-h-[650px] lg:min-h-[750px]">
          
          {/* Faint Grid Background */}
          <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none"></div>

          {/* Squiggly Lines & Decorations */}
          <svg className="absolute left-[5%] lg:left-[15%] top-[40%] lg:top-[50%] w-32 lg:w-48 h-24 lg:h-32 opacity-50 pointer-events-none z-10" viewBox="0 0 200 100" fill="none">
            <path d="M 0 80 C 40 80, 50 20, 80 50 C 110 80, 130 10, 200 60" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <svg className="absolute right-[10%] lg:right-[20%] bottom-[30%] lg:bottom-[25%] w-16 lg:w-24 h-16 lg:h-24 opacity-50 pointer-events-none z-10" viewBox="0 0 100 100" fill="none">
            <path d="M 10 90 C 20 60, 40 30, 80 50 C 90 55, 85 70, 70 70 C 60 70, 70 90, 80 90" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div className="absolute right-[5%] lg:right-[15%] bottom-[15%] lg:bottom-[20%] w-6 h-6 rounded-[8px] border-2 border-white/30 flex items-center justify-center z-10">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>

          {/* Typography */}
          <div className="relative z-20 text-center flex flex-col items-center mt-4">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-[2.5rem] lg:text-[4.5rem] font-bold uppercase leading-[1.05] text-white tracking-tight max-w-4xl mx-auto mb-6"
            >
              Simplifying payments<br />for growing business
            </motion.h2>
            <p className="text-white/80 text-sm lg:text-base font-medium">
              Join over 300+ partners and customers already growing with Ziro
            </p>
          </div>

          {/* Center Cards Group (Exactly Two Cards) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[500px] z-10 pointer-events-none flex justify-center">
            
            {/* Back Card (Cyan-Black split) */}
            <motion.div 
              initial={{ opacity: 0, y: 100, x: "-65%", rotate: -90 }}
              whileInView={{ opacity: 1, y: 0, x: "-65%", rotate: -90 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute z-10 w-[340px] lg:w-[440px] aspect-[1.586] left-[50%] bottom-[-140px] lg:bottom-[-100px]"
            >
              <CreditCard type="cyan-black" style={{ width: '100%', height: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }} />
            </motion.div>
            
            {/* Front Card (Lilac-Black) */}
            <motion.div 
              initial={{ opacity: 0, y: 140, x: "-25%", rotate: -90 }}
              whileInView={{ opacity: 1, y: 0, x: "-25%", rotate: -90 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute z-20 w-[340px] lg:w-[440px] aspect-[1.586] left-[50%] bottom-[-60px] lg:bottom-[-20px]"
            >
              <CreditCard type="lilac-black" style={{ width: '100%', height: '100%', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }} />
            </motion.div>

          </div>

          {/* Floating Widgets */}
          <div className="absolute bottom-[20%] lg:bottom-[25%] left-[5%] lg:left-[15%] bg-white rounded-2xl p-3 shadow-2xl flex items-center gap-3 z-40 w-[200px] lg:w-[220px]">
            <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-[10px]">🇺🇸</div>
            <div className="flex-1 text-[9px] font-bold text-black leading-tight">
              Bill Chunky <span className="text-slate-400 font-medium">purchased iPhone 14 Pro Mockup</span>
            </div>
            <div className="text-[10px] font-bold text-emerald-500">$23.00</div>
          </div>

          <div className="absolute top-[50%] lg:top-[45%] right-[5%] lg:right-[15%] bg-white rounded-2xl p-3 shadow-2xl flex items-center gap-3 z-40 w-[200px] lg:w-[220px]">
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-[10px]">🌐</div>
            <div className="flex-1 text-[9px] font-bold text-black leading-tight">
              Alana <span className="text-slate-400 font-medium">upgraded to Team Pro License</span>
            </div>
            <div className="text-[10px] font-bold text-emerald-500">$152.00</div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  )
}
