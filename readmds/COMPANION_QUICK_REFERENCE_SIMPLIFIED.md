# Companion Feature - Quick Reference (Simplified)

## 🎯 What Changed?

**Instead of** separate RoleSelectionScreen + CompanionLinkScreen:
- ✅ Everything is now in **BasicDetailsScreen**
- ✅ Role selection + name/age + optional patient ID (all in one form)
- ✅ Cleaner, simpler user experience

---

## 📱 The Form Now Has:

```
1. Photo Placeholder (optional)
2. Who are you? → [👤 Patient] [🤝 Companion] ← NEW
3. What should we call you? → Text Input
4. Age → Number Input
5. Patient ID → Text Input (CONDITIONAL - only for companions) ← NEW
6. Next Button
```

---

## 🔄 User Flows

### Patient:
```
Intro → BasicDetails (select Patient) → Awareness → Patterns → Complete → HomeDashboard
```

### Companion:
```
Intro → BasicDetails (select Companion + enter patient ID) → Awareness → Patterns → Complete → CompanionDashboard
```

---

## Code Changes

### BasicDetailsScreen
```typescript
// New imports
import { Alert } from 'react-native';
const { setRole, setPatientId, ... } = useOnboarding();

// Role buttons
<TouchableOpacity onPress={() => setRole('patient')}>
  👤 Patient
</TouchableOpacity>

// Conditional patient ID field
{state.role === 'companion' && (
  <TextInput
    placeholder="Paste the patient ID"
    value={state.patientId}
    onChangeText={setPatientId}
  />
)}

// Simplified navigation (both go to same next screen)
navigation.navigate('AwarenessContext');
```

### Deleted Files
- ❌ `RoleSelectionScreen.tsx`
- ❌ `CompanionLinkScreen.tsx`

### Updated Files
- ✏️ `BasicDetailsScreen.tsx` - Added role UI + patient ID field
- ✏️ `IntroScreen.tsx` - Navigate to BasicDetails (not RoleSelection)
- ✏️ `screens/index.ts` - Removed old screen exports

---

## Backend (No Changes)

✅ Already supports all required functionality:
- POST /users with role parameter
- GET /companion/patient/:patientId/dashboard

---

## Frontend Structure After Changes

```
navigation/
└── OnboardingStack.tsx
    ├── Intro
    ├── BasicDetails ← Role selection + patient ID input
    ├── AwarenessContext
    ├── PatternsImpact
    └── Complete

MainStack.tsx
├── HomeDashboard (if patient)
└── CompanionDashboard (if companion) ● Shows only patient progress
```

---

## Key Form Logic

```typescript
// Button enabled only when valid
const canProceed = 
  state.displayName.trim().length > 0 &&
  (
    state.role === 'patient' || 
    (state.role === 'companion' && state.patientId.trim().length > 0)
  );
```

---

## Testing the Flow

### As Patient:
1. Open app → Intro
2. Tap "Setup"
3. Select "👤 Patient"
4. Enter name + optional age
5. Tap "Next"
6. Complete onboarding → See HomeDashboard

### As Companion:
1. Open app → Intro
2. Tap "Setup"
3. Select "🤝 Companion"
4. Enter name + optional age
5. Enter patient ID (ask patient to share)
6. Tap "Next"
7. Complete onboarding → See CompanionDashboard (patient's progress only)

---

## Component Tree

```
BasicDetailsScreen
├── ProgressIndicator (step 1)
├── Photo Placeholder
├── Role Selection
│   ├── Patient Button
│   └── Companion Button
├── Name Input
├── Age Input
├── Patient ID Input {IF companion}
└── Next Button
```

---

## Setup Steps

```bash
# Frontend (already done, just verify)
cd frontend

# Make sure context has role/patientId (✅ already added)
# Make sure MainStack checks role for initialRouteName (✅ already done)
# Make sure CompanionDashboardScreen exists (✅ already created)

# Backend
cd backend
npx prisma generate         # ✅ Done
npx prisma migrate deploy   # ✅ Done (if needed)
npm run dev                 # Test server

# Run tests
# Verify both paths work
# Verify companion dashboard shows patient data
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Patient ID field not showing | Check `state.role === 'companion'` condition |
| Companion can't submit | Ensure patient ID is not empty |
| Wrong dashboard shown | Check MainStack `initialRouteName` logic |
| Patient data not loading | Verify backend endpoint `/companion/patient/:id/dashboard` |

---

## File Sizes After Cleanup

| File | Status |
|------|--------|
| BasicDetailsScreen.tsx | ↑ Added role UI (larger) |
| RoleSelectionScreen.tsx | ❌ Deleted |
| CompanionLinkScreen.tsx | ❌ Deleted |
| OnboardingStack.tsx | ✅ No change (same routes) |
| Navigation complexity | ↓ Simplified |

---

## What Users See

### Patient Flow:
```
Step 1: Intro
"A gentle companion for awareness and recovery."
[Setup]
    ↓
Step 2: BasicDetails
"Who are you?" [👤 Patient] [🤝 Companion]
"What should we call you?" [Text Input]
"Age" [Text Input]
[Next]
    ↓
Step 3-5: Continue onboarding...
    ↓
Result: Full app access (HomeDashboard)
```

### Companion Flow:
```
Step 1: Intro
"A gentle companion for awareness and recovery."
[Setup]
    ↓
Step 2: BasicDetails
"Who are you?" [👤 Patient] [🤝 Companion]
"What should we call you?" [Text Input]
"Age" [Text Input]
"Patient ID" [Text Input] ← Additional field
"Ask the patient to share their ID with you"
[Next]
    ↓
Step 3-5: Continue onboarding...
    ↓
Result: CompanionDashboard (read patient progress only)
```

---

## Summary

✅ **Simpler Design** - All role selection in one form
✅ **Faster Setup** - Fewer screens to navigate
✅ **Cleaner Code** - Consolidated logic in one component
✅ **Better UX** - Same comfortable form for both roles
✅ **Maintained Privacy** - Companions only see patient progress
