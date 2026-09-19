import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-[1440px] mx-auto px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-gray-200 min-h-[400px]">
          
          {/* Left Column (Spans 2) */}
          <div className="col-span-1 md:col-span-2 flex flex-col justify-between py-16 pr-8">
            <div className="flex-1 flex items-center">
              <Link href="/" className="flex items-center">
                <img src="/logo.png" alt="Ziro Logo" className="h-24 md:h-32 w-auto object-contain" />
              </Link>
            </div>
            <p className="text-[11px] font-bold text-gray-500 mt-8 uppercase tracking-wide">
              © 2024 Ziro. All right reserved
            </p>
          </div>
          
          {/* Features Column */}
          <div className="col-span-1 py-16 px-8 flex flex-col">
            <h4 className="text-[11px] font-bold text-gray-400 mb-8 uppercase tracking-wider">Features</h4>
            <ul className="space-y-4 text-[13px] font-semibold text-gray-900">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Payment Link</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Recurring Billing</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Invoicing</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Checkout</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Integrations</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          {/* Solutions Column */}
          <div className="col-span-1 py-16 px-8 flex flex-col">
            <h4 className="text-[11px] font-bold text-gray-400 mb-8 uppercase tracking-wider">Solutions</h4>
            <ul className="space-y-4 text-[13px] font-semibold text-gray-900">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">eCommerce</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Finance Automation</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Crypto</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Global Business</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Marketplaces</Link></li>
            </ul>
          </div>
          
          {/* Resources Column */}
          <div className="col-span-1 py-16 px-8 flex flex-col">
            <h4 className="text-[11px] font-bold text-gray-400 mb-8 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-4 text-[13px] font-semibold text-gray-900">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Tutorials</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Community</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          
          {/* About Column */}
          <div className="col-span-1 py-16 pl-8 flex flex-col justify-between">
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 mb-8 uppercase tracking-wider">About</h4>
              <ul className="space-y-4 text-[13px] font-semibold text-gray-900">
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Company</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">FAQ</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            

          </div>
          
        </div>
      </div>
    </footer>
  )
}
