"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

export type Transaction = {
  id: string
  type: string
  to: string
  route: string
  amount: string
  status: string
  time: string
  ref: string
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "tx-1",  type: "Settlement", to: "Maria Garcia",   route: "USD → MXN", amount: "-$450.00",    status: "Completed", time: "12 mins ago",   ref: "ZR-7842" },
  { id: "tx-2",  type: "Transfer",   to: "James Wilson",    route: "USD → INR", amount: "+$2,000.00",  status: "Completed", time: "34 mins ago",   ref: "ZR-7841" },
  { id: "tx-3",  type: "Payment",    to: "L2 Wallet",       route: "USD → KES", amount: "-$124.50",    status: "Pending",   time: "1 hour ago",    ref: "ZR-7840" },
  { id: "tx-4",  type: "Transfer",   to: "Amara",           route: "USD → KES", amount: "-$8,400.00",  status: "Completed", time: "2 hours ago",   ref: "ZR-7839" },
  { id: "tx-5",  type: "Settlement", to: "Cloud Infra LLC", route: "USD → USD", amount: "-$320.00",    status: "Completed", time: "5 hours ago",   ref: "ZR-7838" },
  { id: "tx-6",  type: "Transfer",   to: "Riya Kapoor",     route: "USD → INR", amount: "+$5,000.00",  status: "Completed", time: "1 day ago",     ref: "ZR-7837" },
  { id: "tx-7",  type: "Payment",    to: "Stripe Inc",      route: "USD → USD", amount: "-$99.00",     status: "Completed", time: "1 day ago",     ref: "ZR-7836" },
  { id: "tx-8",  type: "Settlement", to: "0x7a...9b",       route: "ETH → USD", amount: "-$12,000.00", status: "Completed", time: "2 days ago",    ref: "ZR-7835" },
  { id: "tx-9",  type: "Transfer",   to: "Carlos M.",       route: "USD → MXN", amount: "-$750.00",    status: "Failed",    time: "3 days ago",    ref: "ZR-7834" },
  { id: "tx-10", type: "Transfer",   to: "L2 Wallet",       route: "USD → KES", amount: "+$10,000.00", status: "Completed", time: "1 week ago",    ref: "ZR-7833" },
]

interface FinanceContextType {
  totalBalance: number
  transactions: Transaction[]
  deductBalance: (amountInUSD: number) => void
  addTransaction: (tx: Transaction) => void
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [totalBalance, setTotalBalance] = useState<number>(54904.80)
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedBalance = localStorage.getItem("ziro_totalBalance")
      if (storedBalance) setTotalBalance(parseFloat(storedBalance))

      const storedTx = localStorage.getItem("ziro_transactions")
      if (storedTx) setTransactions(JSON.parse(storedTx))
    } catch (e) {
      console.error("Failed to load finance state", e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Sync to local storage on changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ziro_totalBalance", totalBalance.toString())
      localStorage.setItem("ziro_transactions", JSON.stringify(transactions))
    }
  }, [totalBalance, transactions, isLoaded])

  const deductBalance = (amountInUSD: number) => {
    setTotalBalance((prev) => Math.max(0, prev - amountInUSD))
  }

  const addTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev])
  }

  return (
    <FinanceContext.Provider value={{ totalBalance, transactions, deductBalance, addTransaction }}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}
