"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function NotFound() {
  return (
    <div className="h-screen w-full bg-white flex flex-col items-center justify-center relative overflow-hidden font-sans">

      {/* === ANIMATED SVG BACKGROUND LINES === */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
        {/* Horizontal Lines */}
        <motion.line x1="0" y1="20%" x2="100%" y2="20%" stroke="#3B7DFF" strokeWidth="0.5" strokeOpacity="0.12"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.2, ease: "easeInOut" }} />
        <motion.line x1="0" y1="50%" x2="100%" y2="50%" stroke="#3B7DFF" strokeWidth="0.5" strokeOpacity="0.1"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, delay: 0.4, ease: "easeInOut" }} />
        <motion.line x1="0" y1="80%" x2="100%" y2="80%" stroke="#3B7DFF" strokeWidth="0.5" strokeOpacity="0.12"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.6, ease: "easeInOut" }} />

        {/* Vertical Lines */}
        <motion.line x1="15%" y1="0" x2="15%" y2="100%" stroke="#3B7DFF" strokeWidth="0.5" strokeOpacity="0.1"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.3, ease: "easeInOut" }} />
        <motion.line x1="50%" y1="0" x2="50%" y2="100%" stroke="#3B7DFF" strokeWidth="0.5" strokeOpacity="0.08"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }} />
        <motion.line x1="85%" y1="0" x2="85%" y2="100%" stroke="#3B7DFF" strokeWidth="0.5" strokeOpacity="0.1"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.7, ease: "easeInOut" }} />

        {/* Large Diagonal Accent Lines */}
        <motion.line x1="-5%" y1="100%" x2="40%" y2="0%" stroke="#3B7DFF" strokeWidth="1" strokeOpacity="0.06"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, delay: 0.8, ease: "easeInOut" }} />
        <motion.line x1="60%" y1="100%" x2="105%" y2="0%" stroke="#3B7DFF" strokeWidth="1" strokeOpacity="0.06"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, delay: 1, ease: "easeInOut" }} />

        {/* Decorative Corner Brackets - Top Left */}
        <motion.path d="M 40 40 L 40 100 M 40 40 L 100 40" stroke="#3B7DFF" strokeWidth="1.5" strokeOpacity="0.3" fill="none"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 1.2, ease: "easeOut" }} />

        {/* Decorative Corner Brackets - Top Right */}
        <motion.path d="M calc(100% - 40px) 40 L calc(100% - 40px) 100 M calc(100% - 100px) 40 L calc(100% - 40px) 40" 
          stroke="#3B7DFF" strokeWidth="1.5" strokeOpacity="0.3" fill="none"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 1.3, ease: "easeOut" }} />

        {/* Decorative Corner Brackets - Bottom Left */}
        <motion.path d="M 40 calc(100% - 40px) L 40 calc(100% - 100px) M 40 calc(100% - 40px) L 100 calc(100% - 40px)" 
          stroke="#3B7DFF" strokeWidth="1.5" strokeOpacity="0.3" fill="none"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 1.4, ease: "easeOut" }} />

        {/* Decorative Corner Brackets - Bottom Right */}
        <motion.path d="M calc(100% - 40px) calc(100% - 40px) L calc(100% - 40px) calc(100% - 100px) M calc(100% - 100px) calc(100% - 40px) L calc(100% - 40px) calc(100% - 40px)" 
          stroke="#3B7DFF" strokeWidth="1.5" strokeOpacity="0.3" fill="none"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 1.5, ease: "easeOut" }} />

        {/* Animated Orbiting circle */}
        <motion.circle cx="15%" cy="20%" r="4" fill="#3B7DFF" fillOpacity="0.4"
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} />
        <motion.circle cx="85%" cy="80%" r="4" fill="#3B7DFF" fillOpacity="0.4"
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
        <motion.circle cx="85%" cy="20%" r="3" fill="#3B7DFF" fillOpacity="0.3"
          animate={{ scale: [1, 2, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
        <motion.circle cx="15%" cy="80%" r="3" fill="#3B7DFF" fillOpacity="0.3"
          animate={{ scale: [1, 2, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.8 }} />
        
        {/* Center Cross / Plus decoration */}
        <motion.path d="M 50% calc(50% - 220px) L 50% calc(50% - 170px)" stroke="#3B7DFF" strokeWidth="1" strokeOpacity="0.5"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.8 }} />
        <motion.path d="M calc(50% - 25px) calc(50% - 195px) L calc(50% + 25px) calc(50% - 195px)" stroke="#3B7DFF" strokeWidth="1" strokeOpacity="0.5"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 2 }} />

        {/* Sweeping arc */}
        <motion.path d="M 0 100% Q 50% 60% 100% 100%" stroke="#3B7DFF" strokeWidth="0.7" strokeOpacity="0.08" fill="none"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, delay: 0.9, ease: "easeInOut" }} />
      </svg>

      {/* Blurred blue orbs */}
      <div className="absolute top-[8%] left-[5%] w-[300px] h-[300px] rounded-full bg-[#3B7DFF]/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[8%] right-[5%] w-[350px] h-[350px] rounded-full bg-[#3B7DFF]/6 blur-[120px] pointer-events-none"></div>

      {/* Logo */}
      <div className="absolute top-8 left-8 lg:top-12 lg:left-12 z-20">
        <Link href="/">
          <img src="/logo.png" alt="Ziro Logo" className="h-10" />
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="h-px w-12 bg-[#3B7DFF]"></div>
          <span className="text-[#3B7DFF] font-bold tracking-[0.3em] text-xs uppercase">Error 404</span>
          <div className="h-px w-12 bg-[#3B7DFF]"></div>
        </motion.div>

        {/* Giant 404 Text */}
        <div className="relative mb-4">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-[8rem] lg:text-[14rem] font-bold leading-none tracking-tight text-[#0B1220] select-none"
            style={{ WebkitTextStroke: "0px" }}
          >
            404
          </motion.h1>
          {/* Ghost / Outline version behind */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, delay: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-[8rem] lg:text-[14rem] font-bold leading-none tracking-tight select-none"
              style={{ WebkitTextStroke: "1px rgba(59,125,255,0.12)", color: "transparent" }}>
              404
            </span>
          </motion.div>
        </div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-[1.8rem] lg:text-[2.5rem] font-bold text-[#0B1220] tracking-tight leading-[1.1] uppercase mb-4"
        >
          You've crossed into<br />
          <span className="text-[#3B7DFF]">uncharted territory.</span>
        </motion.h2>

        {/* Subtext */}
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="text-[#8B8F98] text-sm lg:text-base max-w-md mb-10 font-medium leading-relaxed"
        >
          The page you're searching for doesn't exist. It may have been moved, renamed, or perhaps it never existed at all.
        </motion.p>
        
        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-4"
        >
          <Link href="/" className="inline-flex items-center justify-center gap-2 bg-[#0B1220] text-white font-bold text-sm rounded-2xl px-8 py-4 hover:bg-black hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-[0_10px_30px_rgb(11,18,32,0.15)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Home
          </Link>
          <Link href="/login" className="inline-flex items-center justify-center bg-white text-[#0B1220] font-bold text-sm rounded-2xl px-8 py-4 border border-slate-200 hover:bg-slate-50 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-sm">
            Sign in
          </Link>
        </motion.div>
      </div>

      {/* Bottom label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-[10px] tracking-[0.3em] uppercase text-slate-400 font-bold"
      >
        Ziro &mdash; Banking. Smarter. Better.
      </motion.div>

    </div>
  )
}
