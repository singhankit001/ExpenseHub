# ExpenseHub — Project Planning

## Overview
A full-stack personal finance tracker with:
- Secure REST API (Node.js, Express, Prisma, PostgreSQL)
- React 19 dashboard with charts and analytics
- JWT authentication with bcrypt password hashing
- Paginated, filtered expense CRUD
- Deployment configs for Render and Railway

## Tech Stack
### Backend
- Node.js 22, Express 4.x
- PostgreSQL 16 + Prisma ORM
- JWT + bcrypt authentication
- express-validator for input sanitization
- Swagger/OpenAPI documentation

### Frontend
- React 19 + TypeScript
- Vite build tool
- TanStack Query (React Query) for server state
- react-hook-form + zod validation
- Recharts for data visualization
- Framer Motion for animations

## Data Model
### User
- id, name, email, password (hashed), createdAt, updatedAt

### Expense
- id, title, amount, category (enum), date, notes (optional)
- userId (FK), isDeleted (soft-delete flag), createdAt, updatedAt

## Expense Categories
Food, Transport, Housing, Entertainment, Healthcare, Education, Shopping, Utilities, Travel, Other

## API Modules
1. Auth: register, login, profile (get/update), logout
2. Expenses: CRUD, soft-delete, restore
3. Dashboard: stats, recent transactions
4. Analytics: category breakdown, top-categories, monthly summaries

## Milestones
- [ ] June 24 — Project planning and architecture design
- [ ] June 25 — Monorepo scaffold, .gitignore, package configs
- [ ] June 26 — Database schema, Prisma setup, error utilities
- [ ] June 27 — Auth validators, JWT middleware, DB config
- [ ] June 28 — Auth service, expense validators, frontend config
- [ ] June 29 — Backend server bootstrap and Express app
- [ ] June 30 — Error handling, utilities, app wiring
- [ ] July 1  — Prisma schema, validation middleware, JWT auth
- [ ] July 2  — Auth service/controllers/routes + expense validators
- [ ] July 3  — Expense service/controllers/routes + seeder
- [ ] July 4  — Swagger docs, Postman, deployment configs, frontend
