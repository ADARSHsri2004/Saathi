# Companion Feature Implementation Summary

## Overview
Implemented a complete companion feature allowing patients to designate recovery support companions who can view patient progress without participating in onboarding. The feature includes:

1. **Role-based user system** (Patient or Companion)
2. **Companion linking** (Companions link to existing patient via patient ID)
3. **Companion dashboard** (Dedicated dashboard showing only patient progress)

---

## Backend Changes

### 1. Database Schema (`backend/prisma/schema.prisma`)
- **Added `role` field to `User` model:**
  - Type: `String` with default value `"patient"`
  - Values: `"patient"` or `"companion"`
  - Allows identifying user type during login/navigation

**Migration:**
```bash
npx prisma migrate dev --name add-user-role
npx prisma generate  # Run this after schema changes
```

### 2. API Types (`backend/src/types/index.ts`)
- **Updated `CreateUserRequest` interface:**
  - Added optional `role?: 'patient' | 'companion'` field
  - Allows frontend to specify role during user creation

### 3. Onboarding Controller (`backend/src/controllers/onboardingController.ts`)
- **Updated `createUser` method:**
  - Accepts optional `role` from request body
  - Defaults to `'patient'` if not specified
  - Persists role to database

```typescript
const user = await prisma.user.create({
  data: {
    displayName,
    age: age ? parseInt(age.toString()) : null,
    role: role === 'companion' ? 'companion' : 'patient',
  },
});
```

### 4. Companion Controller (`backend/src/controllers/companionController.ts`)
- **Added new method `getPatientDashboard`:**
  - Endpoint: `GET /companion/patient/:patientId/dashboard`
  - Verifies companion is linked to patient
  - Returns limited patient progress data:
    - Patient name & ID
    - Addiction type, goal, duration
    - Recovery journey start date
    - Relapse history (total count, last date, current streak)
  - Protects patient privacy (no sensitive data)

```typescript
static async getPatientDashboard(req: Request<{ patientId: string }>, res: Response) {
  // Verify companion is linked to patient
  // Return: patient info, onboarding summary, relapse info
}
```

### 5. Routes (`backend/src/routes/index.ts`)
- **Added companion dashboard route:**
  ```typescript
  router.get('/companion/patient/:patientId/dashboard', CompanionController.getPatientDashboard);
  ```

---

## Frontend Changes

### 1. OnboardingContext (`frontend/src/context/OnboardingContext.tsx`)
- **Extended `OnboardingState`:**
  - Added `role: 'patient' | 'companion' | null`
  - Added `patientId: string` (for companions to store linked patient ID)

- **Added context functions:**
  - `setRole(v: 'patient' | 'companion' | null)` - Set user role
  - `setPatientId(v: string)` - Set linked patient ID

- **Updated `createUser` method:**
  - Now accepts optional `role` parameter
  - Passes role to API and stores in state

### 2. API Service (`frontend/src/services/api.ts`)
- **Updated `CreateUserResponse`:**
  - Added optional `role?: 'patient' | 'companion'` field

- **Updated `OnboardingApi.createUser`:**
  - Accepts optional `role` parameter
  - Sends role in request body:
    ```typescript
    body: JSON.stringify({ displayName, age, role })
    ```

- **Added to `CompanionApi`:**
  - New method `getPatientDashboard(patientId: string)`
  - Fetches companion's patient progress data

### 3. Navigation Updates

#### RoleSelectionScreen (NEW)
- **File:** `frontend/src/screens/RoleSelectionScreen.tsx`
- **Purpose:** First screen after intro; users select "Patient" or "Companion"
- **Navigation:**
  - Both options proceed to BasicDetails
  - Role stored in context before navigation
- **UI:** Two card options with emojis (👤 Patient, 🤝 Companion)

#### CompanionLinkScreen (NEW)
- **File:** `frontend/src/screens/CompanionLinkScreen.tsx`
- **Purpose:** Ask companions to enter patient ID
- **Flow:** Companion → BasicDetails → CompanionLinkScreen → AwarenessContext
- **Stores:** Patient ID in `state.patientId`

#### CompanionDashboardScreen (NEW)
- **File:** `frontend/src/screens/CompanionDashboardScreen.tsx`
- **Purpose:** Dedicated dashboard for companions
- **Shows:**
  - Patient name and addiction type
  - Goal duration and status
  - Current streak (days clean)
  - Total relapses & last relapse date
  - Journey start date
  - Action buttons (Send Message, Log Update - future features)
