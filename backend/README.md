# Future Finance — AI for Good (Backend)

Python FastAPI backend providing:
1. **L2 Micro-Remittance FX & Liquidity Comparison Router** (`/api/remittance/route`)
2. **AI Alternative Credit Scoring (TrustScore) & zk-Credit Generator** (`/api/credit/evaluate`, `/api/credit/zk-proof`)
3. **Zero-Connectivity Offline Vault & Edge Guard** (`/api/offline/edge-guard`, `/api/offline/sync`)
4. **Multilingual Inclusion Mentor** (`/api/mentor/chat`)

---

## 🚀 How to Run Locally

### 1. Prerequisites
- Python 3.11+ (Python 3.14 detected)
- pip

### 2. Setup Virtual Environment (Recommended)
Open a terminal in the `backend` folder:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 3. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 4. Run the Server
```powershell
uvicorn app.main:app --reload --port 8000
```

### 5. Access Interactive API Documentation
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)
