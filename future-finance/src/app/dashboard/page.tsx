"use client"

import { motion } from "framer-motion"

export default function DashboardOverview() {
  const transactions = [
    { id: "tx-1", type: "Settlement", to: "Maria Garcia", route: "USD → MXN", amount: "-$450.00", status: "Completed", time: "12 mins ago" },
    { id: "tx-2", type: "Transfer", to: "James Wilson", route: "USD → INR", amount: "+$2,000.00", status: "Completed", time: "34 mins ago" },
    { id: "tx-3", type: "Payment", to: "L2 Wallet", route: "USD → KES", amount: "-$124.50", status: "Pending", time: "1 hour ago" },
    { id: "tx-4", type: "Transfer", to: "Amara", route: "USD → KES", amount: "-$8,400.00", status: "Completed", time: "2 hours ago" },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pt-2">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight text-slate-800 mb-2"
          >
            Your financial overview
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm font-medium text-slate-500"
          >
            Everything moving through Ziro, in one place.
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <button className="bg-white/50 hover:bg-white/80 border border-white/40 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export Report
          </button>
          <button className="bg-slate-800 hover:bg-black text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 shadow-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Send Money
          </button>
        </motion.div>
      </div>

      {/* Top Grid: Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 p-7 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="text-slate-600 text-sm font-semibold">Total Balance</div>
            <div className="bg-[#4a72ff]/10 text-[#4a72ff] text-[11px] font-bold px-2 py-1 rounded-md">
              +12.4%
            </div>
          </div>
          <div>
            <div className="text-slate-800 text-[2.5rem] font-bold tracking-tight mb-1 leading-none">$42,280.50</div>
            <div className="text-slate-500 text-xs font-medium">+$4,580.50 this month</div>
          </div>
        </motion.div>

        {/* TrustScore / Orders Completed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 p-7 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="text-slate-600 text-sm font-semibold">TrustScore</div>
            <div className="bg-[#4a72ff]/10 text-[#4a72ff] text-[11px] font-bold px-2 py-1 rounded-md">
              Excellent
            </div>
          </div>
          <div>
            <div className="text-slate-800 text-[2.5rem] font-bold tracking-tight mb-1 leading-none">740</div>
            <div className="text-slate-500 text-xs font-medium">+12 points this month</div>
          </div>
        </motion.div>

        {/* API Requests / Table Occupancy */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 p-7 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="text-slate-600 text-sm font-semibold">Global Transfers</div>
            <div className="bg-orange-100 text-orange-600 text-[11px] font-bold px-2 py-1 rounded-md">
              Active
            </div>
          </div>
          <div>
            <div className="text-slate-800 text-[2.5rem] font-bold tracking-tight mb-3 leading-none">12</div>
            <div className="text-slate-500 text-xs font-medium">4 countries this month</div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Grid: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Recent Activity Table (Live Orders equivalent) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="lg:col-span-2 flex flex-col"
        >
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-slate-800 font-bold text-[1.1rem]">Recent Activity</h3>
            <button className="bg-black/5 hover:bg-black/10 text-slate-600 text-xs font-bold px-4 py-1.5 rounded-full transition-colors flex items-center gap-1">
              Filter
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
          </div>
          
          <div className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 overflow-hidden shadow-sm flex-1 p-2">
            
            <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-black/5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <div className="col-span-2">TYPE</div>
              <div className="col-span-4">TRANSACTION</div>
              <div className="col-span-2">ROUTE</div>
              <div className="col-span-2">TIME</div>
              <div className="col-span-2 text-right">STATUS</div>
            </div>

            <div className="divide-y divide-black/5">
              {transactions.map((tx, i) => (
                <div key={tx.id} className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-white/40 transition-colors cursor-pointer rounded-2xl mx-1 my-1">
                  <div className="col-span-2 text-xs font-bold text-slate-700">
                    {tx.type}
                  </div>
                  <div className="col-span-4">
                    <div className="text-slate-800 font-bold text-xs mb-0.5">{tx.to}</div>
                  </div>
                  <div className="col-span-2 text-xs text-slate-500 font-medium">
                    {tx.route}
                  </div>
                  <div className="col-span-2 text-xs text-slate-500 font-medium">
                    {tx.time}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    {tx.status === 'Completed' ? (
                      <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full">Completed</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full">Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Sidebar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex flex-col"
        >
          <h3 className="text-slate-800 font-bold text-[1.1rem] mb-4 px-2">Quick Actions</h3>
          
          <div className="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/50 p-2 shadow-sm flex-1 space-y-1">
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-white/60 rounded-[20px] transition-colors text-left group">
              <div>
                <div className="text-sm font-bold text-slate-800 mb-0.5">Send Money</div>
                <div className="text-xs text-slate-500 font-medium">Transfer money globally</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-slate-800 transition-colors">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-white/60 rounded-[20px] transition-colors text-left group">
              <div>
                <div className="text-sm font-bold text-slate-800 mb-0.5">TrustScore</div>
                <div className="text-xs text-slate-500 font-medium">View your financial trust profile</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-slate-800 transition-colors">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-white/60 rounded-[20px] transition-colors text-left group">
              <div>
                <div className="text-sm font-bold text-slate-800 mb-0.5">Offline Vault</div>
                <div className="text-xs text-slate-500 font-medium">Sign a transaction without internet</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-slate-800 transition-colors">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-white/60 rounded-[20px] transition-colors text-left group">
              <div>
                <div className="text-sm font-bold text-slate-800 mb-0.5">Transaction History</div>
                <div className="text-xs text-slate-500 font-medium">View past transfers</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-slate-800 transition-colors">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
            
          </div>
        </motion.div>

      </div>
    </div>
  )
}
