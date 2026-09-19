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
  { id: "tx-1",  type: "Transfer",   to: "Amara",           route: "USD → KES", amount: "-$8,400.00",  status: "Completed", time: "2 hours ago",   ref: "ZR-7839" },
  { id: "tx-2",  type: "Transfer",   to: "Darsh",           route: "USD → INR", amount: "-$1,200.00",  status: "Completed", time: "1 day ago",     ref: "ZR-7838" },
  { id: "tx-3",  type: "Transfer",   to: "Darsh",           route: "USD → INR", amount: "-$4,500.00",  status: "Completed", time: "3 days ago",    ref: "ZR-7837" },
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
