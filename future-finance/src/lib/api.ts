// ============================================================
// Ziro API Client — Centralized typed interface to the backend
// Base URL set via NEXT_PUBLIC_API_URL env var.
// Falls back to http://localhost:8000 for local development.
// ============================================================

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API ${path} failed (${res.status}): ${err}`)
  }
  return res.json() as Promise<T>
}

// ─── Types ──────────────────────────────────────────────────

export type BalanceResponse = {
  wallet_address: string
  chain: string
  asset: string
  balance: number
  formatted: string
}

export type TrustScoreResponse = {
  trust_score: number
  grade: string
  score_breakdown: {
    payment_consistency: number
    transaction_history: number
    community_trust: number
  }
  recommendation: string
}

export type RecipientCheckResponse = {
  status: "SAFE" | "WARNING" | "BLOCKED"
  reason?: string
  similar_contact?: string
}

export type RiskAnalysisResponse = {
  risk_level: "LOW" | "MEDIUM" | "HIGH"
  confidence: number
  warnings: string[]
  recommendation: string
}

export type RouteOption = {
  route: "BLOCKCHAIN" | "SWIFT" | "ACH" | "SEPA" | "INTERNAL"
  estimated_time_seconds: number
  estimated_fee: number
  fee_currency: string
  provider?: string
}

export type CompareRoutesResponse = {
  routes: RouteOption[]
  recommended: string
}

export type MentorMessage = {
  role: "user" | "assistant"
  content: string
}

export type MentorChatResponse = {
  response: string
  language: string
  follow_up_questions?: string[]
}

export type OfflineSyncRequest = {
  transactions: OfflineTransaction[]
  device_id: string
}

export type OfflineTransaction = {
  id: string
  recipient: string
  amount: number
  currency: string
  note?: string
  queued_at: string
}

export type OfflineSyncResponse = {
  synced: number
  failed: number
  results: { id: string; status: string }[]
}

export type WalletConnectRequest = {
  chain: "polygon" | "stellar" | "ethereum"
  wallet_address: string
  user_id: string
}

export type WalletConnectResponse = {
  wallet_id: string
  chain: string
  address: string
  connected_at: string
}

// ─── API Methods ─────────────────────────────────────────────

/** Fetch wallet balance for a given address */
export async function getBalance(
  walletAddress: string,
  chain = "simulation",
  asset = "USDC"
): Promise<BalanceResponse> {
  return request<BalanceResponse>(
    `/api/v1/blockchain/balance/${walletAddress}?chain=${chain}&asset=${asset}`
  )
}

/** Evaluate TrustScore for a user */
export async function evaluateTrustScore(
  userId: string,
  walletAddress?: string
): Promise<TrustScoreResponse> {
  return request<TrustScoreResponse>("/api/credit/evaluate", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, wallet_address: walletAddress }),
  })
}

/** Check if a recipient address is safe */
export async function checkRecipient(
  recipientAddress: string,
  senderUserId: string
): Promise<RecipientCheckResponse> {
  return request<RecipientCheckResponse>("/api/v1/security/check-recipient", {
    method: "POST",
    body: JSON.stringify({
      recipient_address: recipientAddress,
      sender_user_id: senderUserId,
    }),
  })
}

/** Run the AI payment risk firewall */
export async function analyzeRisk(payload: {
  recipient: string
  amount: number
  currency: string
  note: string
  user_id: string
}): Promise<RiskAnalysisResponse> {
  return request<RiskAnalysisResponse>("/api/v1/risk/analyze", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

/** Compare available payment routes */
export async function compareRoutes(payload: {
  amount: number
  currency: string
  destination_country: string
  preference?: "lowest_cost" | "fastest"
}): Promise<CompareRoutesResponse> {
  return request<CompareRoutesResponse>("/api/v1/payments/compare-routes", {
    method: "POST",
    body: JSON.stringify({ preference: "lowest_cost", ...payload }),
  })
}

/** Send a message to the AI Mentor */
export async function chatWithMentor(payload: {
  message: string
  language: string
  history: MentorMessage[]
  user_id: string
}): Promise<MentorChatResponse> {
  return request<MentorChatResponse>("/api/mentor/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

/** Sync queued offline transactions */
export async function syncOfflineTransactions(
  payload: OfflineSyncRequest
): Promise<OfflineSyncResponse> {
  return request<OfflineSyncResponse>("/api/offline/sync", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

/** Connect a blockchain wallet */
export async function connectWallet(
  payload: WalletConnectRequest
): Promise<WalletConnectResponse> {
  return request<WalletConnectResponse>("/api/v1/wallets", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
