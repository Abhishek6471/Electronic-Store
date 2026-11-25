# ReTech Nepal backend (Batch 1)
Windows-friendly setup. Use PowerShell. Needs Node.js 20 LTS and PostgreSQL 16.

## 1. Install the tools
- Node.js 20 LTS from nodejs.org. Check: `node -v` shows v20.x.
- PostgreSQL 16 from postgresql.org (installer). Remember the password you set for the `postgres` user and keep port 5432.

## 2. Create the database
`& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE retech;"` (enter your password). Expected output: `CREATE DATABASE`.

## 3. Install and configure
```
cd path\to\retech-nepal\backend
npm install
copy .env.example .env
```
Edit `.env`: set `DATABASE_URL="postgresql://postgres:YOURPASSWORD@localhost:5432/retech?schema=public"`. If the password contains special characters, URL-encode them (`@` becomes `%40`).

## 4. Create tables, seed, run
```
npx prisma migrate dev --name init
npm run seed
npm run dev
```
Expected: migration applied and "Your database is now in sync"; `Seeded. Demo password: ...`; `ReTech Nepal on http://localhost:4000`.
Open http://localhost:4000 (always use this address, not the HTML file directly, so cookies and the API work).

## 5. Test (second PowerShell window, server still running)
`cd path\to\retech-nepal\backend` then `npm run test:smoke`. Expected: lines starting with PASS and a final `N passed, 0 failed`.

## Demo accounts
Password is SEED_PASSWORD from `.env` (default `ChangeMe!2026`, change it): admin@retech.local, market.mod@retech.local, community.mod@retech.local, support@retech.local, student@retech.local, buyer@retech.local, seller@retech.local

## Troubleshooting
- `P1000 Authentication failed`: wrong password in DATABASE_URL.
- `P1001 Can't reach database`: PostgreSQL service not running (open services.msc, start postgresql-x64-16) or wrong port.
- `Environment variable not found: DATABASE_URL`: `.env` missing or not inside `backend`.
- `Cannot find module '@prisma/client'`: run `npm install`, then `npx prisma generate`.
- `EADDRINUSE`: port 4000 is busy, change PORT in `.env`.
- `npm.ps1 cannot be loaded`: run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

## API in this batch
POST /api/auth/register, /login, /logout; GET /api/auth/me; GET /api/categories; GET /api/products (q, category, brand, condition, location, minPrice, maxPrice, sort, page, limit); GET /api/products/:id; POST /api/orders (COD only); GET /api/orders; POST /api/orders/:id/cancel.
State-changing requests must send the header `X-Requested-With: fetch` (assets/js/api.js does this).
