from fastapi import APIRouter
from fastapi.responses import HTMLResponse
from app.db.mock_db import mock_db
from pydantic import BaseModel
from typing import List
import hashlib

router = APIRouter()

class ExplorerTransaction(BaseModel):
    tx_hash: str
    block_number: int
    from_address: str
    to_address: str
    amount: float
    currency: str
    status: str
    timestamp: str

def encrypt_hash(address: str) -> str:
    """Simulates an encrypted blockchain hash for the UI."""
    return "0x" + hashlib.sha256(address.encode()).hexdigest()[:40]

@router.get("/transactions", response_model=List[ExplorerTransaction])
async def get_explorer_transactions():
    """
    Returns a mock blockchain explorer view of all transactions.
    Addresses are hashed to simulate privacy/encryption.
    """
    transactions = []
    block_counter = 14502000
    
    # Sort payments by created_at descending (newest first)
    sorted_payments = sorted(mock_db.payments.values(), key=lambda p: p.created_at, reverse=True)
    
    for p in sorted_payments:
        tx_hash = p.blockchain_tx_hash if p.blockchain_tx_hash else f"0x{hashlib.sha256(p.payment_id.encode()).hexdigest()[:64]}"
        
        transactions.append(
            ExplorerTransaction(
                tx_hash=tx_hash,
                block_number=block_counter,
                from_address=encrypt_hash(p.sender_address),
                to_address=encrypt_hash(p.recipient_address),
                amount=p.amount,
                currency=p.currency,
                status=p.state.value,
                timestamp=p.created_at
            )
        )
        block_counter -= 1
        
    return transactions

