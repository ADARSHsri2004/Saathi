# Saathi API Documentation

Complete API reference with examples for the Saathi backend.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, no authentication is required. Each user is identified by their unique `userId` returned when they create an account.

## Response Format

All endpoints return a consistent response format:

```typescript
{
  success: boolean;           // true if successful, false if error
  data?: any;                 // Response data (if successful)
  error?: string;             // Error message (if failed)
  message?: string;           // Optional success message
}
```

## Endpoints

### 1. Health Check

Check if the backend is running.

**Endpoint:**
```
GET /health
```

**Example:**
```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "Server is running"
  }
}
```

---

### 2. Create User

Create a new user to start the onboarding process.

**Endpoint:**
```
POST /users
```

**Request Body:**
```typescript
{
  displayName: string;    // Required: User's name or nickname (max 40 chars)
  age?: number;           // Optional: User's age
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "John Doe",
    "age": 28
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "clz4q8n0v0000qz088z9q9q0w",
    "displayName": "John Doe",
    "age": 28,
    "createdAt": "2024-02-08T10:30:45.123Z"
  },
  "message": "User created successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Display name is required"
}
```

---

### 3. Get Onboarding Status

Retrieve a user's current onboarding data.

**Endpoint:**
```
GET /users/:userId/onboarding
```

**Parameters:**
- `userId` (required): The user ID from user creation

**Example:**
```bash
curl http://localhost:3000/api/users/clz4q8n0v0000qz088z9q9q0w/onboarding
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clz4q8n0v0000qz088z9q9q0w",
    "userId": "clz4q8n0v0000qz088z9q9q0w",
    "addictionTypes": ["social_media", "gaming"],
    "whenItHappens": ["stressed", "bored"],
    "feelAfter": "empty",
    "frequency": "few_times_week",
    "moneySpent": "50/week",
    "impactAreas": ["sleep", "focus"],
    "intention": "reduce",
    "duration": "30_days",
    "completedAt": null,
    "createdAt": "2024-02-08T10:30:46.000Z",
    "updatedAt": "2024-02-08T10:32:12.000Z"
  }
}
```

---

### 4. Update Onboarding

Update user's onboarding data. This endpoint can be called multiple times as the user progresses through screens.

**Endpoint:**
```
PUT /users/:userId/onboarding
```

**Parameters:**
- `userId` (required): The user ID

**Request Body (all fields optional):**
```typescript
{
  addictionTypes?: (
    'social_media' | 'gaming' | 'porn' | 'alcohol' | 
    'smoking' | 'shopping' | 'other'
  )[];

  whenItHappens?: (
    'stressed' | 'bored' | 'late_night' | 'after_bad_day' | 
    'habit_autopilot' | 'not_sure'
  )[];

  feelAfter?: (
    'guilty' | 'empty' | 'relaxed' | 'numb' | 
    'regretful' | 'no_strong_feeling'
  ) | null;

  frequency?: (
    'once_in_a_while' | 'few_times_week' | 'almost_every_day' | 
    'multiple_times_day' | 'not_sure'
  ) | null;

  moneySpent?: string;    // Any string, e.g. "100/month"

  impactAreas?: (
    'sleep' | 'focus' | 'mood' | 'relationships' | 
    'health' | 'money' | 'not_really' | 'not_sure'
  )[];

  intention?: (
    'reduce' | 'pause' | 'just_understand'
  ) | null;

  duration?: (
    '7_days' | '14_days' | '30_days' | 'not_sure'
  ) | null;
}
```

**Example (After Awareness Context Screen):**
```bash
curl -X PUT http://localhost:3000/api/users/clz4q8n0v0000qz088z9q9q0w/onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "addictionTypes": ["social_media", "gaming"],
    "whenItHappens": ["stressed", "bored", "late_night"],
    "feelAfter": "empty"
  }'
```

**Example (After Patterns Screen):**
```bash
curl -X PUT http://localhost:3000/api/users/clz4q8n0v0000qz088z9q9q0w/onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": "few_times_week",
    "moneySpent": "50/week",
    "impactAreas": ["sleep", "focus", "mood"]
  }'
```

