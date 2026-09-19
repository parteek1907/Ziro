# ZIRO - Project Context & Architecture

## Overview
ZIRO is an "AI for Good" financial inclusion platform designed for unbanked users. 
It facilitates micro-remittances, privacy-preserving credit scoring (TrustScore), zero-connectivity offline payments (Offline Vault), and features a multilingual AI financial consultant.

## Core Features (Backend Only)
The backend is completely modularized in `backend/app/` and heavily relies on a mock in-memory database (`mock_db.py`) for hackathon demo purposes.
1. **Smart Settlement Engine**: Routes payments via TradFi or DeFi based on cost. (`/api/v1/payments`)
2. **AI Payment Firewall**: Scans recipient addresses and intents to prevent scams. (Integrated into the payment execution lifecycle).
3. **The Human Consultant**: An AI assistant (`/api/v1/consultant`) with a revenue model ($20 fee, $4 platform commission, $1 success fee).
4. **Offline Vault**: Allows zero-connectivity transaction queuing. (`/api/v1/offline`)
5. **TrustScore**: Calculates alternative financial scores without traditional credit history. (`/api/v1/trustscore`)
6. **User Identity/Profile**: Basic auth and financial profile tracking. (`/api/v1/profile`, `/api/v1/users`)
7. **Blockchain Explorer Database UI**: A gorgeous, glassmorphism UI directly served by the backend to view live, encrypted mock transactions. (`/api/v1/explorer`)

## Important Endpoints & Links
- **Local API Base**: `http://127.0.0.1:8000/api/v1`
- **Swagger Documentation**: `http://127.0.0.1:8000/docs`
- **Blockchain Explorer UI (Database)**: `http://127.0.0.1:8000/api/v1/explorer`

## Hard Constraints
- **NO FRONTEND MODIFICATIONS**: The frontend (`frontend/` folder in Next.js) is strictly maintained by the user's teammate. Under no circumstances should backend agents modify frontend files.
- **SECURITY**: The backend uses an in-memory database (`mock_db.py`). No persistent `.db` or `.sqlite` files should be pushed to GitHub (already secured in `.gitignore`).
- **ENCRYPTION**: The Blockchain Explorer UI strictly encrypts/hashes all payment amounts and wallet addresses to ensure privacy.
