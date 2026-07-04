# Testing Guide

This guide details steps to test the ExpenseFlow API endpoints manually using the built-in Interactive Swagger Docs or Postman.

---

## 1. Testing with Swagger Interactive UI

Swagger OpenAPI documentation is integrated directly into the Express application.

### Setup and Steps:
1. Start the backend server: `npm run dev` (running on `http://localhost:5001` or your configured port).
2. Open your browser and navigate to: `http://localhost:5001/api-docs`.
3. **Register an Account:**
   - Locate the `POST /api/auth/register` endpoint.
   - Click **Try it out**.
   - Input a valid name, email, and password, then click **Execute**.
   - Copy the value of the `token` string returned in the response payload.
4. **Authenticate Swagger:**
   - Scroll to the top of the Swagger page and click the **Authorize** button (green lock icon).
   - In the text input field, type: `Bearer <YOUR_JWT_TOKEN>` (replace `<YOUR_JWT_TOKEN>` with the copied token value).
   - Click **Authorize**, then click **Close**.
5. **Test Protected Endpoints:**
   - Locate the `POST /api/expenses` endpoint.
   - Click **Try it out**, edit the JSON body (set title, amount, category), and click **Execute**.
   - The response should return `201 Created` with the generated expense record.

---

## 2. Testing with Postman

A pre-configured Postman integration test suite is located at `backend/src/docs/postman_collection.json`.

### Setup and Steps:
1. Open the Postman Desktop application.
2. Click **Import** in the top left, drag and drop `backend/src/docs/postman_collection.json` into the file zone.
3. Once imported, click the **Expense Tracker API** collection.
4. Go to the **Variables** tab of the collection:
   - Ensure the `base_url` variable is set to `http://localhost:5001/api` (or your production API URL).
5. **Run the Auth Flow:**
   - Run the `Register User` request to create a test account.
   - Run the `Login User` request. Postman is configured to capture the returning JWT token and automatically save it to a collection variable named `token`.
6. **Execute Expense Queries:**
   - All subsequent requests (e.g., Get Expenses, Create Expense) are pre-configured to use the `{{token}}` variable in their **Authorization** headers.
   - Try running `Get Expenses` with query params like `page=1&limit=5&category=Food`.

---

## 3. Core Test Scenarios

Verify the API behaves correctly under these scenarios:

| Test Case | Method / Route | Expected Payload / Input | Expected Status Code | Expected JSON Result |
|-----------|----------------|--------------------------|----------------------|----------------------|
| Duplicate Email | `POST /auth/register` | Existing email address | `409 Conflict` | Unique constraint fail message |
| Invalid Login | `POST /auth/login` | Wrong password or email | `401 Unauthorized` | "Invalid email or password" |
| Missed Token | `GET /expenses` | No Authorization header | `401 Unauthorized` | "Authentication required" |
| Format Validation | `POST /expenses` | Amount: `-50`, Category: `Fun` | `422 Unprocessable` | Validation messages array |
| Expense Ownership | `GET /expenses/:id` | Fetching another user's UUID | `404 Not Found` | "Expense not found or unauthorized" |
| Soft Delete | `DELETE /expenses/:id` | Valid expense ID | `200 OK` | `isDeleted: true` |
