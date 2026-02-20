# Companion Feature - Visual Flow Guide

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         App Root                             │
│  (Check: isOnboardingComplete & isHydrating)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼ (false)                     ▼ (true)
   OnboardingStack              MainStack
        │                          │
        └──────────────────────────┴─────────────┐
                                                  │
                                    ┌─────────────┴────────────┐
                                    │                          │
                          If role="companion"      If role="patient"
                                    │                          │
                                    ▼                          ▼
                          CompanionDashboard         HomeDashboard
                          (Read Patent Progress)     (User's Journey)
```

---

## Onboarding Flow - Patient Path

```
┌──────────┐
│  Intro   │  "Setup" button
│  Screen  │
└────┬─────┘
     │
     ▼
┌──────────────────┐
│ RoleSelection    │  User selects "I'm a Patient"
│    Screen        │
└────┬─────────────┘
     │ (setRole("patient"))
     ▼
┌──────────────────┐
│ BasicDetails     │  Name, Age (role="patient" in context)
│    Screen        │
└────┬─────────────┘
     │ createUser(displayName, age, "patient")
     │ → POST /users with role: "patient"
     │ → Database creates User with role="patient"
     ▼
┌──────────────────┐
│AwarenessContext  │  Addiction type selection
│    Screen        │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ PatternsImpact   │  Usage patterns & impact
│    Screen        │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│  Complete        │  Save to backend
│    Screen        │  completeOnboarding()
└────┬─────────────┘  markOnboardingComplete()
     │
     ✓ Set isOnboardingComplete = true
     │
     ▼
┌──────────────────────────────────┐
│      MainStack (Patient Path)     │
│  initialRouteName="HomeDashboard" │
└──────────────────────────────────┘
     │
     ▼
┌──────────────────┐
│  HomeDashboard   │  Patient's recovery journey
│                  │  - Today's progress
│                  │  - Recovery metrics
│                  │  - Future projections
└──────────────────┘
```

---

## Onboarding Flow - Companion Path

```
┌──────────┐
│  Intro   │  "Setup" button
│  Screen  │
└────┬─────┘
     │
     ▼
┌──────────────────┐
│ RoleSelection    │  User selects "I'm a Companion"
│    Screen        │
└────┬─────────────┘
     │ (setRole("companion"))
     ▼
┌──────────────────┐
│ BasicDetails     │  Name, Age (role="companion" in context)
│    Screen        │
└────┬─────────────┘
     │ createUser(displayName, age, "companion")
     │ → POST /users with role: "companion"
     │ → Database creates User with role="companion"
     ▼
┌──────────────────┐
│CompanionLink     │  Enter Patient ID (ask patient to share)
│   Screen         │  • Validate patient exists (basic check)
│                  │  • setPatientId(inputValue)
└────┬─────────────┘
     │ state.patientId now contains linked patient ID
     ▼
┌──────────────────┐
│AwarenessContext  │  Optional context (helps companion understand)
│    Screen        │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ PatternsImpact   │  Learn about patient's patterns
│    Screen        │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│  Complete        │  Save to backend
│    Screen        │  completeOnboarding()
└────┬─────────────┘  markOnboardingComplete()
     │
     ✓ Set isOnboardingComplete = true
     │
     ▼
┌──────────────────────────────────┐
│     MainStack (Companion Path)    │
│initialRouteName="CompanionDash" │
│(because state.role="companion")   │
└──────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│    CompanionDashboard            │
│                                  │
│ Fetches: GET /companion/patient  │
│          /:patientId/dashboard   │
│                                  │
│ Shows:                           │
│  • Patient Name                  │
│  • Current Streak (days)         │
│  • Total Relapses                │
│  • Last Relapse Date             │
│  • Journey Start Date            │
│  • Addiction Type & Goal         │
│  • Action Buttons (future)       │
└──────────────────────────────────┘
```

---

## Role Selection Screen - UI

```
┌─────────────────────────────────────┐
│        Who are you?                 │
│  Choose your role to get started    │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐  │
│  │           👤                 │  │
│  │     I'm a Patient            │  │
│  │  Start your recovery journey │  │
│  │  and track your progress     │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │           🤝                 │  │
│  │   I'm a Companion            │  │
│  │  Support someone's recovery  │  │
│  │  journey and track progress  │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘

Tap either card to proceed to BasicDetails
Role is stored in context before navigation
```

---

## State Management - OnboardingContext

```
┌─────────────────────────────────────┐
│     OnboardingContext State         │
├─────────────────────────────────────┤
│                                     │
│ Primary (all users):                │
│  • userId: string                  │
│  • displayName: string             │
│  • age: string                     │
│  • addictionTypes: []              │
│  • whenItHappens: []               │
│  • ... (other onboarding fields)   │
│                                     │
│ NEW - Role & Companion Fields:      │
│  • role: "patient" | "companion"   │
│  • patientId: string (companion)   │
│                                     │
│ Functions:                          │
│  • setRole(role)                   │
│  • setPatientId(patientId)         │
│  • createUser(name, age, role)     │
│                                     │
└─────────────────────────────────────┘
```

---

## API Request Flow

### Creating a User with Role

```
Frontend (OnboardingContext)
    │
    ▼ createUser(displayName, age, role)
OnboardingApi.createUser(displayName, age, role)
    │
    │ POST /users
    │ Body: { displayName, age, role }
    ▼
Backend (onboardingController)
    │
    └─► Extract role from req.body
    │
    ├─► Validate displayName exists
    │
    └─► Create User with:
        {
          displayName,
          age,
          role: role==="companion" ? "companion" : "patient"
        }
    │
    ▼
Prisma
    │
    └─► INSERT INTO "User" 
        (id, displayName, age, role)
        VALUES (...)
    │
    ▼
Response: { id, displayName, age, createdAt }
    │
    └─► Frontend context updated: userId, role
```

### Companion Accessing Patient Dashboard

```
Frontend (CompanionDashboardScreen)
    │
    ▼ useEffect: fetchPatientData()
CompanionApi.getPatientDashboard(patientId)
    │
    │ GET /companion/patient/:patientId/dashboard
    ▼
Backend (companionController.getPatientDashboard)
    │
    ├─► Extract patientId from params
    │
    ├─► Query: RecoveryCompanion where userId=patientId
    │   ├─► If not found: return 403 Forbidden
    │   └─► If found: proceed
    │
    ├─► Query: Onboarding where userId=patientId
    │
    ├─► Query: Relapse[] where userId=patientId
    │
    └─► Calculate:
        • currentStreakDays
        • totalRelapses
        • lastRelapseDate
    │
    ▼
Response: {
  patient: { id, displayName },
  onboarding: { addictionTypes, intention, duration, ... },
  relapseInfo: { totalRelapses, lastRelapseDate, currentStreakDays }
}
    │
    ▼
Frontend
    │
    └─► setState(patientData)
    │
    └─► Render CompanionDashboard with patient info
```

---

## Database Schema Changes

```
BEFORE:
┌─────────────┐
│   User      │
├─────────────┤
│ id          │
│ displayName │
│ age         │
│ createdAt   │
│ updatedAt   │
└─────────────┘

AFTER:
┌──────────────────┐
│   User           │  ← NEW FIELD
├──────────────────┤
│ id               │
│ displayName      │
│ age              │
│ role ⭐         │  "patient" | "companion"
│ createdAt        │
│ updatedAt        │
└──────────────────┘

RecoveryCompanion (existing):
┌──────────────────┐
│RecoveryCompanion│
├──────────────────┤
│ id               │
│ userId (FK)  ⭐  │  Links to Patient User
│ name             │
│ phone            │
│ countryCode      │
│ permissions      │
│ createdAt        │
└──────────────────┘
```

---

## Navigation Conditional Logic

```
RootNavigator / MainStack Initialization:

const { state } = useOnboarding();
const isCompanion = state.role === "companion";

<Stack.Navigator
  initialRouteName={
    isCompanion ? "CompanionDashboard" : "HomeDashboard"
  }
>
  {/* All screens available, but initial route depends on role */}
</Stack.Navigator>

▼ Result:
├─ Patient: Starts at HomeDashboard (full app)
└─ Companion: Starts at CompanionDashboard (read-only)
```

---

## State Transitions

```
User Opens App
    │
    ├─ Not Onboarded: isOnboardingComplete = false
    │  └─ Show: OnboardingStack
    │      ├─ RoleSelection ← User selects role
    │      ├─ BasicDetails ← Name, Age
    │      ├─ CompanionLink (if companion) ← Patient ID
    │      ├─ Awareness & Patterns ← Context
    │      └─ Complete ← Mark onboarding complete
    │
    └─ Onboarded: isOnboardingComplete = true
       └─ Show: MainStack (role-dependent)
           ├─ If role = "patient": HomeDashboard
           └─ If role = "companion": CompanionDashboard

✓ state.role persists in OnboardingContext
✓ isOnboardingComplete persists in AsyncStorage
✓ patientId stored in OnboardingContext (for companion)
```

---

## File Structure

```
frontend/
├── src/
│   ├── screens/
│   │   ├── RoleSelectionScreen.tsx        ⭐ NEW
│   │   ├── CompanionLinkScreen.tsx        ⭐ NEW
│   │   ├── CompanionDashboardScreen.tsx   ⭐ NEW
│   │   ├── BasicDetailsScreen.tsx         (MODIFIED)
│   │   ├── CompleteScreen.tsx             (no changes needed)
│   │   └── ... (other screens)
│   ├── context/
│   │   └── OnboardingContext.tsx          (MODIFIED - added role, patientId)
│   ├── services/
│   │   └── api.ts                         (MODIFIED - updated createUser, added getPatientDashboard)
│   └── navigation/
│       ├── OnboardingStack.tsx            (MODIFIED - added RoleSelection, CompanionLink)
│       └── MainStack.tsx                  (MODIFIED - use role for initialRouteName)

backend/
├── prisma/
│   └── schema.prisma                      (MODIFIED - added role field)
├── src/
│   ├── types/
│   │   └── index.ts                       (MODIFIED - added role to CreateUserRequest)
│   ├── controllers/
│   │   ├── onboardingController.ts        (MODIFIED - handle role in createUser)
│   │   └── companionController.ts         (MODIFIED - added getPatientDashboard)
│   └── routes/
│       └── index.ts                       (MODIFIED - added companion dashboard route)
```

---

## Testing Checklist - UI/UX

- [ ] **Intro Screen**: "Setup" → navigates to RoleSelection
- [ ] **RoleSelection Screen**: 
  - [ ] Two cards visible (Patient, Companion)
  - [ ] Tapping Patient → BasicDetails (role="patient" set)
  - [ ] Tapping Companion → BasicDetails (role="companion" set)
- [ ] **BasicDetails Screen** (Patient):
  - [ ] Fills name & age
  - [ ] Next → AwarenessContext
- [ ] **BasicDetails Screen** (Companion):
  - [ ] Fills companion name & optional age
  - [ ] Next → CompanionLink (not AwarenessContext)
- [ ] **CompanionLink Screen**:
  - [ ] Input field for patient ID
  - [ ] Validates input (not empty)
  - [ ] Link Patient button → AwarenessContext
- [ ] **Complete Screen**: Both paths work, navigate correctly
- [ ] **MainStack Routing**:
  - [ ] Patient: Lands on HomeDashboard
  - [ ] Companion: Lands on CompanionDashboard
- [ ] **CompanionDashboard**:
  - [ ] Loads patient data
  - [ ] Displays all metrics (streak, relapses, etc.)
  - [ ] Pull-to-refresh works
  - [ ] Error handling shows retry button
