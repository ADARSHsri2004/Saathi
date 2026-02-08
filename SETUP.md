# Saathi - Complete Setup Guide

This guide covers the complete setup of both the frontend and backend for the Saathi application.

## Overview

Saathi is a React Native mobile app (with Expo) that helps users understand and manage addiction. It consists of:

- **Frontend**: React Native app using Expo
- **Backend**: Express.js API with TypeScript
- **Database**: PostgreSQL with Prisma ORM

## Project Structure

```
Saathi/
├── frontend/                 # React Native mobile app
│   ├── src/
│   │   ├── screens/         # Onboarding screens
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # State management with backend integration
│   │   ├── services/        # API client
│   │   ├── navigation/      # Navigation setup
│   │   └── theme/           # Design tokens
│   ├── package.json
│   └── tsconfig.json
├── backend/                  # Express API
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API endpoints
│   │   ├── types/           # TypeScript types
│   │   ├── app.ts           # Express setup
│   │   └── index.ts         # Server entry
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Sample data
│   ├── package.json
│   └── .env                 # Database credentials
├── BACKEND_INTEGRATION.md    # Backend integration guide
├── SETUP.md                  # This file
└── README.md                 # Project overview
```

## Prerequisites

Before starting, install:

- **Node.js** v16+ ([Download](https://nodejs.org))
- **npm** (comes with Node.js)
- **PostgreSQL** v12+ ([Download](https://www.postgresql.org/download))
  - OR **Docker** ([Download](https://www.docker.com)) for containerized PostgreSQL
- **Git** (optional, for version control)

### Verify Installation

```bash
node --version    # Should be v16+
npm --version     # Should be v8+
```

## Step 1: Set Up PostgreSQL Database

### Option A: Using Docker (Recommended - Easier)

```bash
# Create and start PostgreSQL container
docker run --name saathi-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=saathi_db \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps

# If you need to stop it later:
docker stop saathi-postgres
docker start saathi-postgres

# To delete it:
docker rm -f saathi-postgres
```

### Option B: Local PostgreSQL Installation

1. **Windows**:
   - Download PostgreSQL installer from https://www.postgresql.org/download/windows/
   - Run installer and note your password
   - Create database: `CREATE DATABASE saathi_db;`

2. **macOS**:
   ```bash
   brew install postgresql
   brew services start postgresql
   createdb saathi_db
   ```

3. **Linux (Ubuntu/Debian)**:
   ```bash
   sudo apt-get install postgresql postgresql-contrib
   sudo -u postgres createdb saathi_db
   ```

### Verify Database

```bash
# Using psql (PostgreSQL CLI)
psql -U postgres -d saathi_db -c "SELECT version();"
```

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Install Dependencies

```bash
npm install
```

### 2.3 Configure Environment

Create `.env` file (if not exists):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saathi_db?schema=public"
PORT=3000
NODE_ENV=development
```

**For Docker PostgreSQL**: Use the connection string above (default credentials: postgres/postgres)

**For local PostgreSQL**: Update username and password to match your installation

### 2.4 Initialize Database

```bash
# Generate Prisma client
npm run prisma:generate

# Create database tables (run migrations)
npm run prisma:migrate
```

When prompted for migration name, type: `init`

### 2.5 (Optional) Seed Sample Data

```bash
npm run seed
```

This creates a sample user with complete onboarding data for testing.

### 2.6 Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Saathi Backend Server running on http://localhost:3000
📝 Environment: development
📚 API Documentation:
   - POST   /api/users - Create new user
   - GET    /api/users/:userId/onboarding - Get onboarding status
   - PUT    /api/users/:userId/onboarding - Update onboarding
   - POST   /api/users/:userId/onboarding/complete - Complete onboarding
   - GET    /api/health - Health check
```

**Keep this terminal running!** The backend must be running for the frontend to work.

### 2.7 Test Backend

In a new terminal:

```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{"success":true,"data":{"status":"Server is running"}}
```

## Step 3: Frontend Setup

### 3.1 Open New Terminal

Open a new terminal/command prompt window.

### 3.2 Navigate to Frontend

```bash
cd frontend
```

### 3.3 Install Dependencies

```bash
npm install
```

### 3.4 Verify Backend URL

The frontend expects the backend at `http://localhost:3000/api`.

Check `frontend/src/services/api.ts` line 8:

```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

**If using different environment:**

- **Expo Android (Emulator)**: Change to `http://10.0.2.2:3000/api`
- **iOS Simulator**: Keep `http://localhost:3000/api`
- **Physical Device**: Use your machine's IP address, e.g., `http://192.168.x.x:3000/api`

### 3.5 Start Expo

```bash
npm start
```

You should see:
```
> Expo CLI starting in development mode...
›   Local:        exp://127.0.0.1:19000
›   use r │ open browser and scan QR to connect
›   Tunneled:     (your-device).expo.dev
›   Press j │ to open debugger
›   Press w │ open web
›   press a │ open Android
›   Press i │ open iOS
```

## Step 4: Run the App

Choose how to run:

### Web Browser (Easiest)
```bash
# In the Expo terminal, press 'w'
Press w
```

Opens browser at `http://localhost:8081`

### Android Emulator
```bash
# In the Expo terminal, press 'a'
Press a
```

Requires Android Studio and emulator setup.

### iOS Simulator (macOS only)
```bash
# In the Expo terminal, press 'i'
Press i
```

Requires Xcode and iOS simulator.

### Physical Device
1. Install Expo Go app from App Store or Play Store
2. In Expo terminal, scan the QR code with your camera
3. Opens in Expo Go app

## Step 5: Test the Flow

### Create User
1. Fill in name: "John Doe"
2. Fill in age: "28"
3. Click "Next"
4. Should move to next screen (wait 2-3 seconds for backend call)

### Complete Onboarding
1. Select addiction types (e.g., "Social media")
2. Select when it happens (e.g., "Bored")
3. Select how you feel (e.g., "Empty")
4. Continue through other screens
5. On final screen, should automatically save to backend

### Verify Data Saved
Open Prisma Studio:

```bash
# In backend directory
npm run prisma:studio
```

Opens `http://localhost:5555` - can see users and onboarding data.

## Development Workflow

### Running Both Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Common Development Tasks

**Build Frontend for Production:**
```bash
cd frontend
npm run build
```

**Build Backend for Production:**
```bash
cd backend
npm run build
```

**Database Migrations:**
```bash
cd backend
npm run prisma:migrate
```

**View Database**:
```bash
cd backend
npm run prisma:studio
```

**Reset Database** (dev only):
```bash
cd backend
npm run prisma:migrate:reset
```

## Troubleshooting

### "Cannot reach backend" / "Network error"

1. **Check backend is running**: 
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Check frontend API URL**: Edit `frontend/src/services/api.ts`

3. **For Android Emulator**: Use `http://10.0.2.2:3000/api` instead of localhost

### "Database connection failed"

1. **Check PostgreSQL is running**: `docker ps` or check PostgreSQL service

2. **Check `.env` DATABASE_URL** is correct

3. **Create database**:
   ```bash
   createdb saathi_db
   ```

### "Migration failed"

1. **Run migrations**:
   ```bash
   npm run prisma:migrate
   ```

2. **Reset database** (dev only):
   ```bash
   npm run prisma:migrate:reset
   ```

### "Port 3000 already in use"

1. **Change port in `.env`**:
   ```env
   PORT=3001
   ```

2. **Update frontend API URL** accordingly

3. **Restart backend**

### "npm install fails"

1. **Clear cache**:
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and reinstall**:
   ```bash
   rm -rf node_modules
   npm install
   ```

## Next Steps

1. **Read Backend Integration Guide**: `BACKEND_INTEGRATION.md`
2. **Read API Documentation**: `backend/API_DOCUMENTATION.md`
3. **Explore Code**: Start in `frontend/src/screens/BasicDetailsScreen.tsx`
4. **View Database**: `npm run prisma:studio` in backend

## Key Files to Know

### Frontend
- `src/context/OnboardingContext.tsx` - State + backend integration
- `src/services/api.ts` - API client
- `src/screens/` - UI screens
- `src/components/` - Reusable components
- `src/theme/` - Design system

### Backend
- `src/index.ts` - Server entry point
- `src/app.ts` - Express configuration
- `src/controllers/onboardingController.ts` - Business logic
- `src/routes/index.ts` - API routes
- `prisma/schema.prisma` - Database schema

## Deployment

### Backend Deployment

See `BACKEND_INTEGRATION.md` "Production Deployment" section.

### Frontend Deployment

See Expo Documentation:
- https://docs.expo.dev/build/setup/
- https://docs.expo.dev/submit/introduction/

## API Reference

See `backend/API_DOCUMENTATION.md` for complete API reference.

Quick: Test endpoints with:
```bash
curl http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Test","age":25}'
```

## Support

- **Frontend Issues**: Check React Native docs
- **Backend Issues**: Check Express.js docs
- **Database Issues**: Check Prisma docs
- **Expo Issues**: Check Expo docs

---

**Setup complete!** You now have a fully functional Saathi app with frontend and backend.
