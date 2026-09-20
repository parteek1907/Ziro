"use client"
import { motion } from "framer-motion"

interface ZiroTicketProps {
  paymentId: string
  amount: number
  fees: number
  currency: string
  recipient: string
  fundingSource: string
  onDone: () => void
}

export function ZiroTicket({ paymentId, amount, fees, currency, recipient, fundingSource, onDone }: ZiroTicketProps) {
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto">
      <motion.div 
        initial={{ y: 50, opacity: 0, rotateX: 20 }}
        animate={{ y: 0, opacity: 1, rotateX: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
        className="w-full relative filter drop-shadow-2xl"
      >
        {/* Top half of ticket */}
        <div className="bg-white rounded-t-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#4a72ff] to-[#bc9ff5]" />
          
          <div className="flex justify-between items-center mb-8">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Receipt</span>
              <span className="text-sm font-mono font-bold text-slate-900">{paymentId}</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center mb-8">
            <span className="text-slate-400 font-semibold text-sm mb-1">Total Paid</span>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-slate-900 tracking-tighter">{(amount + fees).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              <span className="text-xl font-bold text-slate-500">{currency}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium text-sm">Amount Sent</span>
              <span className="text-slate-900 font-bold text-sm">{amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currency}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium text-sm">To</span>
              <span className="text-slate-900 font-bold text-sm">{recipient}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium text-sm">From</span>
              <span className="text-slate-900 font-bold text-sm">{fundingSource}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium text-sm">Date</span>
              <span className="text-slate-900 font-bold text-sm">{date} at {time}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium text-sm">Fee</span>
              <span className="text-slate-900 font-bold text-sm">{fees.toLocaleString()} {currency}</span>
            </div>
          </div>
          
          {/* Ticket cutouts */}
          <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-[#e0e5e0] rounded-full z-10" />
          <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#e0e5e0] rounded-full z-10" />
        </div>

        {/* Divider */}
        <div className="relative h-px bg-transparent w-full flex items-center justify-center overflow-hidden">
          <div className="w-full border-t-2 border-dashed border-slate-200" />
        </div>

        {/* Bottom half of ticket */}
        <div className="bg-white rounded-b-3xl p-8 relative pt-6 flex flex-col items-center gap-6">
          {/* Cutouts */}
          <div className="absolute -top-3 -left-3 w-6 h-6 bg-[#e0e5e0] rounded-full z-10" />
          <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#e0e5e0] rounded-full z-10" />
          
          {/* Faux Barcode */}
          <div className="w-full flex justify-between h-12 opacity-40">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="bg-slate-800" style={{ width: ((((i * 13) % 40) / 40) * 4 + 1) + 'px' }} />
            ))}
          </div>
          
          <button 
            onClick={onDone} 
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-base px-6 py-4 rounded-2xl transition-colors mt-2"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  )
}
