import Link from "next/link"
import { Box } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white font-bold">
                <Box size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                FutureFinance
              </span>
            </Link>
            <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
              An AI-driven, zero-bandwidth, zero-knowledge financial platform bringing the unbanked into the global economy.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link href="#" className="hover:text-emerald-600">L2 Remittance</Link></li>
              <li><Link href="#" className="hover:text-emerald-600">AI TrustScore</Link></li>
              <li><Link href="#" className="hover:text-emerald-600">Offline Vault</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link href="#" className="hover:text-emerald-600">About Us</Link></li>
              <li><Link href="#" className="hover:text-emerald-600">Hackathon</Link></li>
              <li><Link href="#" className="hover:text-emerald-600">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} FutureFinance. Built for Future Finance (AI for Good).
          </p>
          <div className="flex gap-4 text-sm text-slate-400">
            <Link href="#" className="hover:text-slate-600">Terms</Link>
            <Link href="#" className="hover:text-slate-600">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
