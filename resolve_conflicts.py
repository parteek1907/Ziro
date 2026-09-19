import os

env_content = """# AI & Cloud API Keys (Optional for local simulated fallback)
GROQ_API_KEY=
GEMINI_API_KEY=
FIREBASE_CREDENTIALS_PATH=

# Server Configuration
PROJECT_NAME="ZIRO Backend"
API_V1_STR="/api/v1"
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
"""
with open("d:/PROJECTS/Prayas/backend/.env.example", "w", encoding="utf-8") as f:
    f.write(env_content)

readme_content = """# Future Finance — AI for Good (Backend)

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
.\\venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
fastapi dev app/main.py
```
"""
with open("d:/PROJECTS/Prayas/backend/README.md", "w", encoding="utf-8") as f:
    f.write(readme_content)

main_content = """\"\"\"Main FastAPI Application Entry Point for Future Finance.\"\"\"
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.exceptions import setup_exception_handlers
from app.api.v1.router import api_router

from app.routers import remittance, credit, offline, mentor

# Load environment variables
load_dotenv()
setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Backend infrastructure powering L2 micro-remittances, AI TrustScore alternative credit evaluation, "
        "zero-connectivity cryptographic offline signing, and multilingual financial inclusion."
    ),
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

setup_exception_handlers(app)

app.include_router(api_router, prefix=settings.API_V1_STR)

# Include Modular Feature Routers
app.include_router(remittance.router)
app.include_router(credit.router)
app.include_router(offline.router)
app.include_router(mentor.router)

@app.get("/")
async def root():
    return {
        "project": "Future Finance — AI for Good",
        "status": "online",
        "documentation": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "future-finance-backend"}
"""
with open("d:/PROJECTS/Prayas/backend/app/main.py", "w", encoding="utf-8") as f:
    f.write(main_content)

req_content = """fastapi[standard]>=0.115.0
pydantic>=2.8.0
pydantic-settings>=2.0.0
python-dotenv>=1.0.0
pytest>=8.0.0
pytest-asyncio>=0.23.0
httpx>=0.27.0
"""
with open("d:/PROJECTS/Prayas/backend/requirements.txt", "w", encoding="utf-8") as f:
    f.write(req_content)
