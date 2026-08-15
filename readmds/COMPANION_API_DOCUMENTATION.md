# Companion Feature - API Documentation

## Overview
The companion feature allows designated recovery support partners to view a patient's progress without participating in the full onboarding journey.

---

## API Endpoints

### 1. Create User with Role
Create a user account with optional role specification (default: "patient").

**Endpoint:** `POST /users`

**Request Body:**
```json
{
  "displayName": "John Doe",
  "age": 28,
  "role": "patient"  // Optional: "patient" or "companion". Defaults to "patient"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "displayName": "John Doe",
    "age": 28,
    "createdAt": "2026-02-20T10:30:00Z"
  },
  "message": "User created successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Missing displayName
- `500 Internal Server Error` - Database error

---

### 2. Get Patient Dashboard (Companion Access)
Retrieve a patient's progress summary. Used by companions to view their linked patient's recovery data.

**Endpoint:** `GET /companion/patient/:patientId/dashboard`

**Path Parameters:**
- `patientId` (string) - The ID of the patient to view

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "patient_123",
      "displayName": "Alice Smith"
    },
    "onboarding": {
      "addictionTypes": ["smoking"],
      "intention": "reduce",
      "duration": "30_days",
      "journeyStartDate": "2026-02-15T00:00:00Z",
      "completedAt": "2026-02-15T18:30:00Z"
    },
    "relapseInfo": {
      "totalRelapses": 2,
      "lastRelapseDate": "2026-02-18T14:30:00Z",
      "currentStreakDays": 1
    }
  }
}
```

**Error Responses:**
- `403 Forbidden` - Companion not linked to patient
- `404 Not Found` - Patient not found
- `500 Internal Server Error` - Database error

---

## Data Flow

### Patient Registration
```
POST /users
{
  displayName: "John",
  age: 25,
  role: "patient"
}
↓
Database creates User with role="patient"
↓
User ID returned to client
↓
Client stores userId for onboarding
```

### Companion Registration
```
POST /users
{
  displayName: "Jane (Companion)",
  role: "companion"
}
↓
Database creates User with role="companion"
↓
User proceeds through limited onboarding
↓
Companion enters patient ID at CompanionLinkScreen
↓
Patient ID stored in companion's context
↓
After completion, companion sees CompanionDashboard
```

### Companion Views Patient Progress
```
Companion opens app
↓
MainStack checks state.role === "companion"
↓
Navigates to CompanionDashboard
↓
CompanionDashboard fetches patient data:
  GET /companion/patient/:patientId/dashboard
↓
Response includes:
  - Patient name
  - Addiction type & journey details
  - Current streak
  - Relapse history
↓
Companion sees patient progress dashboard
```

---

## Response Schema

### PatientInfo Object
```typescript
interface PatientInfo {
  id: string;
  displayName: string;
}
```

### OnboardingInfo Object
```typescript
interface OnboardingInfo {
  addictionTypes: string[];      // e.g., ["smoking", "alcohol"]
  intention: string | null;      // e.g., "reduce", "pause", "just_understand"
  duration: string | null;       // e.g., "7_days", "30_days"
  journeyStartDate: string | null;  // ISO 8601 timestamp
  completedAt: string | null;       // ISO 8601 timestamp
}
```

### RelapseInfo Object
```typescript
interface RelapseInfo {
  totalRelapses: number;        // Total number of relapses recorded
  lastRelapseDate: string | null;  // ISO 8601 timestamp or null if none
  currentStreakDays: number;       // Days since last relapse (or journey start)
}
```

### PatientDashboard Response
```typescript
interface PatientDashboardResponse {
  success: true;
  data: {
    patient: PatientInfo;
    onboarding: OnboardingInfo;
    relapseInfo: RelapseInfo;
  }
}
```

---

## Error Handling

### 400 Bad Request
```json
{
  "success": false,
  "error": "Display name is required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Companion not linked to this patient"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Patient data not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to get patient dashboard"
}
```

---

## Security & Privacy

### Access Control
- Companions can only view dashboard for patients they are linked to
- Backend verifies `RecoveryCompanion.userId === patientId` before returning data
- Unauthorized access returns 403 Forbidden

### Data Minimization
- Dashboard endpoint returns limited data (progress only)
- Excludes: chat history, personal journals, detailed analytics
- Focused on recovery journey metrics

### Future Enhancements
- Implement permission levels (e.g., "view_streak", "view_relapse")
- Add companion authentication/verification
- Implement audit logs for access tracking

---

## Example Workflow

### Step 1: Patient Creates Account
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Alice",
    "age": 30,
    "role": "patient"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "patient_xyz",
    "displayName": "Alice",
    "age": 30,
    "createdAt": "2026-02-20T10:00:00Z"
  }
}
```

### Step 2: Patient Completes Onboarding
Patient goes through full onboarding journey and gets their ID: `patient_xyz`

### Step 3: Companion Creates Account
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Bob (Companion)",
    "role": "companion"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "companion_abc",
    "displayName": "Bob (Companion)",
    "createdAt": "2026-02-20T10:05:00Z"
  }
}
```

### Step 4: Companion Links to Patient
Companion enters patient ID (`patient_xyz`) in the CompanionLinkScreen. This links them in the frontend context.

### Step 5: Companion Completes Onboarding
Companion completes onboarding and navigates to CompanionDashboard

### Step 6: Companion Views Patient Progress
```bash
curl -X GET http://localhost:3000/api/companion/patient/patient_xyz/dashboard \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "patient_xyz",
      "displayName": "Alice"
    },
    "onboarding": {
      "addictionTypes": ["smoking"],
      "intention": "reduce",
      "duration": "30_days",
      "journeyStartDate": "2026-02-15T00:00:00Z",
      "completedAt": "2026-02-15T18:30:00Z"
    },
    "relapseInfo": {
      "totalRelapses": 0,
      "lastRelapseDate": null,
      "currentStreakDays": 5
    }
  }
}
```

---

## Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET request |
| 201 | Created | User successfully created |
| 400 | Bad Request | Missing/invalid parameters |
| 403 | Forbidden | Companion not authorized to view patient |
| 404 | Not Found | Patient or data not found |
| 500 | Internal Server Error | Database or server error |

---

## Rate Limiting (Future)

Recommended future implementation:
- Companion: 10 requests per minute per patient
- Patient: Unlimited for own data
- Prevents abuse of patient viewing

---

## Versioning

Current API version: `v1` (implicit)

Future versions may include:
- V2: Permission levels
- V3: Batch companion access
- V4: Webhooks for event notifications
