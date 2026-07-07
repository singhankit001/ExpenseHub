# Database Schema

> **ExpenseFlow** — Complete database schema documentation  
> ORM: Prisma 5.x | Database: PostgreSQL 15

---

## Overview

ExpenseFlow uses a **PostgreSQL relational database** managed by Prisma ORM. The schema prioritizes:

- **Data integrity** via foreign key constraints with cascade deletes
- **Query performance** via strategic composite indexes
- **Soft deletion** to preserve expense history for analytics
- **Auditability** via `createdAt` / `updatedAt` timestamps on all models

---

## Entity-Relationship Diagram

```
┌──────────────────────────────────┐
│              User                │
├──────────────────────────────────┤
│ id             String   PK UUID  │
│ name           String            │
│ email          String   UNIQUE   │
│ password       String?           │
│ provider       AuthProvider      │ ──── enum: LOCAL | GOOGLE
│ googleId       String?  UNIQUE   │
│ role           Role              │ ──── enum: USER | ADMIN
│ isDisabled     Boolean  = false  │
│ isVerified     Boolean  = false  │
│ verificationToken  String?       │
│ passwordResetToken String?       │
│ passwordResetExpires DateTime?   │
│ createdAt      DateTime = now()  │
│ updatedAt      DateTime @updatedAt│
└──────┬──────────────────────┬────┘
       │ 1                    │ 1
       │                      │
       │ N                    │ N
┌──────▼───────────┐   ┌──────▼──────────────────────┐
│   RefreshToken   │   │          Expense             │
├──────────────────┤   ├──────────────────────────────┤
│ id       PK UUID │   │ id          PK UUID          │
│ token    UNIQUE  │   │ title       String           │
│ expiresAt DateTime│   │ amount      Decimal(10,2)   │
│ isRevoked Boolean │   │ category    Category        │ ── enum
│ createdAt DateTime│   │ expenseDate DateTime = now()│
│ userId   FK User │   │ notes       String?          │
└──────────────────┘   │ tags        String[]         │
                       │ receiptUrl  String?          │
                       │ isDeleted   Boolean = false  │
                       │ deletedAt   DateTime?        │
                       │ createdAt   DateTime = now() │
                       │ updatedAt   DateTime @updatedAt│
                       │ userId      FK User          │
                       └──────────────────────────────┘
```

---

## Models

### User

Represents an authenticated person using the platform.

```prisma
model User {
  id                   String         @id @default(uuid())
  name                 String
  email                String         @unique
  password             String?                           // nullable for Google-only accounts
  provider             AuthProvider   @default(LOCAL)
  googleId             String?        @unique            // links Google Identity
  role                 Role           @default(USER)
  isDisabled           Boolean        @default(false)    // admin-controlled account suspension
  isVerified           Boolean        @default(false)    // email verification state
  verificationToken    String?                           // used in verify-email flow
  passwordResetToken   String?                           // used in reset-password flow
  passwordResetExpires DateTime?                         // reset token expiry
  createdAt            DateTime       @default(now())
  updatedAt            DateTime       @updatedAt
  expenses             Expense[]
  refreshTokens        RefreshToken[]
}
```

**Key Design Decisions:**
- `password` is nullable to support Google OAuth users who never set a password
- `googleId` has a unique constraint to prevent account hijacking
- `isVerified` gates certain features that require email confirmation
- `isDisabled` allows administrators to suspend accounts without deleting data

---

### RefreshToken

Stores long-lived refresh tokens for session management across devices.

```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  expiresAt DateTime
  isRevoked Boolean  @default(false)
  createdAt DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

**Key Design Decisions:**
- Tokens are opaque random strings (not JWTs) stored hashed in the database
- `isRevoked` flag enables immediate invalidation without waiting for expiry
- `CASCADE` delete ensures tokens are cleaned up when a user is deleted
- The `@@index([userId])` makes per-user token revocation fast

**Token Rotation Flow:**
1. Client sends refresh token
2. Server finds token by value, verifies `isRevoked: false` and `expiresAt > now()`
3. Server sets `isRevoked = true` on the old token
4. Server creates a new RefreshToken record
5. Server returns the new token pair

---

### Expense

Represents a single financial transaction recorded by the user.

```prisma
model Expense {
  id          String    @id @default(uuid())
  title       String
  amount      Decimal   @db.Decimal(10, 2)
  category    Category
  expenseDate DateTime  @default(now())
  notes       String?
  tags        String[]
  receiptUrl  String?
  isDeleted   Boolean   @default(false)
  deletedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([category])
  @@index([expenseDate])
  @@index([isDeleted])
}
```

**Key Design Decisions:**
- `Decimal(10,2)` stores monetary amounts precisely — never use `Float` for money
- `expenseDate` is separate from `createdAt` to allow backdating (entering expenses after the fact)
- `tags` is a PostgreSQL array — efficient for simple tagging without a join table
- `receiptUrl` stores a URL to an uploaded image (Cloudinary or S3)
- Soft delete pattern: `isDeleted + deletedAt` preserves data while filtering it from normal queries

---

## Enums

### AuthProvider

```prisma
enum AuthProvider {
  LOCAL   // Email + password authentication
  GOOGLE  // Google OAuth 2.0
}
```

### Role

```prisma
enum Role {
  USER   // Standard end user — default
  ADMIN  // Platform administrator
}
```

### Category

```prisma
enum Category {
  Food
  Travel
  Bills
  Shopping
  Education
  Entertainment
  Health
  Other
}
```

---

## Indexes

| Table | Index | Columns | Type | Purpose |
|-------|-------|---------|------|---------|
| `User` | implicit | `email` | UNIQUE | Fast login lookups |
| `User` | implicit | `googleId` | UNIQUE | Fast OAuth lookups |
| `RefreshToken` | `@@index` | `userId` | B-Tree | Revoke all tokens for a user |
| `Expense` | `@@index` | `userId` | B-Tree | All expense queries are user-scoped |
| `Expense` | `@@index` | `category` | B-Tree | Category filter and group-by queries |
| `Expense` | `@@index` | `expenseDate` | B-Tree | Date range queries for reports |
| `Expense` | `@@index` | `isDeleted` | B-Tree | Soft delete filter on every query |

---

## Migrations

Prisma migrations are stored in `backend/prisma/migrations/`.

### Running Migrations

**Development (schema push — no migration file):**
```bash
npx prisma db push
```

**Production (tracked migration):**
```bash
npx prisma migrate deploy
```

**Generate Prisma Client after schema changes:**
```bash
npx prisma generate
```

**Open Prisma Studio (GUI):**
```bash
npx prisma studio
```

---

## Data Integrity Rules

| Rule | Enforcement |
|------|-------------|
| User email must be unique | `@unique` constraint |
| Google ID must be unique | `@unique` constraint |
| Expense amount must have max 2 decimal places | `@db.Decimal(10,2)` |
| Expense category must be a valid enum value | Prisma enum + PostgreSQL CHECK constraint |
| Deleting a user cascades to their expenses and tokens | `onDelete: Cascade` |
| Passwords are never stored in plaintext | Enforced at service layer (bcrypt) |

---

## Soft Delete Convention

All queries that list or retrieve expenses must include the soft-delete filter:

```typescript
// Always add this to expense queries
const expenses = await prisma.expense.findMany({
  where: {
    userId: req.user.id,
    isDeleted: false,   // ← Required
  },
});
```

When soft-deleting:

```typescript
await prisma.expense.update({
  where: { id, userId: req.user.id },
  data: {
    isDeleted: true,
    deletedAt: new Date(),
  },
});
```
