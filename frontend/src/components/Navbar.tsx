import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1A1B2E]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-sm bg-white"></div>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            CyberBank
          </span>
        </Link>

        {/* Center Nav */}
        <div className="hidden md:flex items-center gap-8">
          {["Projects", "Products", "Community", "Company", "Contact"].map((item) => (
            <Link key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              {item}
            </Link>
          ))}
        </div>
        
        {/* Right */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors px-5 py-2.5 rounded-full border border-white/10 hover:border-white/20">
            Log in
          </Link>
          <Link href="/signup" className="text-sm font-medium text-white bg-white/10 hover:bg-white/15 px-5 py-2.5 rounded-full border border-white/10 transition-all">
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  )
}
