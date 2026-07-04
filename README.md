# ExpenseFlow

A full-stack personal expense tracking system with a RESTful API backend and a React analytics dashboard. Built to practice layered backend architecture, JWT-based authentication, and data aggregation with PostgreSQL.

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?logo=swagger&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

---

## Overview

ExpenseFlow lets users log, categorize, and analyze their personal expenses through a secure REST API. The backend follows a three-tier architecture (Controller → Service → ORM) and includes dashboard statistics and monthly analytics endpoints. The React frontend provides a visual dashboard built on top of the same API.

**Problem it solves:** Most people have no structured record of where their money goes. This project provides a personal API-first solution for tracking spending patterns over time, with category breakdowns and monthly trends available as queryable endpoints.

---

## Features

### Authentication
- User registration and login with hashed passwords (bcrypt, 10 rounds)
- JWT-based stateless authentication with configurable expiry
- Profile retrieval and update
- Logout with client-side token removal strategy

### Expense Management
- Create, read, update expenses with full input validation
- Soft delete with restore — data is never permanently lost
- Paginated list with search, category filter, date range filter, and sort by amount or date
- Per-user data isolation (every query is scoped to the authenticated user)

### Analytics & Dashboard
- Total spending and expense count across active records
- Spending breakdown by category (aggregated totals)
- Top categories ranked by total spend
- Monthly summary for the last 6 months
- Detailed monthly breakdown grouped by category
- 10 most recent transactions

### Security
- All sensitive routes protected by `protect` middleware
- `express-validator` schemas reject malformed input before reaching business logic
- Parameterized queries via Prisma prevent SQL injection
- Global error handler separates operational errors from programming bugs

---

## Project Structure

```
ExpenseFlow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Data models, enums, indexes
│   │   └── seed.js             # Development seed script
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js           # Prisma client singleton
│   │   │   └── swagger.js      # OpenAPI spec configuration
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   └── expense.controller.js
│   │   ├── docs/
│   │   │   └── postman_collection.json
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT verification, attaches req.user
│   │   │   ├── error.middleware.js
│   │   │   └── validate.js     # express-validator result checker
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   └── expense.routes.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   └── expense.service.js
│   │   ├── utils/
│   │   │   ├── appError.js     # Custom operational error class
│   │   │   └── catchAsync.js   # Async error forwarding wrapper
│   │   ├── validators/
│   │   │   ├── auth.validators.js
│   │   │   └── expense.validators.js
│   │   ├── app.js              # Express app setup and middleware chain
│   │   └── server.js           # HTTP server entry point
│   ├── .env                    # Environment variables (gitignored)
│   ├── package.json
│   ├── render.yaml             # Render deployment config
│   └── railway.json            # Railway deployment config
│
└── frontend/
    ├── src/
    │   ├── components/ui/      # Button, Card, Input, Modal, Badge, Skeleton
    │   ├── features/           # Feature-sliced auth and expense modules
    │   ├── hooks/              # useAuth and other custom hooks
    │   ├── layouts/            # AppLayout (sidebar), AuthLayout
    │   ├── pages/              # Dashboard, Expenses, Analytics, Profile, Settings
    │   ├── routes/             # React Router v6 + PrivateRoute guard
    │   ├── services/           # Axios instance + typed API calls
    │   ├── types/              # Shared TypeScript interfaces
    │   └── utils/              # Currency and date formatters
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts          # Vite + /api proxy to :5001
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│               HTTP Client               │
│         (React Dashboard / curl)        │
└───────────────────┬─────────────────────┘
                    │  HTTP Request
                    ▼
┌─────────────────────────────────────────┐
│             Express Router              │
│    auth.routes.js / expense.routes.js   │
└──────┬─────────────────────────┬────────┘
       │                         │
       ▼                         ▼
  Middleware               Middleware
  (JWT protect)        (express-validator)
       │                         │
       └─────────┬───────────────┘
                 ▼
    ┌────────────────────────┐
    │       Controller       │  — Validates req/res, delegates
    │  auth / expense        │
    └────────────┬───────────┘
                 ▼
    ┌────────────────────────┐
    │        Service         │  — Business logic, error throws
    │  auth / expense        │
    └────────────┬───────────┘
                 ▼
    ┌────────────────────────┐
    │      Prisma ORM        │  — Type-safe query builder
    └────────────┬───────────┘
                 ▼
    ┌────────────────────────┐
    │      PostgreSQL 16     │  — Relational data store
    └────────────────────────┘
```

