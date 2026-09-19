# Future Finance — AI for Good (Backend)

Python FastAPI backend providing:
1. **L2 Micro-Remittance FX & Liquidity Comparison Router** (`/api/remittance/route`)
2. **AI Alternative Credit Scoring (TrustScore) & zk-Credit Generator** (`/api/credit/evaluate`, `/api/credit/zk-proof`)
3. **Zero-Connectivity Offline Vault & Edge Guard** (`/api/offline/edge-guard`, `/api/offline/sync`)
4. **Multilingual Inclusion Mentor** (`/api/mentor/chat`)

## 🚀 How to Run Locally

### 1. Prerequisites
- Python 3.11+
- pip

### 2. Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
fastapi dev app/main.py
```

## 💰 ZIRO Quote Engine
The `POST /api/v1/payments/quote` endpoint calculates the expected economics of an international transaction before a user sends money. 
**Disclaimer:** All quotes are non-binding estimates. Not a guaranteed rate or price.

### Example Request
```bash
curl -X POST http://localhost:8000/api/v1/payments/quote \
  -H "Content-Type: application/json" \
  -d '{
    "source_currency": "INR",
    "destination_currency": "USD",
    "amount": "100000.00",
    "recipient": { "type": "WALLET_ADDRESS", "identifier": "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRS" },
    "source_country": "IN",
    "destination_country": "US"
  }'
```

### Data Quality & Simulation
The API responds with data quality indicators for FX rates, Network Fees, and Settlement Time:
- `LIVE`: The data was freshly fetched from the external provider.
- `CACHED`: The data was fetched recently and is served from cache.
- `SIMULATED`: The data uses a static demo fallback (if allowed).

### Calculation & Cost Definitions
- **Mid Market Rate**: FX rate without ZIRO margin.
- **FX Cost**: Cost derived from `FX_MARGIN_BPS` margin applied to the net amount.
- **Platform Fee**: Fixed and percentage-based ZIRO markup.
- **Network Fee**: Network cost in USD converted to source currency.
- **Total Cost**: Sum of FX cost, network fee, and platform fee.
All calculations use strict decimal rounding logic (half-up for costs, down for final amount).
