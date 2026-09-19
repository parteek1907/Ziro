"use client"

import Link from "next/link"
import { Footer } from "@/components/Footer"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      
      {/* Simple Header */}
      <nav className="w-full px-8 py-6 border-b border-gray-100 flex items-center justify-between relative overflow-hidden">
        <div className="hidden md:flex md:flex-1"></div>
        <Link href="/" className="flex items-center justify-center z-10">
          <img src="/logo.png" alt="Ziro Logo" className="h-10 md:h-12 w-auto object-contain scale-[2.5] md:scale-[3] origin-center" />
        </Link>
        <div className="flex items-center justify-end flex-1 z-10">
          <Link href="/dashboard" className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors">
            Go to App
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-8 py-16 lg:py-24">
        {children}
      </main>

      <Footer />
    </div>
  )
}
