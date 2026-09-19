# Future Finance — AI for Good

Platform powering gasless L2 remittances, AI-driven alternative credit scoring (TrustScore), and zero-connectivity offline WebCrypto vault.

---

## 📁 Repository Structure

```text
Prayas/
├── Ziro/        # Next.js 16 + React 19 + Tailwind CSS Frontend
│   ├── src/
│   │   ├── app/           # App router pages & styles
│   │   └── components/    # Reusable UI components (Navbar, Footer, Widgets)
│   └── package.json
│
├── backend/               # Python 3.11+ FastAPI Backend
│   ├── app/
│   │   ├── routers/       # Modular endpoints (remittance, credit, offline, mentor)
│   │   ├── schemas.py     # Pydantic v2 data models
│   │   └── main.py        # FastAPI application entry point
│   └── requirements.txt
│
├── PRD.md                 # Product Requirement Document
└── package.json           # Root workspace script runner
```

---

## ⚡ Quick Start: How to Run Locally

### 1. Frontend (Next.js)
Open a terminal in the root folder:
```powershell
cd Ziro
npm run dev
```
> Or directly from root: `npm run dev`
- **URL**: [http://localhost:3000](http://localhost:3000)

---

### 2. Backend (FastAPI)
Open a second terminal:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- **API Server**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 🔌 Backend API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/remittance/route` | `POST` | Compare traditional remittance vs. L2 instant router |
| `/api/credit/evaluate` | `POST` | AI TrustScore calculation across non-FICO data |
| `/api/credit/zk-proof` | `POST` | Zero-Knowledge credential proof generator |
| `/api/offline/edge-guard` | `POST` | Pre-validation & double-spend check for offline payloads |
| `/api/offline/sync` | `POST` | Batch settlement for mesh/cellular relay |
| `/api/mentor/chat` | `POST` | Multilingual inclusion assistant with everyday analogies |
