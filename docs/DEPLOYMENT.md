# Deployment Guide

This guide details steps to build, configure, and launch the backend (REST API) and frontend (Vite React app) into production environments.

---

## 1. Backend Deployment

The backend can be deployed to any platform supporting Node.js or Docker (e.g., Render, Railway, Fly.io, Heroku). Below are the steps for Render and Railway.

### Deployment Prerequisites
Ensure your database is provisioned and accessible. You can spin up a PostgreSQL instance via Render Databases, Railway, or AWS RDS. Get your connection string:
`postgresql://db_user:db_password@db_host:5432/db_name?schema=public`

---

### Option A: Deploying to Railway
Railway uses the config in `backend/railway.json` to define its environment.

1. Install the Railway CLI: `npm i -g @railway/cli`
2. Authenticate: `railway login`
3. Navigate to the backend directory: `cd backend`
4. Initialize project: `railway init`
5. Link your database and provision variables.
6. Push code to deploy: `railway up`

Required Environment Variables in Railway dashboard:
- `PORT` = `8080` (or leave empty, Railway injects it)
- `DATABASE_URL` = `<your_postgres_connection_string>`
- `JWT_SECRET` = `<generate_random_hash_string>`
- `JWT_EXPIRES_IN` = `7d`
- `NODE_ENV` = `production`
- `CORS_ORIGIN` = `https://your-frontend-domain.vercel.app`

---

### Option B: Deploying to Render
Render uses the configuration file `backend/render.yaml` to deploy.

1. Push your monorepo code to GitHub.
2. Sign in to your Render Dashboard and create a new **Web Service**.
3. Connect your repository.
4. Set the following fields in the dashboard:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command:** `npm start`
5. Click **Advanced** and add these Environment Variables:
   - `DATABASE_URL` = `<your_render_postgresql_url>`
   - `JWT_SECRET` = `<your_random_jwt_key>`
   - `JWT_EXPIRES_IN` = `7d`
   - `NODE_ENV` = `production`
   - `CORS_ORIGIN` = `https://your-frontend-domain.vercel.app`

---

## 2. Frontend Deployment (Vercel)

The frontend is a static React application built using Vite. The ideal hosting provider is Vercel.

### Vercel Deployment Steps
1. Navigate to the [Vercel Dashboard](https://vercel.com) and click **Add New Project**.
2. Select your GitHub repository.
3. Configure the project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Expand the **Environment Variables** section and add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend-render-or-railway-url.com/api` (ensure it ends in `/api`)
5. Click **Deploy**.

### SPA Routing Handler
When Vercel builds the app, navigating between routes works because React Router handles path swaps. However, reloading a URL like `/dashboard` directly from the address bar will trigger a Vercel 404 because the server looks for a physical `dashboard` file.

To solve this, a `frontend/vercel.json` file is present in the repository:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This forces Vercel to route all sub-paths back to `index.html`, allowing the client-side router to handle the path transition smoothly.

---

## 3. Post-Deployment Verification

1. **Verify Backend Health:** Navigate to `https://your-backend-api.com/health`. You should receive a JSON response:
   ```json
   {
     "success": true,
     "message": "Server is healthy and running"
   }
   ```
2. **Verify API Docs:** Access your backend's Swagger UI: `https://your-backend-api.com/api-docs`.
3. **Verify CORS Connection:** Log into the Vercel dashboard frontend. Open your browser console. If request actions fail with `CORS policy` warnings, check that the backend environment variable `CORS_ORIGIN` matches the exact frontend domain name (without trailing slash).
