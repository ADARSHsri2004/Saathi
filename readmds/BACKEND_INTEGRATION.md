# Saathi Backend Integration Guide

This guide explains how to set up and integrate the Saathi backend with the existing React Native frontend.

## Architecture Overview

```
Frontend (React Native)
    ↓
API Service (`src/services/api.ts`)
    ↓
Express Backend (TS)
    ↓
PostgreSQL Database
```

## Folder Structure

### Backend
```
backend/
├── src/
│   ├── controllers/
│   │   └── onboardingController.ts    # Business logic
│   ├── routes/
│   │   └── index.ts                   # API route definitions
│   ├── types/
│   │   └── index.ts                   # TypeScript type definitions
│   ├── app.ts                         # Express app configuration
│   └── index.ts                       # Server entry point
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── seed.ts                        # Database seeding
├── .env                               # Local environment variables
├── .env.example                       # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

### Frontend Updates
```
frontend/
├── src/
│   ├── services/
│   │   └── api.ts                     # NEW: API client service
│   └── context/
│       └── OnboardingContext.tsx       # UPDATED: Backend integration
```

## Setup Steps

### Step 1: Set Up PostgreSQL Database

#### Windows (Using Docker - Recommended)
```powershell
# Install Docker if not already installed
# Then run:
docker run --name saathi-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=saathi_db -p 5432:5432 -d postgres:15

# Verify it's running:
docker ps
```

#### Windows (Local PostgreSQL Installation)
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install and remember your password
3. Create a database named `saathi_db`
4. Update `.env` with your connection string

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Generate Prisma Client and Run Migrations

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (will create tables)
npm run prisma:migrate
```

When prompted, name the migration "init" (for the first time).

### Step 4: (Optional) Seed the Database

To populate with sample data for testing:

```bash
npm run seed
```

### Step 5: Start Backend Server

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

### Step 6: Update Frontend Configuration

The frontend is already integrated via `src/services/api.ts`. The default API URL is:

```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

**For different environments:**

#### Local Development (Expo)
- Android: Use `http://10.0.2.2:3000/api` (Docker host access)
- iOS: Use `http://localhost:3000/api`
- Web: Use `http://localhost:3000/api`

**To change:** Edit `frontend/src/services/api.ts` line 8

### Step 7: Run Frontend

```bash
cd frontend
npm start
```

Then choose your platform (android, ios, or web).

## Data Flow

### User Creation Flow

1. **BasicDetailsScreen**
   - User enters: `displayName`, `age`
   - Click "Next"
   - Calls: `createUser(displayName, age)`
   - API: `POST /api/users`
   - Backend: Creates User + initial Onboarding record
   - Frontend: Stores `userId` in context

2. **AwarenessContextScreen**
   - User selects: `addictionTypes`, `whenItHappens`, `feelAfter`
   - Data stored in local state

3. **PatternsImpactScreen**
   - User selects: `frequency`, `impactAreas`
   - User enters: `moneySpent`
   - Data stored in local state

4. **IntentionDurationScreen**
   - User selects: `intention`, `duration`
   - Click "Start my journey"
   - Data stored in local state

5. **CompleteScreen** (Automatic)
   - Mounts and automatically:
     - Calls: `saveToBackend()` - Saves all form data
     - Calls: `completeOnboarding()` - Sets completedAt timestamp
   - Backend: Updates Onboarding record with all data

## API Endpoints Reference

### Health Check
```
GET /api/health
Response: { success: true, data: { status: "Server is running" } }
```

### Create User
```
POST /api/users
Body: { displayName: string, age?: number }
Response: {
  success: true,
  data: {
    id: "user_id",
    displayName: "John",
    age: 28,
    createdAt: "2024-01-01T12:00:00Z"
  }
}
```

### Get Onboarding
```
GET /api/users/:userId/onboarding
Response: {
  success: true,
  data: {
    id: "onboarding_id",
    userId: "user_id",
    addictionTypes: ["social_media"],
    whenItHappens: ["stressed"],
    feelAfter: "guilty",
    frequency: "few_times_week",
    moneySpent: "100",
    impactAreas: ["sleep"],
    intention: "reduce",
    duration: "30_days",
    completedAt: "2024-01-01T12:05:00Z"
  }
}
```

### Update Onboarding
```
PUT /api/users/:userId/onboarding
Body: {
  addictionTypes?: [],
  whenItHappens?: [],
  feelAfter?: string,
  frequency?: string,
  moneySpent?: string,
  impactAreas?: [],
  intention?: string,
  duration?: string
}
Response: { success: true, data: { ... } }
```

### Complete Onboarding
```
POST /api/users/:userId/onboarding/complete
Response: { success: true, data: { ... completedAt set ... } }
```

## Debugging

### Check Backend Status
```bash
curl http://localhost:3000/api/health
```

### View Database
```bash
npm run prisma:studio
```

Opens Prisma Studio at `http://localhost:5555` to view/edit data visually.

### Backend Logs
Check the terminal running `npm run dev` for requests and errors.

### Frontend API Errors
The frontend's `OnboardingApi` class logs errors. Check React Native Debugger/console.

## Production Deployment

### Backend Deployment (e.g., Render, Railway, Heroku)

1. Build the project:
   ```bash
   npm run build
   ```

2. Set environment variables on your hosting platform:
   ```
   DATABASE_URL=your_prod_database_url
   NODE_ENV=production
   PORT=3000
   ```

3. Run start command:
   ```bash
   npm run start
   ```

### Frontend Deployment (e.g., Expo Application Services)

Update the API URL before building:
```typescript
const API_BASE_URL = 'https://your-backend-domain.com/api';
```

## Common Issues & Solutions

### 1. Connection Refused (Cannot reach backend)
- Ensure backend is running: `npm run dev`
- Check if port 3000 is available
- For Expo Android: Use `10.0.2.2:3000` instead of `localhost:3000`

### 2. Database Connection Error
- Verify PostgreSQL is running
- Check `.env` DATABASE_URL is correct
- Ensure database exists: `CREATE DATABASE saathi_db;`

### 3. CORS Errors
- Backend has CORS enabled for all origins
- Check browser console for specific error
- Verify API_BASE_URL in frontend is correct

### 4. Migration Errors
- Reset database: `npm run prisma:migrate:reset` (dev only)
- Check Prisma schema syntax in `prisma/schema.prisma`

### 5. Seed Fails
- Ensure migrations ran first: `npm run prisma:migrate`
- Check database connection
- Seed is optional; skip if it fails

## Monitoring Data

### Recent Users Created
```bash
npm run prisma:studio
# Go to User table, sort by createdAt descending
```

### Completed Onboardings
```bash
npm run prisma:studio
# Go to Onboarding table, filter by completedAt IS NOT NULL
```

## Next Steps

1. **Add Authentication**: Implement JWT or session-based auth
2. **Add Reminders**: Build reminder/notification system
3. **Add Analytics**: Track user progress over time
4. **Add Data Export**: Allow users to export their data
5. **Add Home Screen**: Create post-onboarding home screen

## Support

For issues or questions:
1. Check logs in backend terminal
2. Use Prisma Studio to inspect data
3. Test API endpoints with curl or Postman
4. Check frontend console for API errors
