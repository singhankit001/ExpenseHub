# API Reference

This reference covers request/response payloads, query parameters, HTTP status codes, and authentication requirements for every endpoint.

Base URL: `http://localhost:5001/api` (default development server) or your deployed production domain.

---

## Authentication Endpoints

All request/response payloads are in JSON format.

### Register User
* **Method:** `POST`
* **Route:** `/auth/register`
* **Authentication:** None (Public)
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "name": "Ankit Singh",
    "email": "ankit@example.com",
    "password": "strongPassword123"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "c3e47a98-6547-49d7-83eb-5bcf4ef82110",
        "name": "Ankit Singh",
        "email": "ankit@example.com",
        "createdAt": "2026-07-04T12:00:00.000Z",
        "updatedAt": "2026-07-04T12:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
* **Error Response (409 Conflict - Email Exists):**
  ```json
  {
    "status": "fail",
    "message": "A record with that email already exists."
  }
  ```

---

### Login User
* **Method:** `POST`
* **Route:** `/auth/login`
* **Authentication:** None (Public)
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "email": "ankit@example.com",
    "password": "strongPassword123"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "data": {
      "user": {
        "id": "c3e47a98-6547-49d7-83eb-5bcf4ef82110",
        "name": "Ankit Singh",
        "email": "ankit@example.com",
        "createdAt": "2026-07-04T12:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
* **Error Response (401 Unauthorized):**
  ```json
  {
    "status": "fail",
    "message": "Invalid email or password."
  }
  ```

---

### Get User Profile
* **Method:** `GET`
* **Route:** `/auth/profile`
* **Authentication:** JWT Bearer Token required
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "User profile retrieved successfully",
    "data": {
      "user": {
        "id": "c3e47a98-6547-49d7-83eb-5bcf4ef82110",
        "name": "Ankit Singh",
        "email": "ankit@example.com",
        "createdAt": "2026-07-04T12:00:00.000Z",
        "updatedAt": "2026-07-04T12:30:00.000Z"
      }
    }
  }
  ```

---

### Update User Profile
* **Method:** `PUT`
* **Route:** `/auth/profile`
* **Authentication:** JWT Bearer Token required
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
* **Request Body (All fields optional):**
  ```json
  {
    "name": "Ankit Kumar Singh",
    "email": "ankit.kumar@example.com"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "user": {
        "id": "c3e47a98-6547-49d7-83eb-5bcf4ef82110",
        "name": "Ankit Kumar Singh",
        "email": "ankit.kumar@example.com",
        "updatedAt": "2026-07-04T13:45:00.000Z"
      }
    }
  }
  ```

---

### Logout User
* **Method:** `POST`
* **Route:** `/auth/logout`
* **Authentication:** JWT Bearer Token required
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully. Please delete the token from the client storage.",
    "data": {}
  }
  ```

---

## Expense Management Endpoints

All endpoints below require **JWT Bearer Token authentication**.

### Create Expense
* **Method:** `POST`
* **Route:** `/expenses`
* **Request Body:**
  ```json
  {
    "title": "Grocery Shopping",
    "amount": 124.50,
    "category": "Food",
    "expenseDate": "2026-07-04T15:30:00.000Z",
    "notes": "Weekly groceries from supermarket."
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Expense added successfully",
    "data": {
      "expense": {
        "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "title": "Grocery Shopping",
        "amount": 124.50,
        "category": "Food",
        "expenseDate": "2026-07-04T15:30:00.000Z",
        "notes": "Weekly groceries from supermarket.",
        "isDeleted": false,
        "deletedAt": null,
        "userId": "c3e47a98-6547-49d7-83eb-5bcf4ef82110",
        "createdAt": "2026-07-04T15:31:00.000Z",
        "updatedAt": "2026-07-04T15:31:00.000Z"
      }
    }
  }
  ```

---

### List Expenses
* **Method:** `GET`
* **Route:** `/expenses`
* **Query Parameters (All optional):**
  - `page`: Page number (default: `1`)
  - `limit`: Items per page (default: `10`)
  - `search`: Case-insensitive text search on `title` or `notes`
  - `category`: Filter by exact category string (e.g. `Food`, `Travel`)
  - `startDate`: Start range filter for `expenseDate` (ISO 8601 string)
  - `endDate`: End range filter for `expenseDate` (ISO 8601 string)
  - `sortBy`: Field to sort by: `amount`, `expenseDate`, `createdAt`, `title` (default: `expenseDate`)
  - `sortOrder`: `asc` or `desc` (default: `desc`)
  - `includeDeleted`: `true`, `false`, or `only` (default: `false`)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Expenses retrieved successfully",
    "data": {
      "pagination": {
        "totalItems": 24,
        "totalPages": 3,
        "currentPage": 1,
        "limit": 10,
        "hasNextPage": true,
        "hasPrevPage": false
      },
      "expenses": [
        {
          "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          "title": "Grocery Shopping",
          "amount": 124.50,
          "category": "Food",
          "expenseDate": "2026-07-04T15:30:00.000Z",
          "notes": "Weekly groceries",
          "isDeleted": false,
          "userId": "c3e47a98-6547-49d7-83eb-5bcf4ef82110"
        }
      ]
    }
  }
  ```

---

### Get Single Expense
* **Method:** `GET`
* **Route:** `/expenses/:id`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Expense details retrieved successfully",
    "data": {
      "expense": {
        "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "title": "Grocery Shopping",
        "amount": 124.50,
        "category": "Food",
        "expenseDate": "2026-07-04T15:30:00.000Z",
        "notes": "Weekly groceries",
        "isDeleted": false,
        "userId": "c3e47a98-6547-49d7-83eb-5bcf4ef82110"
      }
    }
  }
  ```

