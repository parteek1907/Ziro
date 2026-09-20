"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { useAuth } from "@/lib/AuthContext"
import { evaluateTrustScore } from "@/lib/api"
import type { TrustScoreResponse } from "@/lib/api"

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
  { id: "tx-1",  type: "Transfer",   to: "Amara",           route: "USD", amount: "-$8,400.00",  status: "Completed", time: "2 hours ago",   ref: "ZR-7839" },
  { id: "tx-2",  type: "Transfer",   to: "Darsh",           route: "USD", amount: "-$1,200.00",  status: "Completed", time: "1 day ago",     ref: "ZR-7838" },
  { id: "tx-3",  type: "Transfer",   to: "Darsh",           route: "USD", amount: "-$4,500.00",  status: "Completed", time: "3 days ago",    ref: "ZR-7837" },
]

interface FinanceContextType {
  totalBalance: number
  vaultBalance: number
  cardBalance: number
  transactions: Transaction[]
  deductBalance: (amountInUSD: number, sourceId?: string) => void
  addTransaction: (tx: Transaction) => void
  trustScore: TrustScoreResponse | null
  loadingTrust: boolean
  trustError: boolean
  fetchTrustScore: () => Promise<void>
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [vaultBalance, setVaultBalance] = useState<number>(42504.80)
  const [cardBalance, setCardBalance] = useState<number>(12400.00)
  const totalBalance = vaultBalance + cardBalance
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [isLoaded, setIsLoaded] = useState(false)
  const { user } = useAuth()
  
  const [trustScore, setTrustScore] = useState<TrustScoreResponse | null>(null)
  const [loadingTrust, setLoadingTrust] = useState(true)
  const [trustError, setTrustError] = useState(false)

  const fetchTrustScore = useCallback(async () => {
    const txCount = transactions.length;
    const paymentConsistency = Math.min(100, 50 + txCount * 5);
    const transactionHistory = Math.min(100, 40 + txCount * 10);
    const communityTrust = 92;
    const score = Math.min(850, 600 + txCount * 15);
    let grade = "Poor";
    if (score >= 750) grade = "Excellent";
    else if (score >= 700) grade = "Good";
    else if (score >= 650) grade = "Fair";

    const fallbackData: TrustScoreResponse = {
      trust_score: score,
      grade: grade,
      score_breakdown: { payment_consistency: paymentConsistency, transaction_history: transactionHistory, community_trust: communityTrust },
      recommendation: `Based on your ${txCount} recent transfers, your score is ${grade}. Keep maintaining consistent payment behavior to improve it further.`,
    };

    // We calculate TrustScore locally on the frontend in realtime based on transfers
    // to ensure it works accurately on Vercel without requiring the Python backend.
    setLoadingTrust(true)
    setTrustError(false)
    
    // Simulate a tiny network delay for the UI skeleton
    setTimeout(() => {
      setTrustScore(fallbackData)
      setLoadingTrust(false)
    }, 400)
  }, [transactions.length])

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchTrustScore()
    })
  }, [fetchTrustScore])

  // Load from local storage on mount
  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const storedTotal = localStorage.getItem("ziro_totalBalance_v2")
        const storedVault = localStorage.getItem("ziro_vaultBalance_v2")
        const storedCard = localStorage.getItem("ziro_cardBalance_v2")

        if (storedVault && storedCard) {
          setVaultBalance(parseFloat(storedVault))
          setCardBalance(parseFloat(storedCard))
        } else if (storedTotal && !storedVault) {
          // Migration from old schema
          const total = parseFloat(storedTotal)
          setCardBalance(12400)
          setVaultBalance(Math.max(0, total - 12400))
        }

        const storedTx = localStorage.getItem("ziro_transactions_v2")
        if (storedTx) setTransactions(JSON.parse(storedTx))
      } catch (e) {
        console.error("Failed to load finance state", e)
      } finally {
        setIsLoaded(true)
      }
    });
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ziro_vaultBalance_v2", vaultBalance.toString())
      localStorage.setItem("ziro_cardBalance_v2", cardBalance.toString())
      localStorage.setItem("ziro_totalBalance_v2", totalBalance.toString())
      localStorage.setItem("ziro_transactions_v2", JSON.stringify(transactions))
    }
  }, [vaultBalance, cardBalance, totalBalance, transactions, isLoaded])

  const deductBalance = (amountInUSD: number, sourceId: string = "vault") => {
    if (sourceId === "card") {
      setCardBalance((prev) => Math.max(0, prev - amountInUSD))
    } else {
      setVaultBalance((prev) => Math.max(0, prev - amountInUSD))
    }
  }

  const addTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev])
  }

  return (
    <FinanceContext.Provider value={{ totalBalance, vaultBalance, cardBalance, transactions, deductBalance, addTransaction, trustScore, loadingTrust, trustError, fetchTrustScore }}>
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
