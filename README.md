# 🌍 Prayas — Future Finance: AI for Good

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.1-f55036?style=flat-square)](https://groq.com/)
[![Gemini](https://img.shields.io/badge/Google-Gemini_1.5-4285F4?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com/)

**An AI-driven, zero-bandwidth, zero-knowledge financial platform designed to bring 1.4 billion unbanked and underserved individuals into the global economy.**

[How It Works](#-how-it-works) · [Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Team](#-team)

</div>

---

## 📌 Project Overview

**Prayas** is an integrated financial platform built around three core pillars to solve the biggest challenges in global financial inclusion: **Faster & Cheaper Remittances**, **Alternative Credit Scoring**, and **Zero-Connectivity Resilience**.

By unifying **L2 stablecoin micro-remittances**, an **AI-powered behavioral credit scoring engine (TrustScore)**, and a **cryptographically signed offline WebCrypto vault**, the platform proves that technology can eliminate high remittance fees, grant collateral-free credit, and operate reliably even in regions with no cellular data connectivity.

---

## 🧠 How It Works

### Pillar 1: L2 Micro-Remittance Engine
```
User selects route (e.g., USD → KES) 
        │
        ▼
Route Optimization Algorithm compares Multi-hop vs Direct L2
        │
        ▼
Gas Abstraction Fee Handler processes micro-fees natively
        │
        ▼
Settles in < 2 seconds for < $0.001 per transaction
```

### Pillar 2: AI TrustScore & zk-Credit Engine
```
Data Inputs: Remittance velocity, peer trust, psychometrics, mobile utility
        │
        ▼
Groq AI (Llama 3.1) evaluates risk profile
        │
        ▼
Generates TrustScore (300 - 850)
        │
        ▼
Zero-Knowledge (zk-Credit) Proof issued (JSON-LD zk-SNARK)
Protects privacy while proving credit readiness
```

### Pillar 3: Zero-Connectivity Cryptographic Vault
```
No Internet Connection Detected
        │
        ▼
WebCrypto generates ECDSA P-256 keys locally in IndexedDB
        │
        ▼
Offline Payload Signer hashes & signs transaction intent
        │
        ▼
Outputs High-Density QR Code or Encrypted SMS String
        │
        ▼
Mesh Relay node scans and settles transaction on-chain later
```

---

## ✨ Features

**L2 FX Liquidity Engine** — Instant settlement (sub-2 seconds) cross-border transfers with gas abstraction and 99.9% cost reduction compared to traditional rails ($0.0008 vs $14.50).

**AI TrustScore Engine** — Groq LLM-powered psychometric and behavioral analysis engine that evaluates remittance velocity, community peer guarantees, and non-traditional data to generate a fair credit score.

**Zero-Knowledge (zk-Credit) Credentials** — Cryptographically verifiable badges proving loan eligibility without disclosing sensitive personal or bank records.

**Offline WebCrypto Signer** — 100% offline transaction signing using browser WebCrypto API and IndexedDB. Outputs dense vector QR codes and base64 SMS strings for mesh network relays.

**Multilingual AI Inclusion Assistant** — Sub-second Groq Llama 3.1 streaming chatbot that simplifies complex financial terms (e.g., APR) into easy-to-understand metaphors.

**Edge AI Double-Spend Guard** — On-device payload validation powered by Google GenAI (Gemini 1.5 Flash) to flag nonce reuse and double-spend risks before syncing.

**Premium Light Theme UI** — A clean, crisp design aesthetic using pure whites, Emerald (`#059669`), and Sapphire Blue (`#2563EB`) with Framer Motion transitions, ensuring maximum readability in outdoor environments.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript 5.x, Python 3.11+ |
| **Styling & UI** | Tailwind CSS v4, Framer Motion 12, Lucide React |
| **State Management** | Zustand 5 |
| **Backend API** | FastAPI, Pydantic v2, Uvicorn |
| **AI Inference Engine** | Groq LPU (Llama 3.1 / 3.3) |
| **AI Vision & Edge Risk** | Google GenAI SDK (Gemini 1.5 Flash) |
| **Database & Auth** | Firebase Admin, Cloud Firestore, IndexedDB (Offline Vault) |
| **Blockchain / Crypto** | Polygon L2 / Stellar simulation, WebCrypto API (ECDSA) |

---

## 📁 Repository Structure

```
Prayas/
├── Ziro/                  # Next.js 16 + React 19 + Tailwind CSS Frontend
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

## ⚡ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Python](https://www.python.org/) 3.11+

### 1. Frontend (Next.js)

```bash
cd Ziro
npm install
npm run dev
```
Runs the frontend at [http://localhost:3000](http://localhost:3000)

### 2. Backend (FastAPI)

Open a new terminal window:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Server: [http://localhost:8000](http://localhost:8000)
- Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

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

---

## 👤 Team

- **Parteek Garg** ([GitHub](https://github.com/parteek1907))
- **Nipun Dhiman** ([GitHub](https://github.com/nipunn-git))
- **Darsh Ohri** ([GitHub](https://github.com/darshohri))
- **Aditya Tanwar** ([GitHub](https://github.com/adityaa6060))

---

<div align="center">

Built with Next.js, FastAPI, and AI for a more inclusive future.

⭐ Star this repo if you found it useful!

</div>
