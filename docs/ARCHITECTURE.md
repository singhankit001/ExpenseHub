# System Architecture

> **ExpenseFlow** — Personal Finance Intelligence Platform  
> Complete technical architecture reference for contributors and evaluators.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Authentication Lifecycle](#authentication-lifecycle)
6. [Request Lifecycle](#request-lifecycle)
7. [Database Architecture](#database-architecture)
8. [State Management](#state-management)
9. [Security Model](#security-model)
10. [Scalability Considerations](#scalability-considerations)

---

## System Overview

ExpenseFlow is a **monorepo** containing two independent deployable applications:

| Layer | Technology | Port |
|-------|-----------|------|
| Frontend SPA | React 19 + Vite | `5173` |
| REST API | Node.js + Express | `5001` |
| Database | PostgreSQL 15 + Prisma | `5432` |

Communication between layers happens over **HTTP/HTTPS with JSON payloads**. The frontend does not embed any business logic — all calculations, validation, and data mutations happen server-side.

---

## High-Level Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                             BROWSER / CLIENT                              │
│                                                                           │
│   ┌───────────────────────────────────────────────────────────────────┐   │
│   │                     React 19 SPA (Vite)                           │   │
│   │                                                                   │   │
│   │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │   │
│   │  │  Auth Layer  │  │  Page Layer  │  │   Component Library      │ │   │
│   │  │  useAuth()   │  │  React Router│  │  Input, Modal, Card,     │ │   │
│   │  │  AuthContext │  │  PrivateRoute│  │  Button, Background      │ │   │
│   │  └──────┬───────┘  └──────┬───────┘  └──────────────────────────┘ │   │
│   │         │                 │                                         │   │
│   │  ┌──────▼─────────────────▼────────────────────────────────────┐  │   │
│   │  │                 TanStack Query Layer                         │  │   │
│   │  │   QueryClient — cache, background refetch, error states      │  │   │
│   │  └──────────────────────────┬───────────────────────────────────┘  │   │
│   │                             │                                       │   │
│   │  ┌──────────────────────────▼───────────────────────────────────┐  │   │
│   │  │              Services Layer (Axios)                          │  │   │
│   │  │   authService, expenseService — axios.create('/api')         │  │   │
│   │  │   Request interceptor: injects Bearer token from localStorage│  │   │
│   │  │   Response interceptor: handles 401 → redirect to /login     │  │   │
│   │  └──────────────────────────┬───────────────────────────────────┘  │   │
│   └─────────────────────────────┼─────────────────────────────────────┘    │
└─────────────────────────────────┼──────────────────────────────────────────┘
                                  │ HTTPS  REST/JSON
                                  │ Proxy: /api → :5001 (Vite dev server)
┌─────────────────────────────────▼──────────────────────────────────────────┐
│                             API SERVER                                      │
│                                                                            │
│   ┌────────────────────────────────────────────────────────────────────┐   │
│   │                     Express.js Application                         │   │
│   │                                                                    │   │
│   │  CORS → Helmet → Morgan → Rate Limiter → Body Parser               │   │
│   │                           │                                        │   │
│   │              ┌────────────┼──────────────┐                         │   │
│   │              │            │              │                         │   │
│   │     /api/auth/*    /api/expenses/*   /api-docs                     │   │
│   │              │            │              │                         │   │
│   │     ┌────────▼────┐  ┌────▼────────┐   Swagger UI                 │   │
│   │     │Auth Middleware│  │Auth Middleware│                            │   │
│   │     │Validator     │  │Validator     │                             │   │
│   │     └────────┬────┘  └────┬────────┘                              │   │
│   │              │            │                                        │   │
│   │     ┌────────▼────┐  ┌────▼────────┐                              │   │
│   │     │Auth Controller│ │Expense      │                              │   │
│   │     └────────┬────┘  │Controller   │                              │   │
│   │              │        └────┬────────┘                              │   │
│   │     ┌────────▼────┐  ┌────▼────────┐                              │   │
│   │     │Auth Service │  │Expense      │                              │   │
│   │     │(JWT/bcrypt/ │  │Service      │                              │   │
│   │     │Google OAuth)│  │(Prisma)     │                              │   │
│   │     └────────┬────┘  └────┬────────┘                              │   │
│   └──────────────┼────────────┼──────────────────────────────────────┘   │
└──────────────────┼────────────┼──────────────────────────────────────────┘
                   │ Prisma ORM │
┌──────────────────▼────────────▼──────────────────────────────────────────┐
│                          PostgreSQL 15                                    │
│                                                                           │
│   ┌──────────┐    ┌──────────────┐    ┌─────────────┐                    │
│   │   User   │───▶│ RefreshToken │    │   Expense   │                    │
│   │          │    │              │    │             │                    │
│   │ id (PK)  │    │ id (PK)      │    │ id (PK)     │                    │
│   │ email UQ │    │ token UQ     │    │ userId (FK) │                    │
│   │ provider │    │ userId (FK)  │    │ category    │                    │
│   │ googleId │    │ expiresAt    │    │ amount      │                    │
│   │ role     │    │ isRevoked    │    │ isDeleted   │                    │
│   └──────────┘    └──────────────┘    └─────────────┘                    │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Layer Responsibilities

```
src/
├── main.tsx               # Root: GoogleOAuthProvider, QueryClientProvider, AuthProvider, RouterProvider
├── routes/index.tsx        # Route tree: public routes, AuthLayout-wrapped auth routes, PrivateRoute-guarded app routes
├── layouts/
│   ├── AppLayout.tsx      # Authenticated shell — sidebar navigation, mobile drawer, user info
│   └── AuthLayout.tsx     # Unauthenticated shell — branded split panel, loading/redirect guard
├── hooks/
│   └── useAuth.tsx        # Auth context: user state, token, login/register/logout actions
├── services/
│   ├── api.ts             # Axios instance: baseURL, request interceptor (token), response interceptor (401 handler)
│   └── auth.service.ts    # Auth API calls: typed with ApiResponse<AuthResponse>
└── components/            # Reusable UI primitives and domain components
```

### Design System

The visual design system is implemented entirely in **Tailwind CSS v4** with custom `@theme` tokens:

| Token Group | Purpose |
|---|---|
| `--color-brand-*` | Primary indigo-blue palette (oklch) |
| `--color-surface-*` | Dark charcoal neutrals for backgrounds and text |
| `--color-accent-*` | Emerald, violet, gold, blue secondary accents |
| `--shadow-card/modal/glass` | Layered depth shadows for glassmorphism |
| `--font-sans` | Outfit → Inter → system fallback |

### Routing Strategy

- All routes are defined in `src/routes/index.tsx` using React Router v6 object syntax
- Pages are lazy-loaded with `React.lazy()` and wrapped in `<Suspense>`
- Protected routes use a `<PrivateRoute>` wrapper that reads `isAuthenticated` from `useAuth()`
- Auth routes (login, register) are wrapped in `<AuthLayout>` which auto-redirects authenticated users to `/dashboard`

---

## Backend Architecture

### Layer Separation

```
Controller → receives HTTP request, calls Service, sends HTTP response
Service    → contains all business logic, calls Prisma, throws AppErrors
Middleware → cross-cutting concerns (auth, validation, error handling)
Utils      → pure functions (token signing, email sending, audit logging)
```

### Middleware Chain

Every request passes through this chain in order:

```
CORS
  ↓
Helmet (security headers)
  ↓
Morgan (request logging)
  ↓
express.json() (body parser)
  ↓
Route-specific middleware:
  └─ Auth Middleware (JWT verification)
  └─ Validator (express-validator rules)
  └─ Validate Middleware (check for validation errors)
  ↓
Controller
  ↓
Error Middleware (global error handler — last in chain)
```

### Error Handling Strategy

All errors are funneled through a single `errorMiddleware` handler:

- **Operational errors** (`AppError` instances): returned with their `statusCode` and `message`
- **Prisma P2002** (unique constraint): translated to a 400 with a user-friendly message
- **Prisma P2025** (not found): translated to a 404
- **PrismaClientValidationError**: translated to a 400 "Invalid schema fields"
- **JWT errors**: translated to 401 messages
- **Unknown errors**: logged to console, generic 500 returned in production

---

## Authentication Lifecycle

```
REGISTER                          LOGIN
─────────                         ─────
1. Validate input                 1. Validate input
2. Check email uniqueness         2. Find user by email
3. Hash password (bcrypt/12)      3. Compare password (bcrypt.compare)
4. Generate verificationToken     4. Check isDisabled flag
5. Create User in DB              5. Sign accessToken (JWT, 15m)
6. Sign accessToken               6. Create RefreshToken record in DB
7. Create RefreshToken in DB      7. Log LOGIN audit event
8. Send verification email        8. Return { accessToken, refreshToken, user }
9. Log REGISTER audit event
10. Return { accessToken, refreshToken, user }

TOKEN REFRESH (rotation)
────────────────────────
1. Receive refreshToken in body
2. Look up token in DB (not revoked, not expired)
3. Revoke old refresh token (isRevoked = true)
4. Sign new accessToken
5. Create new RefreshToken record
6. Return { accessToken, refreshToken }
```

---

## Request Lifecycle

A typical authenticated request (e.g., GET /api/expenses):

```
Browser
  │
  ├─ 1. Axios adds Authorization: Bearer <accessToken>
  ↓
Express Router
  │
  ├─ 2. auth.middleware.js: jwt.verify(token, JWT_SECRET)
  │      - Attaches decoded { id, role } to req.user
  │      - Throws 401 if invalid/expired
  ↓
expense.controller.js
  │
  ├─ 3. Extracts query params (page, limit, category, search)
  ↓
expense.service.js
  │
  ├─ 4. Builds Prisma where clause (userId, category, isDeleted: false)
  ├─ 5. Runs prisma.expense.findMany() with pagination
  ├─ 6. Runs prisma.expense.count() for total count
  │
  ↓
expense.controller.js
  │
  └─ 7. Returns 200 JSON with { expenses, pagination }
```

---

## Database Architecture

### Schema Summary

| Model | Primary Key | Key Constraints |
|---|---|---|
| `User` | `uuid()` | `email` UNIQUE, `googleId` UNIQUE |
| `RefreshToken` | `uuid()` | `token` UNIQUE, CASCADE delete on User |
| `Expense` | `uuid()` | FK to User, CASCADE delete |

### Indexes

| Table | Indexed Columns | Reason |
|---|---|---|
| `RefreshToken` | `userId` | Fast revocation lookups |
| `Expense` | `userId` | All expense queries are user-scoped |
| `Expense` | `category` | Category filter queries |
| `Expense` | `expenseDate` | Date range queries |
| `Expense` | `isDeleted` | Soft delete filter on every query |

### Soft Delete Pattern

Expenses use soft deletion (`isDeleted: Boolean`, `deletedAt: DateTime?`) rather than hard `DELETE` statements. This:
- Preserves historical data for analytics
- Allows accidental deletion recovery
- Maintains referential integrity for audit logs

All service queries include `where: { isDeleted: false }` by default.

---

## State Management

| Type of State | Tool | Location |
|---|---|---|
| Server state (expenses, stats) | TanStack Query | `useQuery`, `useMutation` per page |
| Auth state (user, token) | React Context | `useAuth()` → `AuthContext` |
| Form state | React Hook Form | Per-form, not persisted |
| UI state (modals, filters) | `useState` | Local to component |

### TanStack Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,        // 1 minute before refetch
      retry: 1,                 // One retry on failure
      refetchOnWindowFocus: true,
    },
  },
});
```

---

## Security Model

| Layer | Control | Implementation |
|---|---|---|
| Transport | HTTPS only in production | Enforced by hosting provider |
| Authentication | JWT + Refresh Token rotation | `auth.middleware.js` |
| Authorization | User-scoped queries | All DB queries filter by `userId` |
| Input | Schema validation | `express-validator` per route |
| Passwords | Hashed + salted | bcrypt cost factor 12 |
| Tokens | Short-lived, rotated | 15m access, 7d refresh |
| Errors | Sanitized in production | `error.middleware.js` |
| OAuth | Server-side token verification | Google Auth Library |

---

## Scalability Considerations

### Current Architecture Constraints
- Single Node.js process — vertical scaling only
- Sessions stored in PostgreSQL — works up to moderate load

### Horizontal Scaling Path
1. **Add a Redis cache** for refresh token storage (removes DB lookup per request)
2. **Add a load balancer** (Nginx or AWS ALB) in front of multiple Node.js instances
3. **Add connection pooling** with PgBouncer for PostgreSQL connection management
4. **Add a CDN** (Cloudflare) in front of the Vite SPA for global edge delivery

### Database Scaling Path
1. **Read replicas** for analytics queries (reports, stats summaries)
2. **Partitioning** the Expense table by `userId` once user count exceeds 100k
3. **Archival strategy** for expenses older than 2 years (move to cold storage)
