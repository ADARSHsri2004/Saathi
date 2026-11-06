# Saathi

Addiction recovery app — Expo/React Native frontend, Express/Prisma backend, and two Python AI services.

## Project layout

```
frontend/                  Expo app (React Native + Android)
backend/                   Express API + PostgreSQL via Prisma
chatbot/                   FastAPI chatbot (LangGraph + Groq)
Personalised_plan_model/   FastAPI recovery plan service (Gemini)
```

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ | |
| npm | 9+ | |
| PostgreSQL | 14+ | running locally or via Docker |
| Python | 3.10+ | for AI services |
| Android Studio | latest | for Android emulator |

---

## 1. Backend

```bash
cd backend
npm ci
```

Create `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/saathi_db?schema=public"
PORT=3000
NODE_ENV=development
GROQ_API_KEY="your_groq_api_key"
PLAN_API_URL="http://localhost:8000"
```

Run migrations and start:
```bash
npx prisma migrate deploy
npm run prisma:generate
npm run dev
```

Health check: `http://localhost:3000/api/health`

---

## 2. Frontend

```bash
cd frontend
npm ci
```

Create `frontend/.env`:
```env
# Android emulator
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000/api

# Physical device — replace with your machine's LAN IP
# EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:3000/api
```

Make the Gradle wrapper executable (once after clone):
```bash
chmod +x android/gradlew
```

Run:
```bash
npm start            # Expo dev server (scan QR with Expo Go)
npm run android      # build and run on emulator/device
npm run ios          # iOS simulator (Mac only)
npm run web          # browser
```

> First Android build takes several minutes. Keep the Metro terminal open. If using Android Studio's Run button, start Metro separately with `npm start`.

---

## 3. Chatbot service (optional)

Uses Groq + LangGraph. Required for the in-app chat feature.

```bash
cd chatbot
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `chatbot/.env`:
```env
GROQ_API_KEY="your_groq_api_key"
```

Start on port 8001:
```bash
uvicorn main:app --reload --port 8001
```

Then add to `backend/.env`:
```env
CHATBOT_API_URL=http://localhost:8001
```

---

## 4. Personalised Plan Model (optional)

Uses Google Gemini. Required for the AI recovery plan feature.

```bash
cd Personalised_plan_model
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `Personalised_plan_model/.env`:
```env
GOOGLE_API_KEY="your_google_api_key"
```

Start on port 8000:
```bash
uvicorn plan_main:app --reload --port 8000
```

The backend already points to `http://localhost:8000` by default.

---

## Running everything

Open four terminals:

| Terminal | Command |
|----------|---------|
| 1 | `cd backend && npm run dev` |
| 2 | `cd frontend && npm start` |
| 3 | `cd chatbot && uvicorn main:app --reload --port 8001` |
| 4 | `cd Personalised_plan_model && uvicorn plan_main:app --reload --port 8000` |

Then `npm run android` in a fifth terminal (or use Android Studio).

---

## Environment files summary

| File | Required keys |
|------|--------------|
| `backend/.env` | `DATABASE_URL`, `PORT`, `NODE_ENV`, `GROQ_API_KEY`, `PLAN_API_URL`, `CHATBOT_API_URL` |
| `frontend/.env` | `EXPO_PUBLIC_API_BASE_URL` |
| `chatbot/.env` | `GROQ_API_KEY` |
| `Personalised_plan_model/.env` | `GOOGLE_API_KEY` |

Never commit `.env` files — they are in `.gitignore`.
