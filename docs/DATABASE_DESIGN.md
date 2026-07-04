# Database Design

ExpenseFlow uses a relational database model implemented on **PostgreSQL 16** and managed via **Prisma ORM**. The schema is optimized for lookup performance, referential integrity, and efficient analytics querying.

---

## 1. Schema Diagram & Entities

The entity relationship diagram consists of two main tables: `User` and `Expense`.

```
┌─────────────────────────────────┐          ┌─────────────────────────────────┐
│              User               │          │             Expense             │
├─────────────────────────────────┤          ├─────────────────────────────────┤
│  id         UUID (PK)           ├─1─────∞──┤  id          UUID (PK)          │
│  name       VARCHAR             │          │  title       VARCHAR            │
│  email      VARCHAR (Unique)    │          │  amount      DECIMAL(10, 2)     │
│  password   VARCHAR (Hashed)    │          │  category    ENUM (Category)    │
│  createdAt  TIMESTAMP           │          │  expenseDate TIMESTAMP          │
│  updatedAt  TIMESTAMP           │          │  notes       TEXT (Optional)    │
└─────────────────────────────────┘          │  isDeleted   BOOLEAN            │
                                             │  deletedAt   TIMESTAMP          │
                                             │  createdAt   TIMESTAMP          │
                                             │  updatedAt   TIMESTAMP          │
                                             │  userId      UUID (FK)          │
                                             └─────────────────────────────────┘
```

---

## 2. Table Specifications

### User Table
- **`id`**: Generates a standard random `UUID`. Ensures that IDs are non-sequential and secure.
- **`email`**: Marked as `@unique`. The system rejects registrations matching existing email records at the DB level, creating a reliable unique constraint.
- **`password`**: Stores the 60-character bcrypt hash string.

### Expense Table
- **`id`**: Generates a random `UUID`.
- **`amount`**: Stored as a high-precision `Decimal(10, 2)` instead of float. This guarantees exact floating-point math during summation and dashboard analytics, eliminating floating-point precision issues common with currency values.
- **`category`**: Relies on a PostgreSQL Native ENUM (`Category`) to guarantee input integrity:
  `Food`, `Travel`, `Bills`, `Shopping`, `Education`, `Entertainment`, `Health`, `Other`
- **`isDeleted` & `deletedAt`**: Implements the soft-delete model. When an expense is removed, `isDeleted` flips to `true` and the current date/time is saved. All standard SELECT queries run with `where: { isDeleted: false }` filter parameters.

---

## 3. Relationships & Referential Integrity

- There is a **One-to-Many** relationship between `User` and `Expense` (`User.id` ➔ `Expense.userId`).
- **Cascade Deletion:** The relation is configured with `onDelete: Cascade`. If a user account is deleted, the database automatically cascades cleanups to purge all associated expense entries. This avoids orphan records and ensures compliance with privacy regulations.

---

## 4. Indexing Strategy

To keep query response times flat as data sizes scale, four crucial database indexes are defined on the `Expense` table:

```prisma
@@index([userId])
@@index([category])
@@index([expenseDate])
@@index([isDeleted])
```

### Why these indexes?
1. **`userId` Index:** Every select, create, or update query filters by the authenticated user's ID (`where: { userId }`). An index on this foreign key turns O(N) table scans into O(log N) index lookups.
2. **`isDeleted` Index:** Standard listings only display active records. Indexing this flag allows the query planner to quickly exclude soft-deleted data.
3. **`category` Index:** The analytics dashboard groups spending by category. By indexing this field, GROUP BY operations execute significantly faster.
4. **`expenseDate` Index:** Expense records are paginated and sorted chronologically (`orderBy: { expenseDate: 'desc' }`). The date index permits PostgreSQL to retrieve sorted results directly without executing an in-memory filesort.

---

## 5. Prisma Design Decisions

- **Client Singleton:** Standard instantiation of Prisma clients can leak connections during server hot-reloads. We store the client instance on `globalThis` during development to reuse the connection pool across updates.
- **Transactions:** Large dashboard aggregation queries are grouped inside a single `prisma.$transaction([])` call. This executes queries concurrently and guarantees atomic consistency when pulling stats.
- **Decimals to Float Conversion:** JavaScript does not have a native `Decimal` class. Standard decimals are parsed via Prisma's decimal class and cast to floats at the controller boundary to keep API payloads standard.
