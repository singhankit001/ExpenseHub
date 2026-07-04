# Expense Tracker — Full-Stack Monorepo

A personal finance management system with a secure REST API backend and a premium React dashboard.

![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)

---

## Repository Structure

```
expense-tracker/
├── backend/              ← Express + Prisma REST API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/       (db.js, swagger.js)
│   │   ├── controllers/  (auth, expense)
│   │   ├── docs/         (postman_collection.json)
│   │   ├── middleware/   (auth, error, validate)
│   │   ├── routes/       (auth, expense)
│   │   ├── services/     (auth, expense)
│   │   ├── utils/        (appError, catchAsync)
│   │   ├── validators/   (auth, expense)
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   ├── package.json
│   ├── render.yaml
│   └── railway.json
│
└── frontend/             ← React 19 + Vite + TypeScript Dashboard
    ├── src/
    │   ├── components/ui/ (Button, Card, Input, Modal, Badge, Skeleton)
    │   ├── hooks/         (useAuth)
    │   ├── layouts/       (AppLayout, AuthLayout)
    │   ├── pages/         (Dashboard, Expenses, Analytics, Profile, Settings…)
    │   ├── routes/        (AppRoutes, PrivateRoute)
    │   ├── services/      (api, auth.service, expense.service)
    │   ├── types/         (index.ts)
    │   └── utils/         (formatters, helpers)
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## Backend Setup

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run dev        # → http://localhost:5001
```

**Required `backend/.env`:**
```
PORT=5001
NODE_ENV=development
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/expense_tracker
JWT_SECRET=your-very-strong-secret-key
JWT_EXPIRES_IN=7d
```

**API Documentation:** `http://localhost:5001/api-docs`

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev        # → http://localhost:5173
```

The Vite dev server proxies all `/api` requests to `http://localhost:5001` automatically.

**To build for production:**
```bash
npm run build
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register a new user |
| POST | `/api/auth/login` | — | Login and receive JWT |
| GET | `/api/auth/profile` | ✅ | Get current user profile |
| PUT | `/api/auth/profile` | ✅ | Update name / email |
| POST | `/api/auth/logout` | ✅ | Client-side logout |

### Expenses
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/expenses` | ✅ | Create expense |
| GET | `/api/expenses` | ✅ | List expenses (paginated, filtered, sorted) |
| GET | `/api/expenses/:id` | ✅ | Get single expense |
| PUT | `/api/expenses/:id` | ✅ | Update expense |
| DELETE | `/api/expenses/:id` | ✅ | Soft delete expense |
| PATCH | `/api/expenses/:id/restore` | ✅ | Restore soft-deleted expense |

### Dashboard & Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/expenses/dashboard/stats` | ✅ | Total spent, counts, category breakdown |
| GET | `/api/expenses/dashboard/recent` | ✅ | 10 most recent transactions |
| GET | `/api/expenses/analytics/category` | ✅ | Spending per category |
| GET | `/api/expenses/analytics/top-categories` | ✅ | Top spending categories |
| GET | `/api/expenses/analytics/monthly-summary` | ✅ | Monthly spending totals |
| GET | `/api/expenses/analytics/monthly-detail` | ✅ | Monthly breakdown by category |

---

## Architecture

### Backend
- **3-Tier Architecture**: Controllers → Services → Prisma ORM
- **Security**: JWT, bcrypt (10 rounds), parameterized queries
- **Error Handling**: Global error middleware with dev/prod separation
- **Validation**: `express-validator` with strict enum whitelisting

### Frontend
- **State Management**: TanStack React Query for server state
- **Auth**: JWT stored in localStorage with auto-expiry logout
- **Forms**: `react-hook-form` + `zod` validation
- **Charts**: Recharts (Area + Pie + Bar)
- **Animations**: Framer Motion spring transitions

---

## Deployment

### Backend → Render
See `backend/render.yaml` for configuration.

### Backend → Railway
See `backend/railway.json` for configuration.