- **Features:**
  - Fetches patient data via `CompanionApi.getPatientDashboard`
  - Pull-to-refresh support
  - Error handling with retry
  - Displays warning for recent relapses

#### Updated BasicDetailsScreen
- **Modified `handleNext`:**
  - Passes `state.role` to `createUser`
  - If role is `'companion'`, redirects to `CompanionLink` instead of `AwarenessContext`

#### Updated OnboardingStack
- **Added routes:**
  - `RoleSelection` → First screen (before BasicDetails)
  - `CompanionLink` → Between BasicDetails and AwarenessContext
- **Updated IntroScreen:** Navigates to RoleSelection (not BasicDetails)

#### Updated MainStack
- **Uses context role to set initial route:**
  - If user role is `'companion'`: starts at `CompanionDashboard`
  - If user role is `'patient'`: starts at `HomeDashboard`
- **Added `CompanionDashboard` screen to stack**

### 4. Screen Exports (`frontend/src/screens/index.ts`)
- Exported new screens:
  - `RoleSelectionScreen`
  - `CompanionLinkScreen`
  - `CompanionDashboardScreen`

---

## User Flow

### For Patients:
1. Intro → Role Selection → Select "Patient" → Basic Details
2. → Addiction awareness → Patterns/Impact → Complete → HomeDashboard
3. Normal patient journey

### For Companions:
1. Intro → Role Selection → Select "Companion" → Basic Details
2. → Companion Link Screen (enter patient ID) → Addiction awareness (for context)
3. → Patterns/Impact → Complete → CompanionDashboard
4. Dashboard shows only patient's progress (read-only)

---

## Setup Instructions

### Backend Setup:
```bash
cd backend
npx prisma generate        # Regenerate Prisma client
npx prisma migrate dev     # Apply migrations (if needed)
npm run dev                # Start server
```

### Database Notes:
- Migration `add_user_role` adds the `role` field to existing User table
- Default value is `'patient'` for backward compatibility
- Existing users will default to patient role

---

## API Endpoints

### Patient Creation (with role):
```
POST /users
Body: { 
  displayName: string,
  age?: number,
  role?: 'patient' | 'companion'  // New optional field
}
Response: { id, displayName, age, createdAt }
```

### Get Companion Patient Dashboard:
```
GET /companion/patient/:patientId/dashboard
Returns: {
  patient: { id, displayName },
  onboarding: { addictionTypes, intention, duration, journeyStartDate, completedAt },
  relapseInfo: { totalRelapses, lastRelapseDate, currentStreakDays }
}
```

---

## Privacy & Security Considerations

1. **Companion Access Control:**
   - Companions can only view dashboard if linked to patient
   - Backend verifies `RecoveryCompanion.userId === patientId`
   
2. **Data Minimization:**
   - Companion dashboard shows only progress metrics
   - No access to chat history, personal journals, or detailed analytics
   - Limited to recovery-relevant data

3. **Future Enhancements:**
   - Add companion authentication (verify ownership of patient ID)
   - Implement permission levels (view-only, emergency alerts, etc.)
   - Add audit logs for companion access

---

## Testing Checklist

- [ ] Backend compiles without errors
- [ ] Prisma migrations complete successfully
- [ ] User can create account as "Patient"
- [ ] User can create account as "Companion"
- [ ] Companion can enter patient ID
- [ ] Companion dashboard loads patient progress
- [ ] Navigation routes correctly based on role
- [ ] Role is persisted in context and database
- [ ] CompanionDashboardScreen displays all patient metrics
- [ ] Pull-to-refresh works on companion dashboard
- [ ] Error handling works (invalid patient ID, etc.)

---

## Future Work

1. **Companion Notifications:**
   - Alert companion of patient relapses
   - Weekly progress summaries
   - Emergency contact feature

2. **Messaging System:**
   - Send supportive messages to patients
   - Bidirectional communication

3. **Companion Permissions:**
   - Customizable permission levels
   - SMS/Email alerts configuration

4. **Analytics:**
   - Companion app with analytics dashboard
   - Relationship strength metrics

5. **Multi-Companion Support:**
   - Allow patients to have multiple companions
   - Different roles/permissions per companion
