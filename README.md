<div align="center">

# ⚡ ExpenseFlow

**Personal Finance Intelligence Platform**

*Take control of your money. Understand your habits. Build your future.*

[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-6366f1?style=for-the-badge)](CONTRIBUTING.md)

<br/>

> A production-grade, full-stack personal finance platform built with React 19, Node.js, and PostgreSQL.
> Track expenses, analyze spending behavior, monitor financial health, and make smarter money decisions — all in one beautifully designed dashboard.

<br/>

[**Live Demo**](https://expenseflow.vercel.app) · [**API Docs**](docs/API_REFERENCE.md) · [**Architecture**](docs/ARCHITECTURE.md) · [**Report a Bug**](https://github.com/singhankit001/ExpenseHub/issues) · [**Request Feature**](https://github.com/singhankit001/ExpenseHub/issues)

</div>

---

## 📸 Screenshots

<details>
<summary><b>Click to expand screenshots</b></summary>

| Landing Page | Dashboard |
|---|---|
| ![Landing](https://via.placeholder.com/600x380/0f0f17/6366f1?text=Landing+Page) | ![Dashboard](https://via.placeholder.com/600x380/0f0f17/6366f1?text=Dashboard) |

| Expenses | Reports & Analytics |
|---|---|
| ![Expenses](https://via.placeholder.com/600x380/0f0f17/6366f1?text=Expenses) | ![Reports](https://via.placeholder.com/600x380/0f0f17/6366f1?text=Reports) |

</details>

---

## 🚀 Product Vision

Most personal finance apps feel clinical, slow, or overwhelming. ExpenseFlow was built differently — starting from the belief that **financial clarity should be a daily habit, not a monthly chore**.

ExpenseFlow combines expense logging, behavioral analytics, and financial health scoring into a single, premium experience. It surfaces patterns in your spending, tells you where your money "leaks", and gives you an actionable Financial Health Score you can actually improve.

**The result:** A platform that feels as polished as Stripe, as insightful as a financial advisor, and as fast as a native app.

---

## ✨ Key Features

### 🔐 Authentication & Security
- **Local auth** with JWT access/refresh token rotation
- **Google OAuth 2.0** via Google Identity Services
- **Bcrypt** password hashing (cost factor 12)
- Email verification flow with secure tokenized links
- Password reset with time-limited tokens
- Multi-device session management with per-device logout

### 💸 Expense Management
- Create, read, update, and soft-delete expenses
- 8 categorization buckets: Food, Travel, Bills, Shopping, Education, Entertainment, Health, Other
- Tag-based organization for cross-category grouping
- Receipt URL attachment per expense
- Full-text search, date-range filtering, and category filtering
- Server-side pagination with configurable page size

### 📊 Analytics Dashboard
- Real-time stat cards: total spend, monthly spend, daily average, top category
- Financial Health Score with animated arc visualization and tier classification
- Category breakdown with proportional progress bars
- Recent transactions feed with formatted amounts and category badges
- Inline sparkline charts for trend visualization

### 📈 Reports
- Monthly and custom date-range reports
- Category-level expense aggregation
- Trend comparison (this period vs previous period)
- CSV and PDF export capability

### 🎯 Budget Management
- Per-category budget limit configuration
- Real-time spend vs budget progress visualization
- Over-budget alerts and warnings

### 🔄 Recurring Expenses
- Identify and track recurring subscription patterns
- Mark expenses as recurring for tracking continuity

### 🔔 Notifications
- In-app notification center
- Budget threshold alerts
- Spending pattern insights

### 🗂️ Audit Activity Log
- Chronological log of all user actions
- IP address and user agent tracking per event
- Filterable by action type

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  React 19 + TypeScript + Vite + TanStack Query               │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ Pages   │  │ Layouts  │  │ UI Comps │  │ Auth Hooks  │  │
│  └────┬────┘  └─────┬────┘  └─────┬────┘  └──────┬──────┘  │
│       └─────────────┴─────────────┴───────────────┘         │
│                         Services Layer                        │
│              (Axios + TanStack Query + localStorage)          │
└──────────────────────────────────┬───────────────────────────┘
                                   │ HTTPS / REST
┌──────────────────────────────────▼───────────────────────────┐
│                        API LAYER                             │
│  Express.js + Middleware Chain                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Auth MW │  │ Validate │  │ Rate Lmt │  │Error Handle│  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│       └─────────────┴─────────────┴───────────────┘         │
│                    Controllers → Services                     │
└──────────────────────────────────┬───────────────────────────┘
                                   │ Prisma ORM
┌──────────────────────────────────▼───────────────────────────┐
│                      DATA LAYER                              │
│              PostgreSQL 15 + Prisma Client                   │
│   ┌──────┐   ┌─────────────┐   ┌──────────┐                 │
│   │ User │   │RefreshToken │   │ Expense  │                 │
│   └──────┘   └─────────────┘   └──────────┘                 │
└──────────────────────────────────────────────────────────────┘
```

> See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full system design.

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI framework with concurrent features |
| TypeScript | 5.x | Static typing and IDE intelligence |
| Vite | 8.x | Build tooling with instant HMR |
| Tailwind CSS | 4.x | Utility-first design system with custom tokens |
| Framer Motion | 11.x | Declarative animations and micro-interactions |
| TanStack Query | 5.x | Server state, caching, and background sync |
| React Hook Form | 7.x | Performant forms with minimal re-renders |
| Zod | 3.x | Schema-based client-side validation |
| Recharts | 2.x | Composable SVG chart library |
| Axios | 1.x | HTTP client with interceptors |
| React Router | 6.x | Client-side routing |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | JavaScript runtime |
| Express.js | 4.x | HTTP server framework |
| Prisma | 5.x | Type-safe ORM with migrations |
| PostgreSQL | 15 | Primary relational database |
| JWT | — | Stateless access token authentication |
| bcrypt | — | Password hashing (cost factor 12) |
| Google Auth Library | — | Google OAuth ID token verification |
| express-validator | 7.x | Route-level input validation |
| nodemailer | — | Transactional email delivery |
| Swagger / OpenAPI | — | Interactive API documentation |
| Multer | — | File upload middleware |
| nodemon | — | Development auto-restart |

---

## 📁 Project Structure

```
ExpenseHub/
├── README.md
├── .gitignore
│
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── server.js              # Entry point — starts Express + DB connection
│   │   ├── app.js                 # Express app factory — mounts middleware & routes
│   │   ├── config/
│   │   │   └── db.js              # Prisma client singleton
│   │   ├── controllers/
│   │   │   ├── auth.controller.js # Auth route handlers
│   │   │   └── expense.controller.js
│   │   ├── services/
│   │   │   ├── auth.service.js    # Core auth business logic
│   │   │   └── expense.service.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js     # /api/auth/* + Swagger annotations
│   │   │   └── expense.routes.js  # /api/expenses/*
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js  # JWT verification guard
│   │   │   ├── validate.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── upload.middleware.js
│   │   ├── validators/
│   │   │   └── auth.validator.js  # express-validator rule sets
│   │   └── utils/
│   │       ├── appError.js        # Operational error class
│   │       ├── catchAsync.js      # Async route wrapper
│   │       ├── email.js           # Transactional email sender
│   │       └── auditLogger.js     # Activity audit log writer
│   └── prisma/
│       ├── schema.prisma          # Database schema & models
│       └── migrations/            # Prisma migration history
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx               # React root + providers
│       ├── index.css              # Tailwind + design tokens
│       ├── types/
│       │   └── index.ts           # Shared TypeScript interfaces
│       ├── services/
│       │   ├── api.ts             # Axios instance + interceptors
│       │   └── auth.service.ts    # Auth API calls
│       ├── hooks/
│       │   └── useAuth.tsx        # Auth context + state provider
│       ├── routes/
│       │   └── index.tsx          # React Router config + guards
│       ├── layouts/
│       │   ├── AppLayout.tsx      # Authenticated shell (sidebar + mobile nav)
│       │   └── AuthLayout.tsx     # Unauthenticated split-panel layout
│       ├── pages/
│       │   ├── LandingPage.tsx
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── ExpensesPage.tsx
│       │   ├── BudgetsPage.tsx
│       │   ├── ReportsPage.tsx
│       │   ├── RecurringPage.tsx
│       │   ├── NotificationsPage.tsx
│       │   ├── AuditActivityPage.tsx
│       │   ├── ProfilePage.tsx
│       │   └── SettingsPage.tsx
│       └── components/
│           ├── ui/
│           │   ├── input.tsx
│           │   ├── button.tsx
│           │   ├── card.tsx
│           │   ├── modal.tsx
│           │   ├── background.tsx
│           │   └── EmptyState.tsx
│           └── dashboard/
│               ├── HealthScore.tsx
│               ├── InsightCard.tsx
│               └── Sparkline.tsx
│
└── docs/
    ├── ARCHITECTURE.md
    ├── API_REFERENCE.md
    ├── DATABASE_SCHEMA.md
    ├── AUTHENTICATION_FLOW.md
    ├── FRONTEND_GUIDE.md
    ├── BACKEND_GUIDE.md
    ├── DEPLOYMENT_GUIDE.md
    ├── CONTRIBUTING.md
    └── CHANGELOG.md
```

---

## ⚙️ Installation Guide

### Prerequisites

Ensure you have the following installed:

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 18.0.0 | [nodejs.org](https://nodejs.org/) |
| npm | ≥ 9.0.0 | Bundled with Node.js |
| PostgreSQL | ≥ 14 | [postgresql.org](https://www.postgresql.org/download/) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

### 1. Clone the Repository

```bash
git clone https://github.com/singhankit001/ExpenseHub.git
cd ExpenseHub
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

### 3. Setup the Frontend

```bash
cd ../frontend
npm install
```

---

## 🔐 Environment Variables

### Backend — `backend/.env`

```env
# ─── Server ───────────────────────────────────────────────
NODE_ENV=development
PORT=5001

# ─── Database ─────────────────────────────────────────────
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/expenseflow

# ─── JWT ──────────────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_token_secret_also_32_chars
JWT_REFRESH_EXPIRES_IN=7d

# ─── Google OAuth ─────────────────────────────────────────
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com

# ─── Email (Nodemailer) ───────────────────────────────────
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM="ExpenseFlow <noreply@expenseflow.app>"

# ─── Client ───────────────────────────────────────────────
CLIENT_URL=http://localhost:5173
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

> ⚠️ **Never commit `.env` files.** Use `.env.example` as a template for collaborators.

---

## 🖥️ Running Locally

### 1. Initialize the Database

```bash
cd backend

# Push the schema to your PostgreSQL database
npx prisma db push

# (Optional) Open Prisma Studio to inspect data
npx prisma studio
```

### 2. Start the Backend

```bash
cd backend
npm run dev
# → Server running at http://localhost:5001
# → Swagger docs at http://localhost:5001/api-docs
```

### 3. Start the Frontend

```bash
cd frontend
npm run dev
# → App running at http://localhost:5173
```

### 4. Open the App

Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚀 Production Deployment

### Frontend — Vercel

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set these environment variables in your Vercel project dashboard:
- `VITE_API_URL` → your backend API URL (e.g. `https://api.expenseflow.app`)
- `VITE_GOOGLE_CLIENT_ID` → your Google OAuth client ID

### Backend — Railway / Render

1. Connect your GitHub repository to Railway or Render
2. Set all backend environment variables in the dashboard
3. The server will auto-deploy on every push to `main`

### Database — Neon / Supabase / Railway PostgreSQL

1. Create a PostgreSQL database instance
2. Copy the connection string into `DATABASE_URL`
3. Run `npx prisma db push` to initialize the schema

> See [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for the full production checklist.

---

## 📡 API Overview

Base URL: `http://localhost:5001/api` (development)

> Full API reference with request/response examples: [docs/API_REFERENCE.md](docs/API_REFERENCE.md)

### Authentication Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | — | Register a new user account |
| `POST` | `/auth/login` | — | Login with email and password |
| `POST` | `/auth/google` | — | Login or register with Google OAuth |
| `POST` | `/auth/refresh` | — | Rotate access token using refresh token |
| `POST` | `/auth/logout` | ✅ | Revoke current session's refresh token |
| `POST` | `/auth/logout-all` | ✅ | Revoke all active sessions |
| `POST` | `/auth/forgot-password` | — | Send password reset email |
| `POST` | `/auth/reset-password` | — | Reset password using token from email |
| `POST` | `/auth/verify-email` | — | Verify email using token from email |
| `GET`  | `/auth/profile` | ✅ | Get current user profile |
| `PUT`  | `/auth/profile` | ✅ | Update name or email |

### Expense Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/expenses` | ✅ | List expenses with filters and pagination |
| `POST` | `/expenses` | ✅ | Create a new expense |
| `GET` | `/expenses/:id` | ✅ | Get a single expense by ID |
| `PUT` | `/expenses/:id` | ✅ | Update an expense |
| `DELETE` | `/expenses/:id` | ✅ | Soft-delete an expense |
| `GET` | `/expenses/stats/summary` | ✅ | Get aggregate spending stats |
| `GET` | `/expenses/stats/category` | ✅ | Get category-level breakdown |

### Interactive API Documentation

```
http://localhost:5001/api-docs
```

All endpoints are documented with Swagger UI including request schemas, response examples, and authentication requirements.

---

## 🔒 Security Architecture

| Feature | Implementation |
|---|---|
| **Password Hashing** | `bcrypt` with cost factor 12 |
| **Access Tokens** | RS256-signed JWT, 15-minute expiry |
| **Refresh Tokens** | Opaque tokens, 7-day expiry, stored in DB |
| **Token Rotation** | New refresh token issued on every refresh |
| **Google OAuth** | ID token verified server-side via Google API |
| **Input Validation** | `express-validator` on all mutation endpoints |
| **Email Enumeration** | Forgot password always returns 200 |
| **Soft Deletes** | Data preserved with `isDeleted` flag |
| **CORS** | Configured per-environment origin allowlist |
| **Error Leakage** | Stack traces stripped in production responses |

> See [docs/AUTHENTICATION_FLOW.md](docs/AUTHENTICATION_FLOW.md) for the complete security model.

---

## ⚡ Performance Optimizations

| Optimization | Details |
|---|---|
| **TanStack Query Caching** | All API responses cached with configurable `staleTime` |
| **Background Refetching** | Data stays fresh without blocking UI |
| **Lazy Route Loading** | All pages code-split with `React.lazy()` |
| **Database Indexes** | On `userId`, `category`, `expenseDate`, `isDeleted` |
| **Prisma Query Optimization** | Selective `select` projections to minimize payload |
| **Vite Build** | Tree-shaking, minification, and chunk splitting |
| **Axios Interceptors** | Centralized request de-duplication |
| **Framer Motion** | GPU-accelerated transforms only (no layout thrash) |

---

## 🗺️ Roadmap

### Version 1.1 — Q3 2026
- [ ] AI-powered spending insights via Gemini API
- [ ] Budget overage push notifications
- [ ] Monthly email digest report
- [ ] Receipt OCR scanning via Vision API

### Version 1.2 — Q4 2026
- [ ] Savings goals with visual milestone tracking
- [ ] Emergency fund planner with recommended amount
- [ ] Subscription leak detection engine
- [ ] CSV and PDF export for full reports

### Version 2.0 — Q1 2027
- [ ] Multi-currency support with live exchange rates
- [ ] Bank account aggregation (Plaid integration)
- [ ] Team / family shared expense accounts
- [ ] Mobile app (React Native)
- [ ] Public API with OAuth 2.0 for third-party integrations

---

## 🤝 Contributing

ExpenseFlow welcomes contributions of all kinds.

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feat/your-feature-name

# 3. Commit your changes using Conventional Commits
git commit -m "feat(expenses): add CSV export functionality"

# 4. Push and open a Pull Request
git push origin feat/your-feature-name
```

> Read the full [Contributing Guide](docs/CONTRIBUTING.md) before submitting a PR.

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope):     New feature
fix(scope):      Bug fix
chore(scope):    Build/config changes
docs(scope):     Documentation only
refactor(scope): Code restructure (no behavior change)
test(scope):     Tests
perf(scope):     Performance improvement
```

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for full terms.

---

## 🙏 Acknowledgements

- [Prisma](https://prisma.io) — for the most ergonomic ORM in the Node.js ecosystem
- [TanStack Query](https://tanstack.com/query) — for making server state management trivial
- [Framer Motion](https://www.framer.com/motion/) — for enabling premium micro-interactions
- [Lucide Icons](https://lucide.dev) — for the beautiful icon set
- [Tailwind CSS](https://tailwindcss.com) — for the utility-first design philosophy
- [Vercel](https://vercel.com) — for world-class frontend deployment infrastructure

---

<div align="center">

**Built with ❤️ by [Ankit Singh](https://github.com/singhankit001)**

*If this project helped you or inspired you, please give it a ⭐ — it means a lot!*

</div>