@router.get("", response_class=HTMLResponse)
async def get_explorer_ui():
    """Returns a premium, glassmorphism web UI for the blockchain explorer."""
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ziro Explorer | Secure L2 Network</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
        <style>
            :root {
                --bg: #0b0f19;
                --surface: rgba(255, 255, 255, 0.03);
                --border: rgba(255, 255, 255, 0.08);
                --text: #e2e8f0;
                --text-muted: #94a3b8;
                --primary: #3b82f6;
                --primary-glow: rgba(59, 130, 246, 0.5);
                --success: #10b981;
                --pending: #f59e0b;
                --font-sans: 'Inter', sans-serif;
                --font-mono: 'JetBrains Mono', monospace;
            }

            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }

            body {
                background-color: var(--bg);
                color: var(--text);
                font-family: var(--font-sans);
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                background-image: 
                    radial-gradient(circle at 15% 50%, rgba(59, 130, 246, 0.15), transparent 25%),
                    radial-gradient(circle at 85% 30%, rgba(16, 185, 129, 0.1), transparent 25%);
                background-attachment: fixed;
            }

            header {
                padding: 2rem 5%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid var(--border);
                background: rgba(11, 15, 25, 0.7);
                backdrop-filter: blur(12px);
                position: sticky;
                top: 0;
                z-index: 100;
            }

            .logo-container {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .logo-icon {
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, var(--primary), #8b5cf6);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 20px var(--primary-glow);
                animation: pulse 3s infinite alternate;
            }
            
            .logo-icon svg {
                width: 20px;
                height: 20px;
                fill: white;
            }

            @keyframes pulse {
                0% { box-shadow: 0 0 15px var(--primary-glow); transform: scale(1); }
                100% { box-shadow: 0 0 25px rgba(139, 92, 246, 0.6); transform: scale(1.05); }
            }

            h1 {
                font-size: 1.5rem;
                font-weight: 700;
                letter-spacing: -0.5px;
                background: linear-gradient(to right, #fff, #94a3b8);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .network-status {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.875rem;
                font-weight: 500;
                color: var(--success);
                background: rgba(16, 185, 129, 0.1);
                padding: 6px 12px;
                border-radius: 20px;
                border: 1px solid rgba(16, 185, 129, 0.2);
            }

            .dot {
                width: 8px;
                height: 8px;
                background-color: var(--success);
                border-radius: 50%;
                box-shadow: 0 0 8px var(--success);
            }

            main {
                flex: 1;
                padding: 3rem 5%;
                max-width: 1400px;
                margin: 0 auto;
                width: 100%;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
                margin-bottom: 3rem;
            }

            .stat-card {
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 16px;
                padding: 1.5rem;
                backdrop-filter: blur(10px);
                transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
            }

            .stat-card:hover {
                transform: translateY(-5px);
                border-color: rgba(59, 130, 246, 0.4);
                box-shadow: 0 10px 30px -10px rgba(59, 130, 246, 0.2);
            }

            .stat-title {
                font-size: 0.875rem;
                color: var(--text-muted);
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 600;
                margin-bottom: 0.5rem;
            }

            .stat-value {
                font-size: 2rem;
                font-weight: 700;
                color: #fff;
                font-family: var(--font-mono);
            }

            .table-container {
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 16px;
                backdrop-filter: blur(10px);
                overflow: hidden;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }

            .table-header-row {
                display: grid;
                grid-template-columns: 2fr 1fr 2fr 2fr 1fr 1fr 1.5fr;
                padding: 1rem 1.5rem;
                background: rgba(255, 255, 255, 0.02);
                border-bottom: 1px solid var(--border);
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 600;
                color: var(--text-muted);
            }

            #tx-list {
                display: flex;
                flex-direction: column;
            }

            .tx-row {
                display: grid;
                grid-template-columns: 2fr 1fr 2fr 2fr 1fr 1fr 1.5fr;
                padding: 1.25rem 1.5rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                align-items: center;
                transition: background 0.2s ease;
                animation: slideIn 0.5s ease forwards;
                opacity: 0;
            }

            .tx-row:hover {
                background: rgba(255, 255, 255, 0.05);
            }

            .tx-row:last-child {
                border-bottom: none;
            }

            @keyframes slideIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .mono-text {
                font-family: var(--font-mono);
                font-size: 0.875rem;
            }

            .hash {
                color: var(--primary);
                text-decoration: none;
                transition: color 0.2s ease;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                padding-right: 1rem;
            }
            
            .hash:hover {
                color: #60a5fa;
                text-shadow: 0 0 8px rgba(96, 165, 250, 0.4);
            }

            .badge {
                display: inline-flex;
                align-items: center;
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 600;
                letter-spacing: 0.5px;
            }

            .badge.settled {
                background: rgba(16, 185, 129, 0.1);
                color: var(--success);
                border: 1px solid rgba(16, 185, 129, 0.2);
            }

            .badge.pending {
                background: rgba(245, 158, 11, 0.1);
                color: var(--pending);
                border: 1px solid rgba(245, 158, 11, 0.2);
            }

            .loader {
                padding: 4rem;
                text-align: center;
                color: var(--text-muted);
            }

            .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid rgba(255,255,255,0.1);
                border-radius: 50%;
                border-top-color: var(--primary);
                animation: spin 1s ease-in-out infinite;
                margin: 0 auto 1rem;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>
    </head>
    <body>
        <header>
            <div class="logo-container">
                <div class="logo-icon">
                    <svg viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <h1>Ziro L2 Scan</h1>
            </div>
            <div class="network-status">
                <div class="dot"></div>
                Network Secured
            </div>
        </header>

        <main>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-title">Latest Block</div>
                    <div class="stat-value" id="latest-block">--</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Network TPS</div>
                    <div class="stat-value">12,403</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Avg Gas Fee</div>
                    <div class="stat-value">$0.001</div>
                </div>
            </div>

            <div class="table-container">
                <div class="table-header-row">
                    <div>Txn Hash</div>
                    <div>Block</div>
                    <div>From</div>
                    <div>To</div>
                    <div>Value</div>
                    <div>Status</div>
                    <div>Timestamp</div>
                </div>
                <div id="tx-list">
                    <div class="loader">
                        <div class="spinner"></div>
                        Syncing blocks...
                    </div>
                </div>
            </div>
        </main>

        <script>
            function truncate(str) {
                if (str.length <= 16) return str;
                return str.substring(0, 10) + '...' + str.substring(str.length - 6);
            }

            function formatDate(isoString) {
                const date = new Date(isoString);
                return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
            }

            async function fetchTransactions() {
                try {
                    const response = await fetch('/api/v1/explorer/transactions');
                    const data = await response.json();
                    
                    const txList = document.getElementById('tx-list');
                    txList.innerHTML = '';
                    
                    if(data.length > 0) {
                        document.getElementById('latest-block').textContent = data[0].block_number.toLocaleString();
                    }

                    data.forEach((tx, index) => {
                        const row = document.createElement('div');
                        row.className = 'tx-row';
                        row.style.animationDelay = `${index * 0.1}s`;
                        
                        const statusClass = tx.status === 'SETTLED' ? 'settled' : 'pending';
                        const statusText = tx.status === 'SETTLED' ? 'Settled' : 'Validating';

                        row.innerHTML = `
                            <div class="mono-text hash" title="${tx.tx_hash}">${truncate(tx.tx_hash)}</div>
                            <div class="mono-text" style="color: #94a3b8;">${tx.block_number}</div>
                            <div class="mono-text hash" title="${tx.from_address}">${truncate(tx.from_address)}</div>
                            <div class="mono-text hash" title="${tx.to_address}">${truncate(tx.to_address)}</div>
                            <div style="font-weight: 600;">$${tx.amount.toFixed(2)} ${tx.currency}</div>
                            <div><span class="badge ${statusClass}">${statusText}</span></div>
                            <div style="color: #94a3b8; font-size: 0.875rem;">${formatDate(tx.timestamp)}</div>
                        `;
                        txList.appendChild(row);
                    });
                } catch (error) {
                    document.getElementById('tx-list').innerHTML = `
                        <div style="padding: 2rem; text-align: center; color: #ef4444;">
                            Failed to connect to network nodes.
                        </div>
                    `;
                }
            }

            // Initial load
            setTimeout(fetchTransactions, 800);
            
            // Poll every 5 seconds
            setInterval(fetchTransactions, 5000);
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

