# Changelog

All notable changes to **ExpenseFlow** are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- AI-powered spending insights via Gemini API
- Savings goals with visual milestone tracking
- Subscription leak detection engine
- Emergency fund planner
- CSV and PDF export for reports
- Budget overage push notifications
- Monthly email digest

---

## [1.0.0] — 2026-07-07

### 🎉 Initial Release

This is the first stable release of ExpenseFlow — a full-stack personal finance intelligence platform.

---

### Added

#### Backend
- JWT authentication with access/refresh token rotation
- Google OAuth 2.0 login via Google Identity Services
- bcrypt password hashing with cost factor 12
- Email verification flow with secure tokenized links
- Password reset with 10-minute time-limited tokens
- Multi-device session management — per-device and all-device logout
- Soft-delete expense management with `isDeleted + deletedAt` pattern
- Expense CRUD API with server-side pagination, search, and category filtering
- Aggregate spending stats endpoint (`/expenses/stats/summary`)
- Category-level breakdown endpoint (`/expenses/stats/category`)
- Audit activity logging for all significant user actions
- Transactional email utility with Nodemailer
- File upload middleware with Multer (receipt support scaffold)
- Swagger / OpenAPI interactive documentation at `/api-docs`
- Global error handler with Prisma error translation
- `catchAsync` wrapper eliminating try/catch boilerplate in controllers
- `AppError` operational error class with status codes

#### Database
- PostgreSQL 15 with Prisma ORM
- `User` model with LOCAL and GOOGLE auth provider support
- `RefreshToken` model with revocation and expiry tracking
- `Expense` model with 8 category enums and soft delete
- Strategic indexes on `userId`, `category`, `expenseDate`, `isDeleted`
- Initial Prisma migration applied

#### Frontend
- React 19 with TypeScript and Vite 8
- Tailwind CSS v4 with custom `@theme` design tokens (oklch palette)
- Outfit + Inter typography via Google Fonts
- Glassmorphic dark theme throughout
- `BackgroundSystem` component with ambient animated mesh gradients
- `AppLayout` floating glass sidebar with animated active state
- Mobile responsive — hamburger drawer navigation
- `AuthLayout` split-panel design (branding + form)
- `LoginPage` with Google OAuth button and form validation
- `RegisterPage` with real-time field-level error display
- `DashboardPage` with stat cards, HealthScore widget, category breakdown, recent transactions
- `ExpensesPage` with full CRUD modal flows and dark-theme form fields
- `BudgetsPage` scaffold with category spend vs limit visualization
- `ReportsPage` with date-range filtering scaffold
- `RecurringPage` — recurring expense identification scaffold
- `NotificationsPage` — in-app notification center scaffold
- `AuditActivityPage` — user activity log view
- `ProfilePage` with user info, avatar, role badge, and edit form
- `SettingsPage` with account preference controls
- `LandingPage` with hero, features grid, pricing tiers, testimonials, and CTA
- TanStack Query with 60-second stale time and background refetch
- React Hook Form + Zod schema validation on all forms
- Framer Motion animations throughout (entrance, hover, tap)
- `<Input>` component with dark theme, password show/hide toggle
- `<Button>` component with variants (primary, outline, ghost, danger), sizes, and loading state
- `<Modal>` component with spring animation and portal rendering
- `<Card>` component with glass-card aesthetic
- `<EmptyState>` reusable empty list state component
- `<HealthScore>` animated arc widget with tier classification
- `<InsightCard>` metric card with inline sparkline
- `<Sparkline>` lightweight SVG trend chart
- Axios interceptors: Bearer token injection + 401 redirect handling
- `useAuth` context hook with full auth state machine
- Route guards via `<PrivateRoute>` component
- Lazy-loaded routes with `React.lazy()` and `<Suspense>`
- Auth redirect loop fix: `accessToken` field name corrected
- Invalid `"undefined"` token guard in `initAuth`

### Fixed
- Registration 400 error caused by invalid `settings` nested write (schema mismatch)
- Login redirect loop caused by wrong token field name (`token` vs `accessToken`)
- Dead navigation buttons on LandingPage from `<Link><Button>` nesting (invalid HTML)
- Backend crash on startup due to missing `auditLogger.js` utility

---

## [0.1.0] — 2026-07-04

### Added
- Initial monorepo structure: `backend/`, `frontend/`, `docs/`
- Express.js server scaffold with basic health check
- Prisma schema v1 with User, Expense models
- React + Vite project initialization
- React Router v6 setup with basic route tree
- Architecture, API reference, database, deployment, and security documentation
- Vercel deployment configuration (`vercel.json`)
- README with project overview and setup instructions
