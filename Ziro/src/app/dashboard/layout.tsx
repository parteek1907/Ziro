"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/AuthContext"
import MentorChat from "@/components/MentorChat"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const pathname = usePathname()
  
  const displayName = user?.displayName || "User"
  const email = user?.email || ""
  const initials = displayName.substring(0, 2).toUpperCase() || "US"

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
    { name: "Send Money", href: "/dashboard/transfers", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
    { name: "TrustScore", href: "/dashboard/trustscore", icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
    { name: "Offline Vault", href: "/dashboard/vault", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
    { name: "Activity", href: "/dashboard/activity", icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" },
  ]

  return (
    <div className="h-screen w-full relative flex overflow-hidden bg-[#e0e5e0] font-sans">
      
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Soft, warm blurred spots resembling the reference background */}
        <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] rounded-full bg-[#fdf5ed]/80 blur-[120px]"></div>
        <div className="absolute top-[20%] right-[-20%] w-[900px] h-[900px] rounded-full bg-[#394a48]/20 blur-[150px]"></div>
        <div className="absolute -bottom-[20%] left-[10%] w-[700px] h-[700px] rounded-full bg-[#9fada8]/30 blur-[140px]"></div>
        <div className="absolute bottom-[10%] right-[30%] w-[600px] h-[600px] rounded-full bg-[#e3cdbe]/40 blur-[120px]"></div>
        
        {/* Faint subtle grid texture over the ambient light */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Main Glassmorphic Container */}
      <div className="relative z-10 w-full h-full bg-white/40 backdrop-blur-3xl flex overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-[280px] bg-black/5 border-r border-white/30 flex flex-col justify-between hidden md:flex shrink-0">
          <div>
            <div className="h-24 flex items-center px-8">
              <Link href="/" className="flex items-center gap-3">
                {/* Minimalist Logo icon mimicking the reference */}
                <div className="w-10 h-10 rounded-full bg-[#4a72ff] flex items-center justify-center text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <span className="font-bold text-2xl tracking-tight text-slate-800">
                  Ziro
                </span>
              </Link>
            </div>
            
            <nav className="px-6 py-2 space-y-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-semibold text-sm ${
                      isActive 
                        ? "bg-white/80 text-slate-900 shadow-sm shadow-black/5" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                    }`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isActive ? "text-[#4a72ff]" : "opacity-60"}>
                      <path d={item.icon} />
                    </svg>
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="px-6 pb-8 space-y-1.5">
            <Link href="/dashboard/help" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-white/40 font-semibold text-sm transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
              </svg>
              Help Center
            </Link>
            <Link href="/logout" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-white/40 font-semibold text-sm transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Top Header */}
          <header className="h-24 flex items-center justify-between px-8 md:px-12 shrink-0">
            <div className="flex items-center gap-4 md:hidden">
              <div className="w-10 h-10 rounded-full bg-[#4a72ff] flex items-center justify-center text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
            </div>

            {/* Search Bar - like reference */}
            <div className="hidden md:flex items-center bg-white/50 border border-white/40 rounded-full px-4 py-2 w-[350px] shadow-inner shadow-white/50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search transactions, recipients, or activity..." 
                className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400 ml-3 w-full"
              />
            </div>

            {/* Top Right Profile / Actions */}
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-white/60 hover:bg-white/80 border border-white/50 flex items-center justify-center text-slate-600 transition-colors relative">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-white"></div>
              </button>
              <button className="w-10 h-10 rounded-full bg-white/60 hover:bg-white/80 border border-white/50 flex items-center justify-center text-slate-600 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
              <div className="w-10 h-10 rounded-full bg-slate-300 border border-white/50 ml-2 overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://i.pravatar.cc/100?img=11')" }}>
              </div>
            </div>
          </header>

          {/* Scrollable Page Content */}
          <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-12 relative z-10 custom-scrollbar">
            {children}
          </div>
        </main>

      </div>
      {/* AI Mentor floating chat — available on all dashboard pages */}
      <MentorChat />
    </div>
  )
}
