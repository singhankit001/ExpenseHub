# Backend Developer Guide

> **ExpenseFlow** — Backend architecture, patterns, and contributor guide  
> Stack: Node.js · Express.js · Prisma · PostgreSQL · JWT

---

## Getting Started

```bash
cd backend
npm install

# Setup database
npx prisma db push

# Start development server (with nodemon hot reload)
npm run dev         # http://localhost:5001
                    # Swagger: http://localhost:5001/api-docs
```

---

## Project Structure

```
backend/src/
├── server.js              # Entry point — calls createApp(), starts HTTP listener
├── app.js                 # Express app factory — middleware + route mounting
├── config/
│   └── db.js              # Prisma client singleton
├── controllers/
│   ├── auth.controller.js # HTTP layer — parse req, call service, send res
│   └── expense.controller.js
├── services/
│   ├── auth.service.js    # Business logic — JWT, bcrypt, Google OAuth
│   └── expense.service.js # Business logic — CRUD, filters, pagination
├── routes/
│   ├── auth.routes.js     # Route definitions + Swagger JSDoc annotations
│   └── expense.routes.js
├── middleware/
│   ├── auth.middleware.js   # JWT verification guard
│   ├── validate.middleware.js # express-validator error formatter
│   ├── error.middleware.js  # Global error handler
│   └── upload.middleware.js # Multer file upload config
├── validators/
│   └── auth.validator.js   # express-validator rule arrays
└── utils/
    ├── appError.js         # Custom operational error class
    ├── catchAsync.js       # Async route wrapper
    ├── email.js            # Nodemailer transactional email
    └── auditLogger.js      # Activity audit log writer
```

---

## Layered Architecture

### Controller

Responsible **only** for HTTP concerns:

```javascript
// auth.controller.js
exports.login = catchAsync(async (req, res) => {
  // 1. Extract validated input
  const { email, password } = req.body;

  // 2. Delegate to service
  const result = await authService.loginUser(email, password, req);

  // 3. Send HTTP response
  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    data: result,
  });
});
```

Controllers should **never** contain:
- Database calls (Prisma)
- Business logic
- Token signing
- Password hashing

### Service

Contains **all business logic**:

```javascript
// auth.service.js
exports.loginUser = async (email, password, req) => {
  // Business logic lives here
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (user.isDisabled) {
    throw new AppError('Account disabled.', 403);
  }

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = await createRefreshToken(user.id);
  await logActivity(user.id, 'LOGIN', `Login from ${req?.ip}`, req);

  return { accessToken, refreshToken, user: safeUser(user) };
};
```

---

## Middleware Chain

### `auth.middleware.js` — JWT Guard

```javascript
const protect = async (req, res, next) => {
  // 1. Extract token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next(new AppError('Unauthorized', 401));

  // 2. Verify JWT signature and expiry
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3. Fetch user and check they're not disabled
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || user.isDisabled) return next(new AppError('Unauthorized', 401));

  // 4. Attach to request for downstream use
  req.user = { id: user.id, role: user.role };
  next();
};
```

### `validate.middleware.js` — Validation Error Formatter

```javascript
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }
  next();
};
```

### `error.middleware.js` — Global Error Handler

```javascript
module.exports = (err, req, res, next) => {
  // Translate Prisma errors to operational errors
  if (err.code === 'P2002') err = handlePrismaUniqueConstraint(err);
  if (err.name === 'PrismaClientValidationError') err = handlePrismaValidation(err);
  if (err.name === 'JsonWebTokenError') err = new AppError('Invalid token', 401);

  // In development: include stack trace
  // In production: only return message for operational errors
  sendError(err, req, res);
};
```

---

## Error Handling Pattern

### `AppError` Class

All expected (operational) errors are thrown as `AppError` instances:

```javascript
const AppError = require('../utils/appError');

// Usage in services
throw new AppError('Email already in use.', 400);
throw new AppError('Invalid credentials.', 401);
throw new AppError('Expense not found.', 404);
```

