# Authentication Flow

> **ExpenseFlow** — Complete authentication and session management documentation

---

## Overview

ExpenseFlow implements a **dual-mode authentication system**:

1. **Local Auth** — Email + password with JWT access/refresh token rotation
2. **Google OAuth 2.0** — Sign in with Google using Identity Services

Both flows return the same token pair (`accessToken` + `refreshToken`) and user object, making the client-side handling identical.

---

## JWT Token Architecture

### Access Token

| Property | Value |
|----------|-------|
| Algorithm | HS256 |
| Payload | `{ id, role, iat, exp }` |
| Expiry | 15 minutes |
| Storage | JavaScript memory (not localStorage) — set via `useAuth` context |
| Transport | `Authorization: Bearer <token>` header |

### Refresh Token

| Property | Value |
|----------|-------|
| Type | Opaque random string (64 hex chars) |
| Expiry | 7 days |
| Storage | PostgreSQL `RefreshToken` table |
| Transport | Request body `{ refreshToken: "..." }` |

### Why This Design?

- Short-lived access tokens limit the damage window if a token is compromised
- Refresh tokens are rotated on every use — a stolen old refresh token becomes useless after first reuse
- Server-side refresh token storage enables **instant revocation** (logout-all capability)

---

## Local Auth Flow

### Registration

```
Client                           Server                      Database
  │                                 │                            │
  │── POST /auth/register ─────────▶│                            │
  │   { name, email, password }     │                            │
  │                                 │── Validate input           │
  │                                 │── Check email uniqueness──▶│
  │                                 │◀── unique OK               │
  │                                 │── bcrypt.hash(password)    │
  │                                 │── crypto.randomBytes(32)   │
  │                                 │   (verificationToken)      │
  │                                 │── prisma.user.create() ───▶│
  │                                 │◀── User created            │
  │                                 │── jwt.sign({ id, role })   │
  │                                 │── Create RefreshToken ─────▶│
  │                                 │── sendVerificationEmail()  │
  │◀── 201 { accessToken,           │                            │
  │          refreshToken, user }   │                            │
```

### Login

```
Client                           Server                      Database
  │                                 │                            │
  │── POST /auth/login ────────────▶│                            │
  │   { email, password }           │                            │
  │                                 │── Validate input           │
  │                                 │── prisma.user.findUnique──▶│
  │                                 │◀── User record             │
  │                                 │── bcrypt.compare()         │
  │                                 │── Check isDisabled flag    │
  │                                 │── jwt.sign({ id, role })   │
  │                                 │── Create RefreshToken ─────▶│
  │                                 │── logActivity(LOGIN)───────▶│
  │◀── 200 { accessToken,           │                            │
  │          refreshToken, user }   │                            │
```

---

## Google OAuth Flow

```
Client                      Google                    Server                 Database
  │                            │                         │                       │
  │── User clicks             │                         │                       │
  │   "Sign in with Google"   │                         │                       │
  │                            │                         │                       │
  │◀── Google popup ──────────│                         │                       │
  │    (select account)        │                         │                       │
  │                            │                         │                       │
  │── User authorizes ────────▶│                         │                       │
  │                            │── Returns credential   │                       │
  │◀── idToken ───────────────│                         │                       │
  │                            │                         │                       │
  │── POST /auth/google ───────────────────────────────▶│                       │
  │   { idToken }              │                         │                       │
  │                            │                         │── googleClient        │
  │                            │                         │   .verifyIdToken()    │
  │                            │◀────────────────────────│── Verify with Google  │
  │                            │── Returns payload       │                       │
  │                            │   { email, name, sub }  │                       │
  │                            │────────────────────────▶│                       │
  │                            │                         │── findUnique(email)──▶│
  │                            │                         │◀── user or null       │
  │                            │                         │── create/update user─▶│
  │                            │                         │── jwt.sign()          │
  │                            │                         │── Create RefreshToken▶│
  │◀─────────────────────────────────────────────────────│                       │
  │   { accessToken, refreshToken, user }                │                       │
```

---

## Token Refresh Flow