**Example (After Intention Screen - Full Update):**
```bash
curl -X PUT http://localhost:3000/api/users/clz4q8n0v0000qz088z9q9q0w/onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "addictionTypes": ["social_media", "gaming"],
    "whenItHappens": ["stressed", "bored", "late_night"],
    "feelAfter": "empty",
    "frequency": "few_times_week",
    "moneySpent": "50/week",
    "impactAreas": ["sleep", "focus", "mood"],
    "intention": "reduce",
    "duration": "30_days"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clz4q8n0v0000qz088z9q9q0w",
    "userId": "clz4q8n0v0000qz088z9q9q0w",
    "addictionTypes": ["social_media", "gaming"],
    "whenItHappens": ["stressed", "bored", "late_night"],
    "feelAfter": "empty",
    "frequency": "few_times_week",
    "moneySpent": "50/week",
    "impactAreas": ["sleep", "focus", "mood"],
    "intention": "reduce",
    "duration": "30_days",
    "completedAt": null,
    "createdAt": "2024-02-08T10:30:46.000Z",
    "updatedAt": "2024-02-08T10:35:22.000Z"
  },
  "message": "Onboarding updated successfully"
}
```

---

### 5. Complete Onboarding

Mark a user's onboarding as complete. This sets the `completedAt` timestamp.

**Endpoint:**
```
POST /users/:userId/onboarding/complete
```

**Parameters:**
- `userId` (required): The user ID

**Example:**
```bash
curl -X POST http://localhost:3000/api/users/clz4q8n0v0000qz088z9q9q0w/onboarding/complete \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clz4q8n0v0000qz088z9q9q0w",
    "userId": "clz4q8n0v0000qz088z9q9q0w",
    "addictionTypes": ["social_media", "gaming"],
    "whenItHappens": ["stressed", "bored", "late_night"],
    "feelAfter": "empty",
    "frequency": "few_times_week",
    "moneySpent": "50/week",
    "impactAreas": ["sleep", "focus", "mood"],
    "intention": "reduce",
    "duration": "30_days",
    "completedAt": "2024-02-08T10:35:30.000Z",
    "createdAt": "2024-02-08T10:30:46.000Z",
    "updatedAt": "2024-02-08T10:35:30.000Z"
  },
  "message": "Onboarding completed successfully"
}
```

---

## Frontend Integration

The frontend automatically integrates with these endpoints via the `OnboardingApi` service:

```typescript
// src/services/api.ts
import { OnboardingApi } from '../services/api';

// Create user
const user = await OnboardingApi.createUser('John', 28);

// Update onboarding
await OnboardingApi.updateOnboarding(userId, {
  addictionTypes: ['social_media'],
  whenItHappens: ['stressed'],
});

// Complete onboarding
await OnboardingApi.completeOnboarding(userId);
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Error description"
}
```

### Common Errors

| Error | Reason | Solution |
|-------|--------|----------|
| `Display name is required` | No displayName provided | Ensure displayName is not empty |
| `User not found` | Invalid userId | Check userId is correct |
| `Onboarding not found` | No onboarding record for user | Create user first via POST /users |
| `Failed to create user` | Server error | Check backend logs |
| `Failed to update onboarding` | Invalid data | Check field values are correct |

---

## Data Types Reference

### Addiction Types
- `social_media`
- `gaming`
- `porn`
- `alcohol`
- `smoking`
- `shopping`
- `other`

### When It Happens
- `stressed`
- `bored`
- `late_night`
- `after_bad_day`
- `habit_autopilot`
- `not_sure`

### Feel After
- `guilty`
- `empty`
- `relaxed`
- `numb`
- `regretful`
- `no_strong_feeling`

### Frequency
- `once_in_a_while`
- `few_times_week`
- `almost_every_day`
- `multiple_times_day`
- `not_sure`

### Impact Areas
- `sleep`
- `focus` (productivity)
- `mood`
- `relationships`
- `health`
- `money`
- `not_really`
- `not_sure`

### Intention
- `reduce`
- `pause`
- `just_understand`

### Duration
- `7_days`
- `14_days`
- `30_days`
- `not_sure`

---

## Testing with Postman

1. Import this base URL: `http://localhost:3000/api`
2. Create requests for each endpoint above
3. Use the example bodies provided
4. Replace `userId` with actual user ID from creation response

---

## Rate Limiting

Currently, no rate limiting is implemented. This should be added before production.

---

## Pagination

Currently, no list endpoints. All individual data is returned by ID.

Future versions may include:
- `GET /users` - List all users (with pagination)
- `GET /users?status=completed` - Filter by completion status

---

## Versioning

Currently at v1 (no version prefix in routes).

Future versions could be at `/api/v1/...`, `/api/v2/...`, etc.

---

## Changelog

### Version 1.0 (Current)
- Initial API implementation
- User creation
- Onboarding data collection
- Onboarding completion tracking
