# Deployment Guide

> **ExpenseFlow** — Production deployment guide  
> Frontend: Vercel | Backend: Railway / Render | Database: Neon / Supabase

---

## Overview

ExpenseFlow is a monorepo with two deployable units:

| Unit | Recommended Platform | Alternative |
|------|---------------------|-------------|
| React SPA (frontend) | Vercel | Netlify, Cloudflare Pages |
| Node.js API (backend) | Railway | Render, Fly.io, AWS EC2 |
| PostgreSQL | Neon | Supabase, Railway PostgreSQL |

---

## Pre-Deployment Checklist

Before deploying, verify:

- [ ] All environment variables documented and available
- [ ] `NODE_ENV=production` set on backend
- [ ] `DATABASE_URL` points to production PostgreSQL
- [ ] `CLIENT_URL` set to your production frontend URL
- [ ] `GOOGLE_CLIENT_ID` matches the OAuth client configured for your production domain
- [ ] Google Cloud Console has your production domain in authorized JavaScript origins
- [ ] Email SMTP credentials configured and tested
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are strong random strings (32+ chars)
- [ ] `.env` files are in `.gitignore` and not committed

---

## Database Setup (Neon)

### 1. Create a Neon project

1. Go to [neon.tech](https://neon.tech) → New Project
2. Choose region closest to your backend server
3. Copy the connection string

### 2. Set DATABASE_URL

```
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/expenseflow?sslmode=require
```

### 3. Run Prisma migrations

```bash
cd backend
DATABASE_URL=<your-prod-url> npx prisma migrate deploy
```

> Use `migrate deploy` (not `db push`) in production — it runs tracked migration files only.

---

## Backend Deployment (Railway)

### 1. Create Railway Project

```bash
npm install -g @railway/cli
railway login
railway init
```

### 2. Set Environment Variables

In Railway dashboard → Variables, set all variables from `backend/.env`:

```
NODE_ENV=production
PORT=5001
DATABASE_URL=...
JWT_SECRET=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=...
JWT_REFRESH_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=...
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASS=...
CLIENT_URL=https://your-frontend.vercel.app
```

### 3. Configure Start Command

In Railway settings, set start command to:

```
node src/server.js
```

Or add to `backend/package.json`:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### 4. Deploy

Railway auto-deploys on every push to `main`. Alternatively:

```bash
railway up
```

### 5. Verify Deployment

```bash
curl https://your-backend.railway.app/api/auth/profile
# Should return 401 (which means the server is running correctly)
```

---

## Frontend Deployment (Vercel)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Configure `vite.config.ts`

Ensure the Vite proxy is only active in development. In production, `VITE_API_URL` should point directly to your backend:

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
```

### 3. Set Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://your-backend.railway.app/api
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

### 4. Deploy

```bash
cd frontend
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments on push.

### 5. Configure SPA Routing

Create `frontend/public/vercel.json` to handle client-side routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Google OAuth Production Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project → APIs & Services → Credentials
3. Open your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   ```
   https://your-frontend.vercel.app
   ```
5. Add to **Authorized redirect URIs** (if using redirect flow):
   ```
   https://your-frontend.vercel.app/auth/callback
   ```
6. Save and wait 5 minutes for changes to propagate

---

## CORS Configuration

Ensure `CLIENT_URL` in your backend environment matches your exact frontend URL (including protocol, no trailing slash):

```javascript
// app.js
app.use(cors({
  origin: process.env.CLIENT_URL,  // e.g. https://expenseflow.vercel.app
  credentials: true,
}));
```

---

## Production Health Check

After deployment, verify each component:

```bash
# Backend health
curl https://your-api.railway.app/health
# Expected: { "status": "ok" }

# API authentication
curl -X POST https://your-api.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
# Expected: 401 Invalid credentials (server is working)

# Swagger docs
open https://your-api.railway.app/api-docs
```

---

## Environment Variables Reference

### Backend (Required)

| Variable | Example | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Runtime environment |
| `PORT` | `5001` | HTTP server port |
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection string |
| `JWT_SECRET` | `<32+ random chars>` | Access token signing key |
| `JWT_EXPIRES_IN` | `15m` | Access token TTL |
| `JWT_REFRESH_SECRET` | `<32+ random chars>` | Refresh token signing key |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token TTL |
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Google OAuth client ID |
| `CLIENT_URL` | `https://expenseflow.vercel.app` | Frontend origin (CORS + emails) |

### Backend (Optional)

| Variable | Example | Description |
|----------|---------|-------------|
| `EMAIL_HOST` | `smtp.gmail.com` | SMTP server hostname |
| `EMAIL_PORT` | `587` | SMTP port |
| `EMAIL_USER` | `noreply@yourapp.com` | SMTP username |
| `EMAIL_PASS` | `<app password>` | SMTP password |
| `EMAIL_FROM` | `ExpenseFlow <noreply@yourapp.com>` | Sender display name |

### Frontend

| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `https://your-api.railway.app/api` | Backend API base URL |
| `VITE_GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Google OAuth client ID |

---

## Troubleshooting

### `CORS error` in browser

- Verify `CLIENT_URL` in backend environment exactly matches your frontend URL
- Include protocol (`https://`) and no trailing slash
- Check that the backend CORS middleware is applied before routes in `app.js`

### `401 Unauthorized` after login

- Verify `VITE_API_URL` is set correctly in frontend environment
- Check that the backend is reachable from the frontend URL
- Confirm `JWT_SECRET` is identical between deploy environments

### `P2002` Unique constraint error on register

- The email is already in the database
- Check if you ran `prisma db push` multiple times with conflicting schemas

### Google Sign-In shows `invalid_client`

- The `GOOGLE_CLIENT_ID` is incorrect or points to the wrong Google Cloud project
- Your production domain is not in the authorized JavaScript origins list

### Email not being sent

- Verify `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` are all set
- For Gmail: use an App Password, not your Google account password
- Check SMTP port — 587 for STARTTLS, 465 for SSL

### Database connection refused

- Verify `DATABASE_URL` format is correct for your provider
- For Neon: append `?sslmode=require` to the connection string
- Check that your backend server's IP is in the database allowlist (some providers require this)
