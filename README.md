# Saathi

Addiction recovery app — Expo/React Native frontend, Express/Prisma backend, and two Python AI services.

## Features

- Onboarding flow to capture addiction type, triggers, frequency, money spent, and goals
- Recovery dashboard with health progress, money saved, and streak tracking
- Distraction games to help skip cravings
- Companion support — link a companion to help the user through recovery
- Location Shield — mark risky places on a map; get notified when you approach one
- AI assistant for personal guidance (Groq/LangGraph chatbot)
- Personalised recovery plan generated and updated by AI (Gemini)
- Rewards and XP system for motivation

## Screen map

```mermaid
flowchart TD
    A[Root Navigator] --> B{Onboarding complete?}
    B -- No --> C[OnboardingStack]
    B -- Yes --> D[MainStack]

    C --> C1[Intro] --> C2[BasicDetails] --> C3[AwarenessContext] --> C4[PatternsImpact] --> C5[Complete]

    D --> D1[HomeDashboard]
    D --> D2[CompanionDashboard]
    D --> D3[Games]
    D --> D4[Rewards]
    D --> D5[Profile]
    D --> D6[Settings]
    D --> D7[Assistant]
    D --> D8[Companion]
    D --> D10[LocationShieldStack]
    D --> D12[PlannerStack]

    D10 --> L1[Intro] --> L2[Permission] --> L3[RiskZones] --> L4[AllSet]
    D12 --> P1[PlannerEntry] --> P2[Assessment] --> P3[LifestyleTriggers] --> P4[AIProcessing] --> P5[PlannerReveal]
```

> Root navigator sends companion-role users to `CompanionDashboard`; patient-role users go to `HomeDashboard`.

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
| PostgreSQL | 14+ | local install or Docker |
| Python | 3.10+ | for AI services |
| Android Studio | latest | for Android emulator |

**Docker shortcut for PostgreSQL** (easiest):
```bash
docker run --name saathi-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=saathi_db \
  -p 5432:5432 -d postgres:15
```

**macOS local install:**
```bash
brew install postgresql && brew services start postgresql && createdb saathi_db
```

---

## 1. Backend

```bash
cd backend
npm ci
```

Create `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saathi_db?schema=public"
PORT=3000
NODE_ENV=development
GROQ_API_KEY="your_groq_api_key"
PLAN_API_URL="http://localhost:8000"
CHATBOT_API_URL="http://localhost:8001"
```

Run migrations and start:
```bash
npm run prisma:generate
npm run prisma:migrate      # creates migration (dev only); use `npx prisma migrate deploy` in CI/prod
npm run seed                # optional: load sample data for testing
npm run dev
```

Useful backend commands:
```bash
npm run prisma:studio       # visual DB browser at http://localhost:5555
npm run build && npm start  # production build
```

Health check: `http://localhost:3000/api/health`

### API endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Server status |
| POST | `/api/users` | Create user → returns `userId` |
| GET | `/api/users/:userId/onboarding` | Get onboarding data |
| PUT | `/api/users/:userId/onboarding` | Update onboarding (call multiple times) |
| POST | `/api/users/:userId/onboarding/complete` | Mark onboarding done |

All responses: `{ success: boolean, data?: any, error?: string }`

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

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot connect to backend` | Check `npm run dev` is running in `backend/` |
| `Port 3000 already in use` | Change `PORT` in `backend/.env` |
| `Database connection failed` | Check `DATABASE_URL` in `backend/.env`; verify PostgreSQL is running |
| `TypeScript / Prisma errors` | Run `npm run prisma:generate` in `backend/` |
| `Android emulator can't reach backend` | Use `http://10.0.2.2:3000/api` not `localhost` |
| `Physical device can't reach backend` | Use your machine's LAN IP, e.g. `http://192.168.x.x:3000/api` |
| `gradlew: Permission denied` | Run `chmod +x frontend/android/gradlew` |
| `Expo shows old env values` | Restart Metro after editing `frontend/.env` |
| Animated component crashes on Android tap | Don't read JS props (e.g. `selected`) inside `useAnimatedStyle` — use shared values only. See `SelectCard.tsx` and `MultiSelectPill.tsx` for the pattern. |
