"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
    { name: "Transfers", href: "/dashboard/transfers", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
    { name: "Virtual Cards", href: "/dashboard/cards", icon: "M3 10v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6M3 10V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4M3 10h18" },
    { name: "TrustScore", href: "/dashboard/trustscore", icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
    { name: "Scam Detector", href: "/dashboard/scam-detector", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
    { name: "AI Mentor", href: "/dashboard/mentor", icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" },
    { name: "Goal Tracker", href: "/dashboard/goals", icon: "M2 12h20M12 2v20M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" },
  ]

  return (
    <div className="min-h-screen bg-[#050507] flex text-white font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col justify-between hidden md:flex bg-[#0A0A0C]">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-white/5">
            <Link href="/" className="font-bold text-2xl tracking-tight text-white hover:text-[#2161E8] transition-colors">
              Ziro
            </Link>
          </div>
          <nav className="p-4 space-y-2 mt-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? "bg-[#2161E8]/10 text-[#2161E8] font-bold" 
                      : "text-[#8B8F98] hover:text-white hover:bg-white/5 font-medium"
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/5">
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#8B8F98] hover:text-white hover:bg-white/5 font-medium transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Settings
          </Link>
          
          <div className="mt-4 flex items-center gap-3 px-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2161E8] to-[#00E5FF] p-[2px]">
              <div className="w-full h-full rounded-full bg-[#0B0B0D] border-2 border-[#0B0B0D] flex items-center justify-center font-bold text-sm">
                JD
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-white">Jane Doe</div>
              <div className="text-xs text-[#8B8F98]">jane@ziro.app</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-[#0A0A0C]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4 md:hidden">
            <Link href="/" className="font-bold text-xl tracking-tight text-white">Ziro</Link>
          </div>
          <h1 className="hidden md:block text-xl font-bold tracking-tight capitalize text-white">
            {pathname === '/dashboard' ? 'Overview' : pathname.split('/').pop()}
          </h1>

          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#8B8F98]">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <div className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#2161E8]"></div>
            </button>
            <div className="md:hidden w-10 h-10 rounded-full bg-gradient-to-tr from-[#2161E8] to-[#00E5FF] p-[2px]">
              <div className="w-full h-full rounded-full bg-[#0B0B0D] flex items-center justify-center font-bold text-sm">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          {children}
        </div>
      </main>

    </div>
  )
}
