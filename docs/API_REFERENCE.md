# API Reference

> **ExpenseFlow** REST API — Complete endpoint documentation  
> Base URL: `http://localhost:5001/api` (development)  
> Interactive Docs: `http://localhost:5001/api-docs` (Swagger UI)

---

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

Tokens are obtained from the `/auth/login`, `/auth/register`, or `/auth/refresh` endpoints.

---

## Response Envelope

All responses follow a consistent envelope:

### Success
```json
{
  "success": true,
  "message": "Human-readable success message",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK — request succeeded |
| `201` | Created — resource created |
| `400` | Bad Request — validation failed or invalid input |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — account disabled or insufficient role |
| `404` | Not Found — resource does not exist |
| `409` | Conflict — duplicate resource (e.g. email in use) |
| `500` | Internal Server Error — unexpected server failure |

---

## Auth Endpoints

### POST `/auth/register`

Register a new user account.

**Authentication:** Not required

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | ✅ | 2–50 characters |
| `email` | string | ✅ | Valid email format |
| `password` | string | ✅ | Minimum 6 characters |

```json
{
  "name": "Ankit Singh",
  "email": "ankit@example.com",
  "password": "securepassword123"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "1b1471664e8888ac5c3407d4587a0a04...",
    "user": {
      "id": "a3f5b7c8-9d0e-1f2a-3b4c-5d6e7f8a9b0c",
      "name": "Ankit Singh",
      "email": "ankit@example.com",
      "role": "USER",
      "isVerified": false,
      "createdAt": "2026-07-05T09:00:00.000Z",
      "updatedAt": "2026-07-05T09:00:00.000Z"
    }
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `400` | Validation failed (missing fields, invalid email, short password) |
| `400` | Email already in use |

---

### POST `/auth/login`

Authenticate with email and password.

**Authentication:** Not required

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `email` | string | ✅ |
| `password` | string | ✅ |

```json
{
  "email": "ankit@example.com",
  "password": "securepassword123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "b216fc1baf5fd5247e058c203992f1c6...",
    "user": {
      "id": "a3f5b7c8-9d0e-1f2a-3b4c-5d6e7f8a9b0c",
      "name": "Ankit Singh",
      "email": "ankit@example.com",
      "role": "USER",
      "isVerified": false,
      "createdAt": "2026-07-05T09:00:00.000Z",
      "updatedAt": "2026-07-05T09:00:00.000Z"
    }
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `400` | Validation failed |
| `401` | Invalid email or password |
| `403` | Account has been disabled |

---

### POST `/auth/google`

Login or register using a Google Identity Services ID token.

**Authentication:** Not required

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `idToken` | string | ✅ |

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjF..."
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": { ... }
  }
}
```

**Behavior:**
- If the Google email doesn't exist in the database → creates a new user with `isVerified: true`
- If the Google email exists but has no `googleId` → links the Google account
- If the Google email exists and is linked → logs in normally

---

### POST `/auth/refresh`

Rotate the access token using a valid refresh token.

**Authentication:** Not required

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `refreshToken` | string | ✅ |

```json
{
  "refreshToken": "b216fc1baf5fd5247e058c203992f1c6..."
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "new_refresh_token_here..."
  }
}
```

> The old refresh token is immediately revoked. This implements **refresh token rotation** to prevent replay attacks.

---

### POST `/auth/logout`

Revoke the current session's refresh token.

**Authentication:** ✅ Required

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `refreshToken` | string | Optional — revokes provided token, otherwise revokes all |

**Response `200`:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST `/auth/logout-all`

Revoke all refresh tokens for the current user (logout from all devices).

**Authentication:** ✅ Required

**Response `200`:**
```json
{
  "success": true,
  "message": "Logged out from all devices"
}
```

---

### POST `/auth/forgot-password`

Send a password reset link to the user's email.

**Authentication:** Not required

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `email` | string | ✅ |

```json
{
  "email": "ankit@example.com"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "If an account with this email exists, a password reset link has been sent."
}
```

> Always returns `200` regardless of whether the email exists — prevents email enumeration attacks.

---

### POST `/auth/reset-password`

Reset the user's password using a valid reset token.

**Authentication:** Not required

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `token` | string | ✅ | — |
| `password` | string | ✅ | Minimum 6 characters |

```json
{
  "token": "20534f310faaf6f4cc9d7f3ca1afade2...",
  "password": "newSecurePassword123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### POST `/auth/verify-email`

Verify a user's email address using the token sent to their inbox.

**Authentication:** Not required

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `token` | string | ✅ |

**Response `200`:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### GET `/auth/profile`

Get the currently authenticated user's profile.

**Authentication:** ✅ Required

**Response `200`:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "a3f5b7c8-9d0e-1f2a-3b4c-5d6e7f8a9b0c",
      "name": "Ankit Singh",
      "email": "ankit@example.com",
      "role": "USER",
      "isVerified": false,
      "createdAt": "2026-07-05T09:00:00.000Z",
      "updatedAt": "2026-07-05T09:00:00.000Z"
    }
  }
}
```

---

### PUT `/auth/profile`

Update the authenticated user's name or email.

**Authentication:** ✅ Required

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | Optional | 2–50 characters |
| `email` | string | Optional | Valid email format |

```json
{
  "name": "Ankit Kumar Singh"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": { ... }
  }
}
```

---

## Expense Endpoints

### GET `/expenses`

Retrieve a paginated, filterable list of the authenticated user's expenses.

**Authentication:** ✅ Required

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Items per page (max 100) |
| `category` | string | — | Filter by category enum |
| `search` | string | — | Full-text search on title |
| `startDate` | ISO date | — | Filter expenses from this date |
| `endDate` | ISO date | — | Filter expenses to this date |
| `sortBy` | string | `expenseDate` | Sort field |
| `order` | `asc`/`desc` | `desc` | Sort direction |

**Example Request:**
```
GET /api/expenses?page=1&limit=10&category=Food&startDate=2026-07-01&endDate=2026-07-31
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Expenses retrieved successfully",
  "data": {
    "expenses": [
      {
        "id": "c9d8e7f6-a5b4-3c2d-1e0f-9a8b7c6d5e4f",
        "title": "Lunch at Cafe Coffee Day",
        "amount": "450.00",
        "category": "Food",
        "expenseDate": "2026-07-10T12:30:00.000Z",
        "notes": "Team lunch",
        "tags": ["team", "lunch"],
        "receiptUrl": null,
        "isDeleted": false,
        "createdAt": "2026-07-10T12:35:00.000Z",
        "updatedAt": "2026-07-10T12:35:00.000Z",
        "userId": "a3f5b7c8-9d0e-1f2a-3b4c-5d6e7f8a9b0c"
      }
    ],
    "pagination": {
      "total": 47,
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### POST `/expenses`

Create a new expense.

**Authentication:** ✅ Required

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | string | ✅ | 1–100 characters |
| `amount` | number | ✅ | Positive decimal |
| `category` | string | ✅ | One of: `Food`, `Travel`, `Bills`, `Shopping`, `Education`, `Entertainment`, `Health`, `Other` |
| `expenseDate` | ISO date | Optional | Defaults to now |
| `notes` | string | Optional | — |
| `tags` | string[] | Optional | — |
| `receiptUrl` | string | Optional | Valid URL |

```json
{
  "title": "Monthly Internet Bill",
  "amount": 999.00,
  "category": "Bills",
  "expenseDate": "2026-07-01",
  "notes": "BSNL broadband",
  "tags": ["monthly", "utilities"]
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "expense": {
      "id": "d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a",
      "title": "Monthly Internet Bill",
      "amount": "999.00",
      "category": "Bills",
      ...
    }
  }
}
```

---

### GET `/expenses/:id`

Retrieve a single expense by ID.

**Authentication:** ✅ Required

**Path Parameter:** `id` — Expense UUID

**Response `200`:**
```json
{
  "success": true,
  "message": "Expense retrieved successfully",
  "data": {
    "expense": { ... }
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `404` | Expense not found or belongs to another user |

---

### PUT `/expenses/:id`

Update an existing expense.

**Authentication:** ✅ Required

**Path Parameter:** `id` — Expense UUID

**Request Body:** Same as POST `/expenses` (all fields optional)

**Response `200`:**
```json
{
  "success": true,
  "message": "Expense updated successfully",
  "data": {
    "expense": { ... }
  }
}
```

---

### DELETE `/expenses/:id`

Soft-delete an expense. The record is preserved in the database with `isDeleted: true`.

**Authentication:** ✅ Required

**Path Parameter:** `id` — Expense UUID

**Response `200`:**
```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

---

### GET `/expenses/stats/summary`

Get aggregate spending statistics for the authenticated user.

**Authentication:** ✅ Required

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `month` | number (1–12) | Filter by month |
| `year` | number | Filter by year |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "totalExpenses": 47,
    "totalAmount": "28450.75",
    "monthlyAmount": "8320.00",
    "dailyAverage": "268.39",
    "topCategory": "Food"
  }
}
```

---

### GET `/expenses/stats/category`

Get expense totals grouped by category.

**Authentication:** ✅ Required

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "breakdown": [
      { "category": "Food", "total": "12500.00", "count": 23 },
      { "category": "Bills", "total": "8200.00", "count": 5 },
      { "category": "Travel", "total": "4750.75", "count": 8 }
    ]
  }
}
```
