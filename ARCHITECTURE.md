# ExpenseHub — Architecture Notes

## Monorepo Structure
```
ExpenseHub/
├── backend/              ← Express + Prisma REST API
│   ├── prisma/           ← Schema + migrations + seed script
│   ├── src/
│   │   ├── config/       ← Prisma client singleton, Swagger setup
│   │   ├── controllers/  ← Thin HTTP handlers (delegate to services)
│   │   ├── middleware/   ← JWT auth, error handler, validator checker
│   │   ├── routes/       ← Route registration
│   │   ├── services/     ← Business logic + Prisma queries
│   │   ├── utils/        ← AppError class, catchAsync wrapper
│   │   └── validators/   ← express-validator rule chains
│   ├── .env              ← Secrets (gitignored)
│   └── package.json
└── frontend/             ← React 19 + Vite + TypeScript
    ├── src/
    │   ├── app/          ← QueryClient + Router bootstrap
    │   ├── components/ui/← Button, Card, Input, Modal, Badge, Skeleton
    │   ├── features/     ← Feature-sliced: auth, expenses
    │   ├── hooks/        ← useAuth and other custom hooks
    │   ├── layouts/      ← AppLayout (sidebar nav), AuthLayout
    │   ├── pages/        ← Route-level page components
    │   ├── routes/       ← React Router v6 config + PrivateRoute
    │   ├── services/     ← Axios instance + typed API calls
    │   ├── types/        ← Shared TypeScript interfaces
    │   └── utils/        ← Currency/date formatters, helpers
    └── package.json
```

## Request Lifecycle (Backend)
```
Client → Route → Middleware (auth + validate) → Controller → Service → Prisma → PostgreSQL
                                                                      ← Response ←
```

## Frontend Data Flow
```
Component → React Query hook → axios service → REST API
                ↑
         Cache invalidation on mutation
```

## Security Decisions
- Passwords hashed with bcrypt (10 rounds)
- JWT in Authorization header (Bearer scheme), never in cookies
- Parameterized queries via Prisma (SQL injection prevention)
- express-validator whitelists only known request fields
- Soft-delete (isDeleted flag) preserves data integrity
- Dev/prod error separation in globalErrorHandler
