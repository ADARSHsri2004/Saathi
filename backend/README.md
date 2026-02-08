# Saathi Backend API

A TypeScript-based Express.js backend API for the Saathi addiction awareness & recovery application.

## Features

- **User Management**: Create users with basic details (name, age)
- **Onboarding System**: Collect comprehensive addiction awareness data
- **Database**: PostgreSQL with Prisma ORM
- **Type Safety**: Full TypeScript implementation
- **API**: RESTful endpoints for frontend integration

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Additional**: CORS, Body Parser

## Setup Instructions

### 1. Prerequisites

- Node.js (v16+)
- PostgreSQL (v12+)
- npm or yarn

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE saathi_db;
```

Update the `.env` file with your database connection string:

```
DATABASE_URL="postgresql://user:password@localhost:5432/saathi_db?schema=public"
```

### 4. Run Migrations

```bash
npm run prisma:migrate
```

Name the migration something descriptive like "init" for the first migration.

### 5. (Optional) Seed Database

```bash
npm run seed
```

This creates a sample user with onboarding data for testing.

### 6. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
- **GET** `/api/health`
  - Returns server status

### User Management
- **POST** `/api/users`
  - Create a new user
  - Body: `{ displayName: string, age?: number }`
  - Returns: User ID and basic info

### Onboarding
- **GET** `/api/users/:userId/onboarding`
  - Get user's onboarding status
  - Returns: Complete onboarding data

- **PUT** `/api/users/:userId/onboarding`
  - Update onboarding data (can be called multiple times)
  - Body: Any combination of onboarding fields
  - Returns: Updated onboarding data

- **POST** `/api/users/:userId/onboarding/complete`
  - Mark onboarding as completed
  - Returns: Final onboarding data with completion timestamp

## Data Structure

### User Model
```typescript
{
  id: string
  displayName: string
  age?: number
  createdAt: Date
  updatedAt: Date
}
```

### Onboarding Model
```typescript
{
  id: string
  userId: string
  addictionTypes: string[] // e.g., ['social_media', 'gaming']
  whenItHappens: string[] // e.g., ['stressed', 'bored']
  feelAfter: string // e.g., 'guilty'
  frequency: string // e.g., 'few_times_week'
  moneySpent: string
  impactAreas: string[] // e.g., ['sleep', 'focus']
  intention: string // e.g., 'reduce'
  duration: string // e.g., '30_days'
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

## Prisma Studio

View and manage database data visually:

```bash
npm run prisma:studio
```

Opens Prisma Studio at `http://localhost:5555`

## Build & Production

Build the project:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

## Integration with Frontend

Update your frontend API service to point to the backend:

```typescript
const API_URL = 'http://localhost:3000/api';
```

Example flow:
1. User enters name → POST `/api/users`
2. Get userId from response
3. As user progresses → PUT `/api/users/:userId/onboarding`
4. On completion → POST `/api/users/:userId/onboarding/complete`

## File Structure

```
backend/
├── src/
│   ├── controllers/       # Business logic
│   ├── routes/           # API routes
│   ├── types/            # TypeScript types
│   ├── app.ts            # Express app configuration
│   └── index.ts          # Server entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── .env                  # Environment variables
├── .env.example          # Example env template
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## Common Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm run start

# Database migrations
npm run prisma:migrate

# View database
npm run prisma:studio

# Seed data
npm run seed
```

## Notes

- The backend uses CORS to allow requests from the frontend
- Database arrays are stored as native PostgreSQL arrays
- All timestamps are in ISO format
- Error responses follow a consistent format with `success` flag
