# Security Design

ExpenseFlow integrates standard industry security controls across multiple layers to protect sensitive financial records and guarantee data privacy.

---

## 1. Authentication & Session Strategy (JWT)

We use **JSON Web Tokens (JWT)** for stateless, secure session validation instead of stateful server sessions.

```
┌──────────┐                  ┌──────────┐                  ┌──────────┐
│  Client  │                  │  Server  │                  │ Database │
└────┬─────┘                  └────┬─────┘                  └────┬─────┘
     │ 1. POST /login              │                             │
     ├────────────────────────────>│                             │
     │                             │ 2. Check credentials        │
     │                             ├────────────────────────────>│
     │                             │    and verify password      │
     │                             │<────────────────────────────┤
     │ 3. Return 200 OK + JWT      │                             │
     │<────────────────────────────┤                             │
     │                             │                             │
     │ 4. GET /expenses            │                             │
     │    (Auth Header: Bearer)    │                             │
     ├────────────────────────────>│                             │
     │                             │ 5. Verify signature &       │
     │                             │    attach User to request   │
     │                             ├───────────┐                 │
     │                             │           │                 │
     │                             │<──────────┘                 │
     │                             │ 6. Fetch expenses for user  │
     │                             ├────────────────────────────>│
     │                             │<────────────────────────────┤
     │ 7. Return expenses          │                             │
     │<────────────────────────────┤                             │
```

- **Algorithm:** Signed using HMAC-SHA256.
- **Expiration:** Expiry is set via `JWT_EXPIRES_IN` (recommended: `7d`).
- **Client Storage:** Tokens are stored in `localStorage` in the frontend client. The token is attached as an `Authorization: Bearer <TOKEN>` header for all authenticated requests using Axios request interceptors.

---

## 2. Password Hashing (bcrypt)

User passwords are hashed using **bcryptjs** before storage.

- **Work Factor:** 10 salt rounds.
- **Security benefits:**
  - Standard defense against rainbow table dictionary attacks.
  - Implements adaptive hashing speed to stay secure against modern hardware.
  - Uses standard salting to ensure two identical passwords produce completely different hash strings.

---

## 3. Route Protection Middleware

Endpoints that modify or view user data are protected by the `protect` middleware:

1. Extracts the token from the HTTP `Authorization` header.
2. If the token is missing or malformed, it immediately returns a `401 Unauthorized` response.
3. Decodes the token using `process.env.JWT_SECRET`.
4. Queries PostgreSQL to ensure the associated user record still exists.
5. Attaches the verified user information to the request object (`req.user = user`).

---

## 4. Input Sanitization & Validation

Input parameters are verified by `express-validator` at the application perimeter:

- **Register Validator:** Assures names are between 2–50 characters, email patterns are valid, and passwords are a minimum of 6 characters long.
- **Expense Validator:** Ensures title fields do not exceed 100 characters, amount entries are positive floats (`gt: 0`), and category selections are whitelisted enum options.
- **Unified Errors:** Any parameter violation immediately triggers a `422 Unprocessable Entity` containing details on the validation failure, preventing garbage data from touching database transactions.

---

## 5. Dev/Prod Error Separation

The global error handler filters stack traces based on the execution environment:

- **Development:** Returns full stack traces, parameter details, and raw database engine rejections.
- **Production:** Operational exceptions return structured, client-friendly summaries (e.g., "A record with that email already exists."). Programming bugs, database connection losses, or system failures return a generic message: `Something went wrong.` to hide internal implementation details.
