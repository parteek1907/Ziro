"use client"
import React, { useEffect, useState } from 'react'

export default function ExplorerPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [latestBlock, setLatestBlock] = useState(14502000)

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/explorer/transactions`)
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        setTransactions(data)
        if (data.length > 0) setLatestBlock(data[0].block_number)
        setLoading(false)
      } catch (err) {
        console.warn("Backend down, showing mock transactions", err)
        setTransactions([
          {
            tx_hash: "0x8f7a3d91b4e2c6f8a9e7d5c3b1a2f4e6d8c0b9a8f7e6d5c4b3a2f1",
            block_number: latestBlock,
            from_address: "0x3b82f6e8a4d",
            to_address: "0x10b9a8f3c2e",
            amount: 100,
            currency: "USD",
            status: "SETTLED",
            timestamp: new Date().toISOString()
          },
          {
            tx_hash: "0x9c4f2e5d3a1b4c6e8f7a3d91b4e2c6f8a9e7d5c3",
            block_number: latestBlock - 1,
            from_address: "0x4a72ff1bc9a",
            to_address: "0xbc9ff5e4a72",
            amount: 50,
            currency: "USD",
            status: "SETTLED",
            timestamp: new Date(Date.now() - 60000).toISOString()
          }
        ])
        setLoading(false)
      }
    }

    fetchTx()
    const interval = setInterval(fetchTx, 2000)
    return () => clearInterval(interval)
  }, [latestBlock])

  function truncate(str: string) {
    if (!str) return ""
    if (str.length <= 16) return str;
    return str.substring(0, 10) + '...' + str.substring(str.length - 6);
  }

  function formatDate(isoString: string) {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col" style={{ backgroundImage: "radial-gradient(circle at 15% 50%, rgba(59, 130, 246, 0.08), transparent 25%), radial-gradient(circle at 85% 30%, rgba(16, 185, 129, 0.05), transparent 25%)", backgroundAttachment: "fixed" }}>
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 border-l-2 border-slate-200 pl-4">Ziro L2 Scan</h1>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(5,150,105,0.5)] animate-pulse" />
          Network Secured
        </div>
      </header>

      <main className="flex-1 px-8 py-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 backdrop-blur-md shadow-sm">
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Latest Block</div>
            <div className="text-3xl font-bold font-mono suppress-hydration-warning" suppressHydrationWarning>{latestBlock.toLocaleString("en-US")}</div>
          </div>
          <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 backdrop-blur-md shadow-sm">
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Network TPS</div>
            <div className="text-3xl font-bold font-mono">12,403</div>
          </div>
          <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 backdrop-blur-md shadow-sm">
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Avg Gas Fee</div>
            <div className="text-3xl font-bold font-mono">$0.001</div>
          </div>
        </div>

        <div className="bg-white/80 border border-slate-200 rounded-2xl backdrop-blur-md overflow-hidden shadow-md">
          <div className="grid grid-cols-7 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="col-span-2">Txn Hash</div>
            <div>Block</div>
            <div>From</div>
            <div>To</div>
            <div>Status</div>
            <div>Timestamp</div>
          </div>
          <div className="flex flex-col">
            {loading ? (
              <div className="px-6 py-12 text-center text-slate-500">Syncing blocks...</div>
            ) : (
              transactions.map((tx, idx) => (
                <div key={idx} className="grid grid-cols-7 gap-4 px-6 py-5 border-b border-slate-100 items-center hover:bg-slate-50/50 transition-colors animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="col-span-2 font-mono text-sm text-blue-600 truncate pr-4" title={tx.tx_hash}>{truncate(tx.tx_hash)}</div>
                  <div className="font-mono text-sm text-slate-500">{tx.block_number}</div>
                  <div className="font-mono text-sm text-blue-600 truncate pr-4" title={tx.from_address}>{truncate(tx.from_address)}</div>
                  <div className="font-mono text-sm text-blue-600 truncate pr-4" title={tx.to_address}>{truncate(tx.to_address)}</div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${tx.status === 'SETTLED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                      {tx.status === 'SETTLED' ? 'Settled' : 'Validating'}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500">{formatDate(tx.timestamp)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
