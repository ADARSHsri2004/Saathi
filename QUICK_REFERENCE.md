# Quick Reference Guide

Fast navigation for developers working with Saathi.

## Project Directories

```
frontend/   - React Native mobile app (Expo)
backend/    - Express.js API with PostgreSQL
```

## Getting Started (2 Minutes)

### Start Backend
```bash
cd backend
npm install
npm run prisma:migrate
npm run dev
```

### Start Frontend (New Terminal)
```bash
cd frontend
npm install
npm start
# Press 'w' for web, 'a' for Android, 'i' for iOS
```

## Essential Commands

### Backend
```bash
npm run dev                # Development server (hot reload)
npm run build              # Build for production
npm run start              # Run production build
npm run prisma:migrate     # Create/update database
npm run prisma:studio      # View database GUI
npm run prisma:generate    # Generate Prisma client
npm run seed               # Load sample data
```

### Frontend
```bash
npm start                  # Start Expo
npm run build              # Build for production
npm run android/ios        # Build for specific platform
npm run web                # Run in browser
```

## Common Workflows

### Add a New API Endpoint

1. **Update Prisma Schema** (`backend/prisma/schema.prisma`)
   ```prisma
   model YourModel {
     id String @id @default(cuid())
     // Add fields
   }
   ```

2. **Create Migration**
   ```bash
   cd backend
   npm run prisma:migrate
   ```

3. **Add Controller Method** (`backend/src/controllers/onboardingController.ts`)
   ```typescript
   static async yourMethod(req, res) {
     // Implementation
   }
   ```

4. **Add Route** (`backend/src/routes/index.ts`)
   ```typescript
   router.post('/your-endpoint', OnboardingController.yourMethod);
   ```

5. **Update Frontend API** (`frontend/src/services/api.ts`)
   ```typescript
   static async yourMethod() {
     // Implementation
   }
   ```

6. **Use in Frontend**
   ```typescript
   import { OnboardingApi } from '../services/api';
   await OnboardingApi.yourMethod();
   ```

### Test an API Endpoint

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"displayName":"John","age":28}'
```

### Debug Database

```bash
cd backend
npm run prisma:studio

# Then visit http://localhost:5555
```

### View Real-Time Logs

Check the terminal running the backend - all HTTP requests are logged.

## File Locations Quick Map

| Need | File |
|------|------|
| API Endpoints | `backend/src/routes/index.ts` |
| API Logic | `backend/src/controllers/onboardingController.ts` |
| Database Schema | `backend/prisma/schema.prisma` |
| Types | `backend/src/types/index.ts` or `frontend/src/context/OnboardingContext.tsx` |
| Frontend API Client | `frontend/src/services/api.ts` |
| Frontend State | `frontend/src/context/OnboardingContext.tsx` |
| Screens | `frontend/src/screens/*.tsx` |
| Components | `frontend/src/components/*.tsx` |
| Theme | `frontend/src/theme/*.ts` |
| DB Config | `backend/.env` |
| Backend Config | `backend/src/app.ts` |

## API Quick Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/users` | Create user |
| GET | `/api/users/:userId/onboarding` | Get onboarding |
| PUT | `/api/users/:userId/onboarding` | Update onboarding |
| POST | `/api/users/:userId/onboarding/complete` | Complete onboarding |
| GET | `/api/health` | Check server |

## Common Issues Quick Fixes

| Issue | Fix |
|-------|-----|
| "Cannot reach backend" | Ensure `npm run dev` running in backend folder |
| "Port 3000 in use" | Change `PORT` in `backend/.env` |
| "Database connection failed" | Check `DATABASE_URL` in `backend/.env` |
| "TypeScript errors" | Run `npm run prisma:generate` in backend |
| "Expo can't connect" | Check API URL in `frontend/src/services/api.ts` |
| "Android emulator can't reach backend" | Use `http://10.0.2.2:3000/api` instead of `localhost` |

## Development Cycle

1. **Make changes** to code
2. **Backend auto-reloads** from ts-node
3. **Frontend auto-reloads** from Expo
4. **Test** in app
5. **Check database** with Prisma Studio if needed

No manual restarts needed!

## Type Safety Checklist

- [ ] Backend types defined in `backend/src/types/index.ts`
- [ ] Frontend matches `OnboardingContext.tsx` types
- [ ] Database schema updated in `prisma/schema.prisma`
- [ ] Migration run: `npm run prisma:migrate`
- [ ] Prisma client regenerated: `npm run prisma:generate`

## Performance Tips

- Use Prisma Studio instead of writing SQL
- Enable React Native debugger from Expo menu
- Check backend logs in terminal for slow queries
- Use `npm run seed` to load test data at once

## Deployment Checklist

**Backend:**
- [ ] Build: `npm run build`
- [ ] Set `DATABASE_URL` environment variable
- [ ] Set `NODE_ENV=production`
- [ ] Run: `npm run start`

**Frontend:**
- [ ] Update API URL to production backend
- [ ] Build: `eas build`
- [ ] Submit: `eas submit`

## Documentation Links

- Setup: `SETUP.md`
- Backend Integration: `BACKEND_INTEGRATION.md`
- Implementation Details: `IMPLEMENTATION_SUMMARY.md`
- API Reference: `backend/API_DOCUMENTATION.md`
- Backend README: `backend/README.md`

## Useful Tools

- **Prisma Studio**: `npm run prisma:studio`
- **Expo Web**: Press 'w' in expo terminal
- **Expo Go App**: Scan QR code from expo terminal
- **React DevTools**: Available in Expo debugger
- **Network Inspector**: Available in Expo debugger

## Database Connection String Template

```
postgresql://username:password@localhost:5432/saathi_db?schema=public
```

## TypeScript Compilation

Both frontend and backend have full TypeScript support:
- Strict mode enabled
- Type checking on build
- IDE autocomplete enabled

## Frontend State Management

All onboarding state in: `frontend/src/context/OnboardingContext.tsx`
- Local state stored in context
- Backend integration via `OnboardingApi`
- Auto-save on completion screen

## Testing Checklist

- [ ] Backend running and healthy
- [ ] Database connected and schema migrated
- [ ] Frontend can create users
- [ ] Form data persists on navigation
- [ ] Data saved to database on completion
- [ ] Prisma Studio shows saved data

---

**For detailed docs, see SETUP.md and BACKEND_INTEGRATION.md**
