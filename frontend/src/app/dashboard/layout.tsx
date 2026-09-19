"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/AuthContext"


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
    { name: "Hire a Consultant", href: "/dashboard/consultants", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
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
          {/* Scrollable Page Content */}
          <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar flex flex-col">
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}
