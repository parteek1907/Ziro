import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-[1440px] mx-auto px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-200 min-h-[400px]">
          
          {/* Left Column (Spans 2) */}
          <div className="col-span-1 md:col-span-2 flex flex-col justify-between py-16 pr-8">
            <div className="flex-1 flex items-center">
              <Link href="/" className="flex items-center">
                <img src="/logo.png" alt="Ziro Logo" className="h-24 md:h-32 w-auto object-contain" />
              </Link>
            </div>
            <p className="text-[11px] font-bold text-gray-500 mt-8 uppercase tracking-wide">
              © 2026 Ziro. All rights reserved
            </p>
          </div>
          
          {/* Features Column */}
          <div className="col-span-1 py-16 px-8 flex flex-col">
            <h4 className="text-[11px] font-bold text-gray-400 mb-8 uppercase tracking-wider">Features</h4>
            <ul className="space-y-4 text-[13px] font-semibold text-gray-900">
              <li><Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link></li>
              <li><Link href="/dashboard/send-money" className="hover:text-blue-600 transition-colors">Send Money</Link></li>
              <li><Link href="/dashboard/consultants" className="hover:text-blue-600 transition-colors">Hire a Consultant</Link></li>
              <li><Link href="/dashboard/trustscore" className="hover:text-blue-600 transition-colors">TrustScore</Link></li>
            </ul>
          </div>
          
          {/* Legal Column */}
          <div className="col-span-1 py-16 px-8 flex flex-col">
            <h4 className="text-[11px] font-bold text-gray-400 mb-8 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-4 text-[13px] font-semibold text-gray-900">
              <li><Link href="/legal/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="/legal/cookies" className="hover:text-blue-600 transition-colors">Cookies Policy</Link></li>
            </ul>
          </div>
          
          {/* About Column */}
          <div className="col-span-1 py-16 pl-8 flex flex-col justify-between">
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 mb-8 uppercase tracking-wider">About</h4>
              <ul className="space-y-4 text-[13px] font-semibold text-gray-900">
                <li><a href="mailto:support@ziro.com" className="hover:text-blue-600 transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
        </div>
      </div>
    </footer>
  )
}
