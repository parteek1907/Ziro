"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/AuthContext"
import { FinanceProvider } from "@/lib/FinanceContext"
import { useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  
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

  const handleLogout = async () => {
    setShowLogoutModal(false)
    await logout()
    router.push("/")
  }

  return (
    <div className="h-screen w-full relative flex overflow-hidden bg-[#e0e5e0] font-sans">
      
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] rounded-full bg-[#fdf5ed]/80 blur-[120px]"></div>
        <div className="absolute top-[20%] right-[-20%] w-[900px] h-[900px] rounded-full bg-[#394a48]/20 blur-[150px]"></div>
        <div className="absolute -bottom-[20%] left-[10%] w-[700px] h-[700px] rounded-full bg-[#9fada8]/30 blur-[140px]"></div>
        <div className="absolute bottom-[10%] right-[30%] w-[600px] h-[600px] rounded-full bg-[#e3cdbe]/40 blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Main Glassmorphic Container */}
      <div className="relative z-10 w-full h-full bg-white/40 backdrop-blur-3xl flex overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-[280px] bg-black/5 border-r border-white/30 flex flex-col justify-between hidden md:flex shrink-0">
          <div>
            <div className="h-24 flex items-center px-6 pt-2">
              <Link href="/dashboard" className="flex items-center">
                <img src="/logo.png" alt="Ziro Logo" className="h-12 w-auto object-contain brightness-0 opacity-90 scale-[3] origin-left" />
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
            <Link href="/dashboard/settings" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-white/40 font-semibold text-sm transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.5a2 2 0 0 1-1 1.72l-.15.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              Settings
            </Link>
            
            <button 
              onClick={() => setShowLogoutModal(true)} 
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-50/50 font-semibold text-sm transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Top Bar (Aligned with ZIRO logo in sidebar) */}
          <header className="h-24 shrink-0 flex items-center justify-end px-10 relative z-20">
            <Link 
              href="/dashboard/settings" 
              className="flex items-center gap-3 bg-white/40 hover:bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 shadow-sm transition-all hover:scale-[1.02]"
            >
              <span className="text-sm font-bold text-slate-800">{displayName}</span>
              <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 border-2 border-white flex items-center justify-center shrink-0">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-black text-slate-500 tracking-tighter">{initials}</span>
                )}
              </div>
            </Link>
          </header>

          {/* Scrollable Page Content */}
          <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar flex flex-col">
            <FinanceProvider>
              {children}
            </FinanceProvider>
          </div>
        </main>

        {/* Logout Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Log out of ZIRO?</h3>
              <p className="text-sm text-slate-500 mb-8">You will need to sign back in to access your wallet and perform transfers.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-3 rounded-2xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 rounded-2xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