```
Client                           Server                      Database
  │                                 │                            │
  │  (access token expires)         │                            │
  │                                 │                            │
  │── POST /auth/refresh ──────────▶│                            │
  │   { refreshToken }              │                            │
  │                                 │── findUnique(token) ──────▶│
  │                                 │◀── RefreshToken record     │
  │                                 │── Check isRevoked: false   │
  │                                 │── Check expiresAt > now()  │
  │                                 │── Revoke old token ────────▶│
  │                                 │── jwt.sign (new access)    │
  │                                 │── Create new RefreshToken─▶│
  │◀── 200 { accessToken (new),     │                            │
  │          refreshToken (new) }   │                            │
```

---

## Protected Route Flow

```
Client                           Server
  │                                 │
  │── GET /api/expenses ───────────▶│
  │   Authorization: Bearer <token> │
  │                                 │── auth.middleware.js
  │                                 │── jwt.verify(token, JWT_SECRET)
  │                                 │
  │                                 │   [Token Valid?]
  │                                 │   ├── YES: attach req.user = { id, role }
  │                                 │   │         → proceed to controller
  │                                 │   │
  │                                 │   └── NO:  throw AppError(401)
  │                                 │             → error.middleware sends 401
  │◀── 401 Unauthorized ───────────│
  │                                 │
  │  (Axios response interceptor)   │
  │  → clears localStorage          │
  │  → window.location = '/login'   │
```

---

## Frontend Auth State Machine

The `useAuth` hook manages auth state as a simple state machine:

```
                    ┌─────────────────┐
                    │   INITIALIZING  │
                    │  (isLoading: true)│
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    [token in localStorage]       [no token or invalid]
              │                             │
              ▼                             ▼
    ┌──────────────────┐         ┌────────────────────┐
    │  VERIFYING TOKEN │         │  UNAUTHENTICATED   │
    │  (GET /profile)  │         │  isAuthenticated:  │
    └────────┬─────────┘         │  false             │
             │                   └────────────────────┘
    ┌────────┴────────┐
    │                 │
  [200 OK]       [401 Error]
    │                 │
    ▼                 ▼
┌──────────────┐  ┌────────────────────┐
│ AUTHENTICATED│  │  UNAUTHENTICATED   │
│ isAuthenticated│  │  (clears storage)  │
│ true         │  └────────────────────┘
└──────────────┘
```

---

## Session Storage

| Item | Storage | Value |
|------|---------|-------|
| `token` | `localStorage` | JWT access token string |
| `user` | `localStorage` | JSON-serialized user object |

**Why localStorage instead of httpOnly cookies?**

For this architecture, localStorage is used for simplicity in a cross-origin SPA setup. In a same-origin deployment, httpOnly cookies would be preferred to prevent XSS token theft. The current implementation includes XSS mitigation via Content Security Policy headers.

---

## Password Reset Flow

```
1. User submits email to POST /auth/forgot-password
2. Server generates crypto.randomBytes(32) token
3. Server hashes the token and stores as passwordResetToken in User
4. Server stores passwordResetExpires = now() + 10 minutes
5. Server sends email with: https://app.com/reset-password?token=<raw_token>
6. User clicks link → frontend extracts token from URL
7. Frontend sends POST /auth/reset-password { token, newPassword }
8. Server hashes incoming token, finds user with matching hash
9. Server checks passwordResetExpires > now()
10. Server bcrypt.hashes newPassword, updates user record
11. Server clears passwordResetToken and passwordResetExpires
12. User can now login with new password
```

---

## Security Hardening

| Attack Vector | Mitigation |
|---------------|------------|
| Password brute force | Rate limiting on `/auth/login` (planned) |
| Token theft (XSS) | Short 15m expiry on access token |
| Refresh token replay | Token rotation — old token revoked on use |
| Session hijacking | Logout-all endpoint revokes all tokens |
| Email enumeration | Forgot password always returns 200 |
| Account takeover | Email verification + password reset token expiry |
| Google token forgery | Tokens verified server-side via Google Auth Library |
| User data leakage | All DB queries are user-scoped by `userId` |