---

### Update Expense
* **Method:** `PUT`
* **Route:** `/expenses/:id`
* **Request Body (All fields optional):**
  ```json
  {
    "title": "Updated Title",
    "amount": 150.00
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Expense updated successfully",
    "data": {
      "expense": {
        "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "title": "Updated Title",
        "amount": 150.00,
        "category": "Food",
        "expenseDate": "2026-07-04T15:30:00.000Z",
        "notes": "Weekly groceries",
        "isDeleted": false,
        "userId": "c3e47a98-6547-49d7-83eb-5bcf4ef82110",
        "updatedAt": "2026-07-04T16:00:00.000Z"
      }
    }
  }
  ```

---

### Soft Delete Expense
* **Method:** `DELETE`
* **Route:** `/expenses/:id`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Expense soft deleted successfully. It can be restored using the restore endpoint.",
    "data": {
      "expense": {
        "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "isDeleted": true,
        "deletedAt": "2026-07-04T16:05:00.000Z"
      }
    }
  }
  ```

---

### Restore Expense
* **Method:** `PATCH`
* **Route:** `/expenses/:id/restore`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Expense restored successfully",
    "data": {
      "expense": {
        "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "isDeleted": false,
        "deletedAt": null
      }
    }
  }
  ```

---

## Analytics & Dashboard Endpoints

### Get Dashboard Statistics
* **Method:** `GET`
* **Route:** `/expenses/dashboard/stats`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Dashboard statistics retrieved successfully",
    "data": {
      "activeCount": 24,
      "totalSpent": 1540.75,
      "deletedCount": 2,
      "categoryBreakdown": [
        {
          "category": "Food",
          "totalAmount": 420.50,
          "count": 12
        },
        {
          "category": "Travel",
          "totalAmount": 1120.25,
          "count": 12
        }
      ]
    }
  }
  ```

---

### Get Recent Transactions
* **Method:** `GET`
* **Route:** `/expenses/dashboard/recent`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Recent transactions retrieved successfully",
    "data": {
      "expenses": [
        {
          "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          "title": "Taxi Ride",
          "amount": 15.00,
          "category": "Travel",
          "expenseDate": "2026-07-04T15:45:00.000Z"
        }
      ]
    }
  }
  ```

---

### Get Category Spending Summary
* **Method:** `GET`
* **Route:** `/expenses/analytics/category`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Category spending breakdown retrieved successfully",
    "data": {
      "categories": [
        {
          "category": "Food",
          "totalAmount": 420.50,
          "transactionCount": 12
        }
      ]
    }
  }
  ```

---

### Get Top Spending Categories
* **Method:** `GET`
* **Route:** `/expenses/analytics/top-categories`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Top spending categories retrieved successfully",
    "data": {
      "topCategories": [
        {
          "category": "Travel",
          "totalAmount": 1120.25
        },
        {
          "category": "Food",
          "totalAmount": 420.50
        }
      ]
    }
  }
  ```

---

### Get Monthly Summary (6-Month Trend)
* **Method:** `GET`
* **Route:** `/expenses/analytics/monthly-summary`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Monthly summary retrieved successfully",
    "data": {
      "monthlySummary": [
        {
          "month": "2026-06",
          "totalAmount": 1200.00,
          "count": 15
        },
        {
          "month": "2026-07",
          "totalAmount": 340.75,
          "count": 9
        }
      ]
    }
  }
  ```

---

### Get Detailed Monthly Analytics
* **Method:** `GET`
* **Route:** `/expenses/analytics/monthly-detail`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Detailed monthly analytics retrieved successfully",
    "data": {
      "analytics": [
        {
          "month": "2026-07",
          "totalAmount": 340.75,
          "breakdown": [
            {
              "category": "Food",
              "amount": 240.75
            },
            {
              "category": "Travel",
              "amount": 100.00
            }
          ]
        }
      ]
    }
  }
  ```
