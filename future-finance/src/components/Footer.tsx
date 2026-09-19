import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-[#13142A] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-sm bg-white"></div>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Ziro
              </span>
            </Link>
            <p className="text-white/40 max-w-sm text-sm leading-relaxed">
              An AI-driven, zero-bandwidth, zero-knowledge financial platform bringing the unbanked into the global economy.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-white/80 mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-white/40">
              <li><Link href="#" className="hover:text-white transition-colors">Digital Banking</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Card Services</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-white/80 mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-white/40">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Community</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/25">
            © {new Date().getFullYear()} Ziro. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-white/25">
            <Link href="#" className="hover:text-white/50 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white/50 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
