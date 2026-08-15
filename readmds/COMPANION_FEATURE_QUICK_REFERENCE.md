# Companion Feature - Quick Reference

## Changes Made

### Backend
1. ✅ Added `role` field to User model (Prisma schema)
2. ✅ Updated `createUser` to accept & persist role
3. ✅ Added `getPatientDashboard` endpoint in CompanionController
4. ✅ Added route: `GET /companion/patient/:patientId/dashboard`

### Frontend
1. ✅ Added role state to OnboardingContext (`role`, `patientId`, `setRole`, `setPatientId`)
2. ✅ Updated `createUser` to accept role parameter
3. ✅ Created RoleSelectionScreen (patient or companion choice)
4. ✅ Created CompanionLinkScreen (enter patient ID)
5. ✅ Created CompanionDashboardScreen (show patient progress)
6. ✅ Updated navigation: RoleSelection → BasicDetails → (CompanionLink | AwarenessContext)
7. ✅ MainStack uses role to set initial screen

## User Flows

### Patient Flow:
```
Intro → RoleSelection(select Patient) → BasicDetails → AwarenessContext → Complete → HomeDashboard
```

### Companion Flow:
```
Intro → RoleSelection(select Companion) → BasicDetails → CompanionLink(enter patientId) → AwarenessContext → Complete → CompanionDashboard
```

## Key Files Modified

**Backend:**
- `backend/prisma/schema.prisma` - Added role field
- `backend/src/types/index.ts` - Updated CreateUserRequest
- `backend/src/controllers/onboardingController.ts` - Handle role in createUser
- `backend/src/controllers/companionController.ts` - Added getPatientDashboard
- `backend/src/routes/index.ts` - Added patient dashboard route

**Frontend:**
- `frontend/src/context/OnboardingContext.tsx` - Added role, patientId state
- `frontend/src/services/api.ts` - Updated createUser, added getPatientDashboard
- `frontend/src/screens/` - Created 3 new screens
- `frontend/src/navigation/OnboardingStack.tsx` - Added RoleSelection, CompanionLink
- `frontend/src/navigation/MainStack.tsx` - Routing based on role

## How to Test

### Test Backend:
```bash
# 1. Generate Prisma client
cd backend && npx prisma generate

# 2. Run migrations if needed
npx prisma migrate deploy

# 3. Start server
npm run dev

# 4. Test endpoint
curl -X GET http://localhost:3000/companion/patient/<patientId>/dashboard
```

### Test Frontend:
1. Create patient account (select "Patient" on role screen)
2. Complete onboarding → should see HomeDashboard
3. Create companion account (select "Companion" on role screen)
4. Enter patient ID on CompanionLink screen
5. Complete onboarding → should see CompanionDashboard with patient's progress

## Database Migration

```bash
cd backend
npx prisma migrate dev --name add-user-role
npx prisma generate  # Critical: regenerate client after schema changes
```

## Troubleshooting

**Error: "role does not exist in type"**
- Run `npx prisma generate` in backend folder
- Restart backend server

**CompanionDashboard shows "Failed to load patient progress"**
- Verify companion is linked to correct patient ID
- Check network request in DevTools
- Ensure patient exists in database

**Role not persisting**
- Check context is wrapped in OnboardingProvider
- Verify role is passed to createUser call

## Future: Add Permissions System

Update `RecoveryCompanion` model schema:
```prisma
model RecoveryCompanion {
  // ... existing fields ...
  permissions  String[]  // e.g., ['view_progress', 'view_relapse', 'send_message']
}
```

Then validate in `getPatientDashboard` endpoint:
```typescript
if (!companion.permissions.includes('view_progress')) {
  return res.status(403).json({ error: 'Not authorized' });
}
```
