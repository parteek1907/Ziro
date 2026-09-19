import Link from "next/link"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="#encryption" className="text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors">Encryption</Link>
          <Link href="#features" className="text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors">Features</Link>
          <Link href="#security" className="text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors">Security</Link>
        </div>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <span className="text-2xl font-bold tracking-tight text-black">
            FutureFinance
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="bg-slate-100 hover:bg-slate-200 text-black px-6 py-3 rounded-full font-semibold text-sm transition-all"
          >
            Launch app
          </Link>
        </div>
      </div>
    </nav>
  )
}
