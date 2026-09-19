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
