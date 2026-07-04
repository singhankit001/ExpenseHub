# Architecture Design

ExpenseFlow follows a clean, decoupled **Three-Tier Architecture** tailored for Express.js APIs. This separation ensures that request parsing, business rules, and database operations do not leak into one another, making the codebase highly testable, maintainable, and robust.

---

## 1. Architectural Layers

The backend application is split into four distinct layers:

```
┌────────────────────────────────────────────────────────┐
│                        Client                          │
│          Web Dashboard (React) / HTTP Client           │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP Request
                           ▼
┌────────────────────────────────────────────────────────┐
│                      Route Layer                       │
│    - Binds HTTP endpoints to controller actions        │
│    - Attaches validation schema chains                 │
│    - Mounts JWT protect middleware                     │
└──────────────────────────┬─────────────────────────────┘
                           │ Validated Request Context
                           ▼
┌────────────────────────────────────────────────────────┐
│                    Controller Layer                    │
│    - Parses incoming HTTP headers, params, and body    │
│    - Handles request/response orchestration            │
│    - Delegates to Service Layer inside catchAsync      │
└──────────────────────────┬─────────────────────────────┘
                           │ Parameters & Domain DTOs
                           ▼
┌────────────────────────────────────────────────────────┐
│                     Service Layer                      │
│    - Executes business logic and permission rules      │
│    - Performs calculation & grouping functions         │
│    - Throws AppError on business rule violations       │
└──────────────────────────┬─────────────────────────────┘
                           │ Type-Safe Queries
                           ▼
┌────────────────────────────────────────────────────────┐
│                   Data Access Layer                    │
│    - Prisma ORM constructs parameterised queries       │
│    - Connects to PostgreSQL database instances         │
└────────────────────────────────────────────────────────┘
```

### Route Layer (`src/routes/*`)
Defines the HTTP paths, methods, validation schema bindings, and authentication requirements. It contains no implementation logic. Its only concern is mappings.

### Controller Layer (`src/controllers/*`)
Binds HTTP semantics to business logic.
- **Responsibilities:** Extracts arguments from `req.body`, `req.params`, or `req.query`, handles status codes, and structures the outgoing JSON envelope.
- **Rule:** Controllers are thin. They should never write database queries or perform complex business calculations.

### Service Layer (`src/services/*`)
Houses the application's domain logic.
- **Responsibilities:** Validates ownership of resources, manages database transaction grouping, and filters data logic.
- **Rule:** Decoupled from Express semantics. Services do not know about `req`, `res`, or HTTP status codes. They receive standard JavaScript variables and throw standard JavaScript/custom errors.

### Data Access Layer (`src/config/db.js` + Prisma Client)
- Type-safe, parameterized queries via Prisma.
- Uses a Prisma client singleton instance to maintain database connection pools efficiently.

---

## 2. Request Lifecycle

Here is the exact lifecycle of an incoming request (e.g., creating an expense):

1. **Routing:** Express receives `POST /api/expenses` and routes it to `expense.routes.js`.
2. **Authentication Middleware (`protect`):** Reads the JWT from the `Authorization` header, decodes it, queries the database to verify the user exists, and binds the user object to `req.user`. If invalid, rejects instantly with `401 Unauthorized`.
3. **Input Validation Middleware (`createExpenseValidator`, `validate`):** Sanitizes and checks parameters using `express-validator`. If any field fails, short-circuits the request and returns a `422 Unprocessable Entity` containing errors.
4. **Controller Routing (`addExpense`):** The controller extracts input fields from `req.body` and user details from `req.user.id`, then calls `expenseService.createExpense(userId, body)`.
5. **Business Logic Execution (`createExpense`):** The service parses values, adjusts dates, constructs prisma commands, and contacts the DB.
6. **Data Storage:** Prisma writes the record to PostgreSQL.
7. **Response Envelope:** The service returns the saved object to the controller, which builds a success envelope (`status: 201`, `success: true`) and responds to the client.

If an error occurs anywhere along this chain, `catchAsync` catches it and forwards it via `next(err)` to the global error middleware, returning a structured JSON response.

---

## 3. Why This Architecture?

- **Testability:** You can easily unit test the service functions without mocking complex Express request/response objects.
- **Security:** Input validation and token checking happen at the routing perimeter. Malformed or unauthorized calls are dropped before reaching business logic or database layers.
- **Maintainability:** If we switch from PostgreSQL to another database, only the ORM and Service queries change — the controllers and routers remain untouched. If we switch frameworks from Express to Koa/Fastify, only the controllers and routers change — the business logic in services remains intact.
- **Scale:** Decoupling helps multiple developers work on separate layers concurrently without git conflicts.