```javascript
// appError.js
class AppError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 500 ? 'error' : 'fail';
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### `catchAsync` Wrapper

Eliminates boilerplate try/catch in controllers:

```javascript
// Without catchAsync
exports.getExpenses = async (req, res, next) => {
  try {
    const result = await expenseService.getAll(req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// With catchAsync (preferred)
exports.getExpenses = catchAsync(async (req, res) => {
  const result = await expenseService.getAll(req.user.id);
  res.status(200).json({ success: true, data: result });
});
```

---

## Input Validation

Route-level validation uses `express-validator` rule arrays:

```javascript
// validators/auth.validator.js
exports.registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Applied in routes
router.post('/register', registerValidator, validate, authController.register);
```

The `validate` middleware runs after validators, collects all errors, and returns them as a structured `400` response.

---

## Prisma Patterns

### Singleton Client

```javascript
// config/db.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;
```

Always import this singleton — never instantiate `PrismaClient` directly in service files.

### Pagination Helper

```javascript
// Standard pagination pattern
const page = parseInt(req.query.page) || 1;
const limit = Math.min(parseInt(req.query.limit) || 10, 100);
const skip = (page - 1) * limit;

const [expenses, total] = await Promise.all([
  prisma.expense.findMany({ where, skip, take: limit, orderBy }),
  prisma.expense.count({ where }),
]);

return {
  expenses,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  },
};
```

### Soft Delete Convention

All expense queries **must** include `isDeleted: false`:

```javascript
// CORRECT
const expenses = await prisma.expense.findMany({
  where: { userId: req.user.id, isDeleted: false },
});

// WRONG — returns deleted expenses
const expenses = await prisma.expense.findMany({
  where: { userId: req.user.id },
});
```

---

## Swagger / OpenAPI Documentation

Routes are annotated with JSDoc Swagger comments:

```javascript
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in an existing user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginValidator, validate, authController.login);
```

Access the interactive UI at: `http://localhost:5001/api-docs`

---

## Email Utility

Transactional emails are sent via Nodemailer:

```javascript
const { sendEmail } = require('../utils/email');

// Send verification email
await sendEmail({
  to: user.email,
  subject: 'Verify your ExpenseFlow account',
  html: `
    <h2>Welcome to ExpenseFlow!</h2>
    <p>Click the link below to verify your email:</p>
    <a href="${process.env.CLIENT_URL}/verify-email?token=${rawToken}">
      Verify Email
    </a>
  `,
});
```

---

## Audit Logger

All significant user actions are logged:

```javascript
const { logActivity } = require('../utils/auditLogger');

// Usage
await logActivity(user.id, 'LOGIN', `User logged in from ${req.ip}`, req);
await logActivity(user.id, 'REGISTER', `New account created`, req);
await logActivity(user.id, 'PASSWORD_RESET', `Password was reset`, req);
```

---

## Adding a New Feature

### 1. Define the Prisma model

Add to `prisma/schema.prisma`, then run:
```bash
npx prisma db push
npx prisma generate
```

### 2. Create the service

```javascript
// src/services/budget.service.js
const prisma = require('../config/db');
const AppError = require('../utils/appError');

exports.getBudgets = async (userId) => {
  return prisma.budget.findMany({ where: { userId } });
};
```

### 3. Create the controller

```javascript
// src/controllers/budget.controller.js
const budgetService = require('../services/budget.service');
const catchAsync = require('../utils/catchAsync');

exports.getBudgets = catchAsync(async (req, res) => {
  const budgets = await budgetService.getBudgets(req.user.id);
  res.status(200).json({ success: true, data: { budgets } });
});
```

### 4. Create the router

```javascript
// src/routes/budget.routes.js
const router = express.Router();
const protect = require('../middleware/auth.middleware');

router.get('/', protect, budgetController.getBudgets);

module.exports = router;
```

### 5. Mount in app.js

```javascript
app.use('/api/budgets', require('./routes/budget.routes'));
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | Yes | Server port (default 5001) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | HMAC secret for access tokens (min 32 chars) |
| `JWT_EXPIRES_IN` | Yes | Access token TTL (e.g. `15m`) |
| `JWT_REFRESH_SECRET` | Yes | HMAC secret for refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | Yes | Refresh token TTL (e.g. `7d`) |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth 2.0 client ID |
| `EMAIL_HOST` | Optional | SMTP hostname |
| `EMAIL_PORT` | Optional | SMTP port |
| `EMAIL_USER` | Optional | SMTP username |
| `EMAIL_PASS` | Optional | SMTP password or app password |
| `CLIENT_URL` | Yes | Frontend origin for CORS and email links |