Request errors at any layer bubble up via `next(err)` to the global error handler, which differentiates operational errors (returned as structured JSON) from unexpected failures (logged, generic 500).

---

## Database Design

See [`docs/DATABASE_DESIGN.md`](docs/DATABASE_DESIGN.md) for full schema documentation.

**User model** — stores credentials and owns all related expenses via a `userId` foreign key with cascade delete.

**Expense model** — `amount` stored as `Decimal(10,2)` for precision. Soft deletion via `isDeleted` boolean and `deletedAt` timestamp instead of hard deletes. Indexed on `userId`, `category`, `expenseDate`, and `isDeleted` to support common query patterns.

**Categories:** `Food`, `Travel`, `Bills`, `Shopping`, `Education`, `Entertainment`, `Health`, `Other`

---

## API Endpoints

Full request/response documentation: [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md)

### Authentication — `/api/auth`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login and receive JWT |
| GET | `/api/auth/profile` | ✓ | Get current user profile |
| PUT | `/api/auth/profile` | ✓ | Update name or email |
| POST | `/api/auth/logout` | ✓ | Client-side logout |

### Expenses — `/api/expenses`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/expenses` | ✓ | Create expense |
| GET | `/api/expenses` | ✓ | List (paginated, filtered, sorted) |
| GET | `/api/expenses/:id` | ✓ | Get single expense |
| PUT | `/api/expenses/:id` | ✓ | Update expense |
| DELETE | `/api/expenses/:id` | ✓ | Soft delete |
| PATCH | `/api/expenses/:id/restore` | ✓ | Restore deleted expense |

### Dashboard — `/api/expenses/dashboard`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/expenses/dashboard/stats` | ✓ | Total spent, count, category summary |
| GET | `/api/expenses/dashboard/recent` | ✓ | 10 most recent transactions |

### Analytics — `/api/expenses/analytics`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/expenses/analytics/category` | ✓ | Spending total per category |
| GET | `/api/expenses/analytics/top-categories` | ✓ | Top categories by spend |
| GET | `/api/expenses/analytics/monthly-summary` | ✓ | Monthly totals (last 6 months) |
| GET | `/api/expenses/analytics/monthly-detail` | ✓ | Monthly totals grouped by category |

---

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Run migrations and generate Prisma client
npx prisma migrate dev --name init
npx prisma generate

# Optional: seed the database with sample data
npm run db:seed

# Start development server
npm run dev
# → http://localhost:5001
# → http://localhost:5001/api-docs  (Swagger UI)
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

The Vite dev server proxies all `/api` requests to `http://localhost:5001`.

---

## Environment Variables

```env
# backend/.env
PORT=5001
NODE_ENV=development
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/expenseflow
JWT_SECRET=your-minimum-32-character-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

---

## API Documentation

Interactive Swagger UI is available at `http://localhost:5001/api-docs` when the server is running. All endpoints are documented with request schemas, response shapes, and authentication requirements.

A Postman collection is available at `backend/src/docs/postman_collection.json`. Import it directly into Postman and set the `base_url` and `token` collection variables.

---

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for step-by-step guides.

- **Render:** uses `backend/render.yaml`
- **Railway:** uses `backend/railway.json`

---

## Documentation

| File | Contents |
|------|----------|
| [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md) | Every endpoint with request/response examples |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Layer design and request lifecycle |
| [`docs/DATABASE_DESIGN.md`](docs/DATABASE_DESIGN.md) | Schema, indexes, and design decisions |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Render and Railway deployment guides |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Auth, validation, and error strategy |
| [`docs/TESTING.md`](docs/TESTING.md) | Testing with Swagger and Postman |

---

## Roadmap

- [ ] Budget goals per category with overspend alerts
- [ ] Recurring expense scheduling
- [ ] Multi-currency support with exchange rate conversion
- [ ] CSV/PDF export of expense reports
- [ ] Email summaries (weekly/monthly) via SendGrid or Resend

---

## Author

**Ankit Singh**
Backend engineer in training. This project was built to practice layered API design, database modeling, and full-stack integration.

---

## License

[MIT](LICENSE)
