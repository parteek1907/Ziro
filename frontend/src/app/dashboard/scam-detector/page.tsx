"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export default function ScamDetectorPage() {
  const [input, setInput] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<null | 'safe' | 'risk'>(null)

  const handleScan = () => {
    if (!input.trim()) return
    setIsScanning(true)
    setResult(null)
    
    // Simulate network request/analysis
    setTimeout(() => {
      setIsScanning(false)
      // Mock logic: if it contains '0x', simulate risk, else safe
      if (input.includes('0x')) {
        setResult('risk')
      } else {
        setResult('safe')
      }
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-white text-3xl font-bold tracking-tight mb-2">Scam Detector</h1>
        <p className="text-[#8B8F98]">Analyze addresses, contracts, and URLs for potential risks before you transact.</p>
      </div>

      <div className="bg-[#111114] border border-white/5 rounded-[24px] p-8">
        <label className="text-white text-sm font-bold tracking-wide mb-3 block">Target to analyze</label>
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a crypto address, smart contract, or URL here..."
            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#2161E8] focus:bg-white/10 transition-colors resize-none"
          ></textarea>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleScan}
            disabled={isScanning || !input.trim()}
            className="bg-[#2161E8] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#1a4bba] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Scanning...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Run Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border rounded-[24px] p-8 ${
            result === 'safe' 
              ? 'bg-[#35E58A]/5 border-[#35E58A]/20' 
              : 'bg-red-500/5 border-red-500/20'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              result === 'safe' ? 'bg-[#35E58A]/20 text-[#35E58A]' : 'bg-red-500/20 text-red-500'
            }`}>
              {result === 'safe' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              )}
            </div>
            <div>
              <h3 className={`text-xl font-bold tracking-tight mb-2 ${
                result === 'safe' ? 'text-[#35E58A]' : 'text-red-500'
              }`}>
                {result === 'safe' ? 'Looks Safe' : 'High Risk Detected'}
              </h3>
              <p className="text-white/70 leading-relaxed mb-6">
                {result === 'safe' 
                  ? 'Our behavioral AI models and historical blockchain analysis did not flag this target as malicious. However, always exercise caution.'
                  : 'This address shares behavioral patterns with known phishing networks. Our L2 network will flag transactions directed here.'}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-xs text-[#8B8F98] uppercase tracking-widest font-bold mb-1">Contract Age</div>
                  <div className="text-white font-medium">{result === 'safe' ? '2.4 Years' : '14 Days'}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-xs text-[#8B8F98] uppercase tracking-widest font-bold mb-1">Prior Reports</div>
                  <div className="text-white font-medium">{result === 'safe' ? '0' : '12'}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  )
}
