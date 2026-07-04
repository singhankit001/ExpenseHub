# Expense Tracker API

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-blue.svg)](https://nodejs.org)
[![Express Version](https://img.shields.io/badge/express-4.19.2-green.svg)](https://expressjs.com)
[![Prisma Version](https://img.shields.io/badge/prisma-%3E%3D%205.14.0-lightblue.svg)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/postgresql-17.6-blue.svg)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)

A complete, production-grade RESTful API backend built to manage personal finances, track expense categories, and generate detailed monthly spending analytics. This backend is engineered with a modular, 3-tier service-controller architecture, offering robust security, parameterized SQL querying, database indexing, and interactive developer documentation.

---

## Features

- **Authentication & Session Security**: Seamless token-based verification using stateless JSON Web Tokens (JWT) and Bcrypt password hashing.
- **Expense CRUD Management**: Full capabilities to add, view, update, and soft-delete transactions.
- **Analytics & Spending Summaries**: Instantly computes total spending metrics, monthly transaction aggregates, and category-wise breakdowns.
- **Advanced Query Operations**: Out-of-the-box support for database-level pagination, query searching on titles/notes, category filtering, date range sorting, and direction checks.
- **Soft Delete & Recovery**: Mark records as inactive to keep ledger integrity, with optional restore triggers.
- **Interactive Documentation**: Swagger OpenAPI UI available natively at the server root for live request testing.

---

## Tech Stack

- **Runtime Environment**: Node.js
- **Web Application Framework**: Express.js
- **Database Engine**: PostgreSQL
- **Object Relational Mapper (ORM)**: Prisma ORM
- **Authentication Standard**: JSON Web Tokens (`jsonwebtoken`)
- **Data Security**: `bcryptjs` for salting and hashing
- **Validation Middleware**: `express-validator`
- **Request Logger**: `morgan`
- **API Specification**: Swagger (`swagger-ui-express` & `swagger-jsdoc`)

---

## Project Architecture

The application adopts a **Service-Controller-Repository Pattern** to segregate HTTP parsing from transaction logic.

```
src/
├── config/
│   ├── db.js             # Prisma Client singleton
│   └── swagger.js        # Swagger specification compiler
├── controllers/          # Request/response controllers (thin layer)
│   ├── auth.controller.js
│   └── expense.controller.js
├── services/             # Core business logic and database queries
│   ├── auth.service.js
│   └── expense.service.js
├── routes/               # API endpoint routing declarations
│   ├── auth.routes.js
│   └── expense.routes.js
├── middleware/           # Pipeline filters
│   ├── auth.middleware.js # Token authentication filter
│   ├── error.middleware.js # Centralized global error handler
│   └── validate.middleware.js # Validation result checker
├── utils/                # System helpers
│   ├── appError.js       # Custom operational AppError class
│   └── catchAsync.js     # Promise reject catcher utility
├── validators/           # Verification rules
│   ├── auth.validator.js
│   └── expense.validator.js
├── app.js                # Core app configuration
└── server.js             # Listener entry point
```

---

## API Features & Endpoints

All endpoints are prefixed with `/api` and return standardized JSON responses.

### 🔐 Authentication Module

| Method | Endpoint | Description | Auth Required |
| :---: | :--- | :--- | :---: |
| **POST** | `/api/auth/register` | Register a new user | No |
| **POST** | `/api/auth/login` | Log in and receive JWT token | No |
| **GET** | `/api/auth/profile` | View profile details | Yes |
| **PUT** | `/api/auth/profile` | Update profile information | Yes |
| **POST** | `/api/auth/logout` | Request client-side session deletion | Yes |

### 💸 Expense Module

| Method | Endpoint | Description | Auth Required |
| :---: | :--- | :--- | :---: |
| **POST** | `/api/expenses` | Add a new expense | Yes |
| **GET** | `/api/expenses` | Retrieve expenses (with pagination/filters) | Yes |
| **GET** | `/api/expenses/:id` | Fetch single expense details | Yes |
| **PUT** | `/api/expenses/:id` | Update an existing expense | Yes |
| **DELETE**| `/api/expenses/:id` | Soft-delete an expense | Yes |
| **PATCH** | `/api/expenses/:id/restore` | Restore a soft-deleted expense | Yes |

### 📊 Analytics & Dashboard

| Method | Endpoint | Description | Auth Required |
| :---: | :--- | :--- | :---: |
| **GET** | `/api/expenses/dashboard/stats` | Active count, totals, category summaries | Yes |
| **GET** | `/api/expenses/dashboard/recent` | Retrieve the 5 most recent active expenses | Yes |
| **GET** | `/api/expenses/analytics/category` | Spend totals grouped by category | Yes |
| **GET** | `/api/expenses/analytics/top-categories` | Top spending categories sorted descending | Yes |
| **GET** | `/api/expenses/analytics/monthly-summary` | 6-month aggregate spend overview | Yes |
| **GET** | `/api/expenses/analytics/monthly-detail` | Monthly categories spending matrix | Yes |

---

## Database Design

The database schema enforces relational constraints and index queries.

```
+------------------+          +------------------+
|      USER        |          |     EXPENSE      |
+------------------+          +------------------+
| id (UUID)   [PK] |------<   | id (UUID)   [PK] |
| name             |          | title            |
| email (UQ) [IDX] |          | amount (Decimal) |
| password         |          | category (Enum)  |
| createdAt        |          | expenseDate      |
| updatedAt        |          | notes            |
|                  |          | isDeleted [IDX]  |
|                  |          | deletedAt        |
|                  |          | createdAt        |
|                  |          | updatedAt        |
|                  |          | userId      [FK] |
+------------------+          +------------------+
```

### Relational Details
- **User - Expense Relationship**: One-to-Many connection. Deleting a user triggers a cascade delete (`onDelete: Cascade`) for all their related expenses.
- **Indexes**: Implemented on `User(email)`, `Expense(userId)`, `Expense(category)`, `Expense(expenseDate)`, and `Expense(isDeleted)` to ensure maximum read efficiency.
- **Precision**: Money amounts are stored as `Decimal(10, 2)` to eliminate standard floating-point rounding errors.

---

## Authentication Flow

STATÈLESS JWT Verification is executed in the pipeline:
1. User provides credentials to the `/api/auth/login` endpoint.
2. The server salts and verifies passwords against hashes. On success, it issues a signed JWT token containing the User ID.
3. The client includes this token in the `Authorization: Bearer <token>` header of subsequent requests.
4. The `auth.middleware.js` intercepts incoming calls, verifies the signature against the server's private secret, checks if the user exists, and attaches the user payload to the request object.

---

## Getting Started

### 1. Configure the Environment
Create a `.env` file in the project root:
```env
PORT=5001
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/expense_tracker_db?schema=public"
JWT_SECRET="your-jwt-signing-secret"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="*"
```

### 2. Setup the Project
Install packages and execute Prisma sync operations:
```bash
# Install dependencies
npm install

# Run Prisma schema migrations
npx prisma migrate dev --name init

# Populate mock users and transactions
npx prisma db seed
```

### 3. Run the Server
```bash
# Start in hot-reload development mode
npm run dev

# Start in production mode
npm start
```

---

## API Documentation

Interactive Swagger API documentation is exposed at:
- **Local URL**: [http://localhost:5001/api-docs](http://localhost:5001/api-docs)

To query protected endpoints, log in, copy the `token` from the response, click **Authorize** in the Swagger UI, and input your token.

---

## Security Features

- **Stateless Authorization**: JWT token verification filters block unauthorized requests.
- **Hashed Credentials**: Bcrypt (10 rounds) salts and hashes passwords.
- **No SQL Injection**: Parameterized Prisma queries separate SQL code from variable parameters.
- **Input Whitelisting**: Strict body constraints via `express-validator` validate amounts and categories.

---

## Deployment

### Render Deployment
1. Connect your repository to **Render**.
2. Create a new **Web Service** using the Node runtime.
3. Configure the following build variables:
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
4. Declare `DATABASE_URL`, `JWT_SECRET`, and `JWT_EXPIRES_IN` in the environment configuration section.

### Railway Deployment
1. Connect your repository to **Railway**.
2. Create a project and select **Deploy from Github**.
3. Railway automatically detects configuration from `railway.json` using Nixpacks, runs the build command, executes migrations, and starts the service.

---

## Future Improvements

- **Token Blacklisting**: Revoke JWT sessions instantly by blacklisting tokens in a Redis cache on logout.
- **Budget Alerts**: Enable custom monthly limits per category and trigger notification payloads.
- **Export System**: Add support for generating PDF and CSV summaries.

---

## Author

- **Ankit Singh** - [GitHub](https://github.com/ankitsingh) / [LinkedIn](https://linkedin.com/in/ankitsingh)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
