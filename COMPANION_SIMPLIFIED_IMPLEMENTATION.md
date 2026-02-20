# Companion Feature - Simplified Implementation

## Overview
Streamlined companion feature integrated directly into the main onboarding flow:
- **No separate screens** - Role selection is inline in BasicDetailsScreen
- **Single form** - Name, age, role selection, and conditional patient ID
- **Direct flow** - Both patients and companions follow the same onboarding path after basic details

---

## User Flow

### Patient Flow:
```
Intro 
  ↓ "Setup"
BasicDetails (select role: Patient + enter name/age)
  ↓ "Next"
AwarenessContext (addiction type)
  ↓
PatternsImpact (patterns & impact)
  ↓
Complete (save & mark done)
  ↓ (isOnboardingComplete = true)
MainStack → HomeDashboard (full patient app)
```

### Companion Flow:
```
Intro
  ↓ "Setup"
BasicDetailsScreen (select role: Companion + enter name/age + patient ID)
  ↓ "Next"
AwarenessContext (context for understanding patient)
  ↓
PatternsImpact (patterns & impact context)
  ↓
Complete (save & mark done)
  ↓ (isOnboardingComplete = true)
MainStack → CompanionDashboard (read-only patient progress view)
```

---

## Modified Files

### Frontend

#### 1. BasicDetailsScreen (`frontend/src/screens/BasicDetailsScreen.tsx`)
**Changes:**
- Added role selection buttons (Patient 👤 | Companion 🤝)
- Added conditional Patient ID input field (shows only when role = "companion")
- Updated validation: requires name + (patient role OR (companion role AND patient ID))
- Updated imports: added `Alert`, `setRole`, `setPatientId` from context
- Simplified navigation: both paths go to `AwarenessContext` (no more CompanionLink route)

**Key Code:**
```typescript
// Role buttons in form
<TouchableOpacity onPress={() => setRole('patient')}>
  <Text>👤 Patient</Text>
</TouchableOpacity>
<TouchableOpacity onPress={() => setRole('companion')}>
  <Text>🤝 Companion</Text>
</TouchableOpacity>

// Conditional patient ID field
{state.role === 'companion' && (
  <TextInput
    placeholder="Paste the patient ID"
    value={state.patientId}
    onChangeText={setPatientId}
  />
)}
```

#### 2. IntroScreen (`frontend/src/screens/IntroScreen.tsx`)
**Changes:**
- Updated navigation: "Setup" button now goes to `BasicDetails` (not `RoleSelection`)

#### 3. Deleted Screens
- ❌ Removed `RoleSelectionScreen.tsx` (merged into BasicDetailsScreen)
- ❌ Removed `CompanionLinkScreen.tsx` (merged into BasicDetailsScreen)

#### 4. OnboardingContext.tsx (already has)
- ✅ `role` state: `'patient' | 'companion' | null`
- ✅ `patientId` state: string for companion's linked patient
- ✅ `setRole()` and `setPatientId()` functions
- ✅ `createUser()` accepts optional role parameter

#### 5. OnboardingStack.tsx (no changes needed)
- Already has correct routes: Intro → BasicDetails → Awareness → Patterns → Complete

#### 6. MainStack.tsx (already has)
- ✅ Initializes to `CompanionDashboard` if role = 'companion'
- ✅ Initializes to `HomeDashboard` if role = 'patient'

---

## Backend (No Changes Needed)

The backend already supports:
- ✅ `POST /users` accepts role parameter
- ✅ User model has role field
- ✅ `GET /companion/patient/:patientId/dashboard` endpoint exists
- ✅ CompanionDashboardScreen uses this endpoint

No additional backend changes required.

---

## UI Flow - BasicDetailsScreen

```
┌─────────────────────────────────────────┐
│         Basic Details Form              │
├─────────────────────────────────────────┤
│                                         │
│  📷 Photo Placeholder                   │
│                                         │
│  ❓ Who are you?                        │
│  ┌─────────────────┬─────────────────┐ │
│  │   👤 Patient    │  🤝 Companion   │ │
│  └─────────────────┴─────────────────┘ │
│                                         │
│  ❓ What should we call you?            │
│  ┌────────────────────────────────────┐│
│  │ Your name or nickname              ││
│  └────────────────────────────────────┘│
│                                         │
│  ❓ Age                                 │
│  ┌────────────────────────────────────┐│
│  │ Optional                           ││
│  └────────────────────────────────────┘│
│                                         │
│  [Conditionally shown if Companion]     │
│  ❓ Patient ID                          │
│  ┌──────────────────────────────────┐  │
│  │ Ask patient to share their ID    │  │
│  ├──────────────────────────────────┤  │
│  │ Paste the patient ID             │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌────────────────────────────────────┐│
│  │          Next Button               ││
│  └────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

---

## Validation Logic

```typescript
const canProceed = 
  state.displayName.trim().length > 0 &&  // Name required
  (
    state.role === 'patient' ||            // Patient: only needs name
    (
      state.role === 'companion' &&        // Companion: needs name AND
      state.patientId.trim().length > 0    // patient ID
    )
  );
```

---

## API Usage

### Create User (with role):
```bash
POST /users
Body: {
  "displayName": "John",
  "age": 25,
  "role": "patient"  # or "companion"
}
```

### Companion Fetches Patient Dashboard:
```bash
GET /companion/patient/:patientId/dashboard
# Returns: patient info, onboarding summary, relapse history
```

---

## Testing Checklist

**Onboarding:**
- [ ] User can select "Patient" role
- [ ] User can select "Companion" role
- [ ] Patient ID field only shows when role = "companion"
- [ ] Form requires name + age
- [ ] Form requires name + age + patient ID (if companion)
- [ ] Both paths successfully create user with correct role
- [ ] Post-onboarding: patient → HomeDashboard, companion → CompanionDashboard

**Navigation:**
- [ ] Intro "Setup" → BasicDetails
- [ ] BasicDetails "Next" → AwarenessContext
- [ ] Complete flow works for both roles
- [ ] MainStack initializes correctly based on role

**CompanionDashboard:**
- [ ] Shows patient info (name, addiction type, goal)
- [ ] Shows progress (streak, relapses, journey date)
- [ ] Displays last relapse date (if any)
- [ ] Pull-to-refresh works
- [ ] Error handling for invalid patient ID

---

## Key Differences from Previous Design

| Aspect | Before | After |
|--------|--------|-------|
| Role Selection | Separate RoleSelectionScreen | Inline in BasicDetailsScreen |
| Patient ID Entry | CompanionLinkScreen | Inline in BasicDetailsScreen |
| Total Onboarding Steps | 5+ screens | 4 screens |
| Patient/Companion Flow | Different paths | Same path after BasicDetails |
| User Experience | Multiple role transitions | Single integrated form |

---

## Benefits

✅ **Simpler UX** - Fewer screens and transitions
✅ **Cleaner Code** - Combined form validation
✅ **Faster Onboarding** - All basic info collected in one screen
✅ **Consistent Flow** - Both roles follow same journey (except destination)
✅ **Easier Maintenance** - Fewer special cases in navigation

---

## Summary

The companion feature is now fully integrated into a single BasicDetailsScreen that:
1. Displays role selection buttons
2. Collects name and age
3. Conditionally shows patient ID field for companions
4. Routes to the appropriate dashboard based on role

No separate screens needed. Clean, simple, user-friendly flow.
