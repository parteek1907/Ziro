"use client"

import { motion } from "framer-motion"

export default function DashboardOverview() {
  const transactions = [
    { id: "tx-1", type: "Settlement", to: "Alice Crypto", amount: "-$450.00", status: "Finalized", time: "2m ago" },
    { id: "tx-2", type: "Deposit", to: "L2 Wallet", amount: "+$2,000.00", status: "Finalized", time: "1h ago" },
    { id: "tx-3", type: "Payment", to: "AWS Services", amount: "-$124.50", status: "Finalized", time: "3h ago" },
    { id: "tx-4", type: "Settlement", to: "0x7a...9b", amount: "-$8,400.00", status: "Finalized", time: "1d ago" },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Grid: Balance & Transfer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2 bg-[#111114] rounded-[24px] border border-white/5 p-8 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2161E8]/10 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div>
            <div className="text-[#8B8F98] text-sm font-bold tracking-widest uppercase mb-2">Total Balance</div>
            <div className="text-white text-5xl font-bold tracking-tight mb-2">$42,504.80</div>
            <div className="text-[#35E58A] text-sm font-medium flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
              +$1,240.50 (2.4%) this week
            </div>
          </div>

          <div className="flex gap-4 mt-12 relative z-10">
            <button className="bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-[#F4F5F7] transition-colors flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              Send
            </button>
            <button className="bg-white/5 border border-white/10 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Receive
            </button>
          </div>
        </motion.div>

        {/* Mini TrustScore */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-gradient-to-br from-[#111114] to-[#0A0A0C] rounded-[24px] border border-white/5 p-8 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="text-[#8B8F98] text-xs font-bold tracking-widest uppercase">TrustScore</div>
            <div className="w-2 h-2 rounded-full bg-[#35E58A] shadow-[0_0_8px_#35E58A]"></div>
          </div>
          <div className="text-white text-6xl font-bold tracking-tight mb-6">740</div>
          
          <div className="flex items-end gap-1.5 h-16 mb-4">
            <div className="flex-1 bg-white/5 rounded-t-sm h-[40%]"></div>
            <div className="flex-1 bg-white/5 rounded-t-sm h-[60%]"></div>
            <div className="flex-1 bg-white/5 rounded-t-sm h-[30%]"></div>
            <div className="flex-1 bg-[#2161E8] rounded-t-sm h-[100%] shadow-[0_0_12px_rgba(33,97,232,0.3)]"></div>
            <div className="flex-1 bg-white/5 rounded-t-sm h-[75%]"></div>
          </div>
          
          <div className="text-[#8B8F98] text-xs font-bold tracking-widest uppercase border-t border-white/5 pt-4 flex justify-between">
            <span>Behavioral Data</span>
            <span className="text-white">Excellent</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Grid: Recent Activity & Quick Transfer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2 bg-[#111114] rounded-[24px] border border-white/5 overflow-hidden"
        >
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-white font-bold tracking-tight text-lg">Recent Activity</h3>
            <button className="text-[#8B8F98] text-sm hover:text-white transition-colors">View All</button>
          </div>
          <div className="divide-y divide-white/5">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      {tx.type === 'Deposit' ? <path d="M12 19V5M5 12l7-7 7 7"/> : <path d="M5 12h14M12 5l7 7-7 7"/>}
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm mb-0.5">{tx.to}</div>
                    <div className="text-[#8B8F98] text-xs">{tx.type} • {tx.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-sm mb-0.5 ${tx.amount.startsWith('+') ? 'text-[#35E58A]' : 'text-white'}`}>
                    {tx.amount}
                  </div>
                  <div className="text-[#8B8F98] text-xs flex items-center gap-1 justify-end">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2161E8]"></div>
                    {tx.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Transfer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-[#111114] rounded-[24px] border border-white/5 p-8 flex flex-col"
        >
          <h3 className="text-white font-bold tracking-tight text-lg mb-6">Quick Send</h3>
          
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-[#8B8F98] text-xs font-bold tracking-widest uppercase mb-2 block">Recipient</label>
              <input 
                type="text" 
                placeholder="@username or 0x..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#2161E8] focus:bg-white/10 transition-colors"
              />
            </div>
            
            <div>
              <label className="text-[#8B8F98] text-xs font-bold tracking-widest uppercase mb-2 block">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#2161E8] focus:bg-white/10 transition-colors"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#2161E8]/10 border border-[#2161E8]/20 flex items-center justify-between">
              <span className="text-[#2161E8] text-xs font-bold tracking-widest uppercase">Est. Settlement</span>
              <span className="text-[#2161E8] text-sm font-bold">2.1s</span>
            </div>
          </div>

          <button className="w-full bg-[#2161E8] text-white font-bold text-base rounded-xl px-4 py-3.5 hover:bg-[#1a4bba] transition-colors mt-6 flex items-center justify-center gap-2">
            Send via L2
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </motion.div>

      </div>
    </div>
  )
}
