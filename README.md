# ReTech Nepal

Buy. Sell. Exchange. Upgrade. A used and refurbished electronics marketplace for Nepal.

This is a **full-stack app**: a vanilla HTML/CSS/JS frontend served by an Express + Prisma backend with a real database, session-cookie authentication, and server-side order processing.

## Run it

```bash
cd backend
npm install
npx prisma db push     # create the SQLite database (backend/prisma/dev.db)
npm run seed           # load categories, demo accounts and 24 products
npm run dev            # start on http://localhost:4000
```

Open **http://localhost:4000** (always through this address, not by opening `index.html` directly — the API and session cookies need the server).

No database server to install: the backend uses **SQLite**, stored in `backend/prisma/dev.db`.

## Demo accounts

Password for all seeded accounts: `ChangeMe!2026` (set `SEED_PASSWORD` in `backend/.env` to change it).

| Email | Role |
|---|---|
| admin@retech.local | Super admin |
| market.mod@retech.local | Marketplace mod |
| support@retech.local | Support admin |
| buyer@retech.local | Customer |
| seller@retech.local | Seller |

## What's real (wired to the backend)

- **Catalog** — categories and products load from the database (`GET /api/categories`, `/api/products`), with search, filters, sorting and pagination done server-side.
- **Accounts** — register and log in with hashed passwords and HTTP-only session cookies (`/api/auth/*`). Role injection is ignored; CSRF is enforced on every state-changing request.
- **Checkout** — placing an order writes to the database, decrements stock atomically (no overselling), and is idempotent. Price and delivery are always recalculated on the server, never trusted from the browser.
- **Orders** — order history is fetched from the database per user (`GET /api/orders`), and orders can be cancelled while pending, which restores stock.

## Still client-side demos (no backend endpoints yet)

- **Seller listings / dashboard** (`sell.html`, `dashboard.html`) — stored in the browser.
- **Exchange requests** (`exchange.html`) — stored in the browser.
- **Seller messaging / contact form** (`product.html`, `contact.html`) — stored in the browser.
- **Admin console** (`admin.html`) — demonstration only, no access control.
- **Online payments** (eSewa, Khalti) — not connected; checkout offers Cash on Delivery.
- **Profile editing / addresses** — read-only for now.

## Structure

```
index.html, shop.html, ...   frontend pages (root)
assets/css                   styles
assets/js                    api.js (API client), catalog.js (loads live catalog),
                             main.js (shared UI), auth.js, shop.js, product.js,
                             cart.js, checkout.js, ...
backend/                     Express server + Prisma (SQLite)
  server.js                  serves the API and the frontend
  src/                       auth.js, catalog.js, orders.js, db.js, util.js
  prisma/schema.prisma       database schema
  prisma/seed.js             demo data
  tests/smoke.js             end-to-end API test suite (npm run test:smoke)
tools/check-images.js        verify product images (assets/images/p*.jpg)
```

## Data notes

Product images are optional. Put `p1.jpg` … `p24.jpg` in `assets/images/` (see `assets/images/IMAGES_NEEDED.md`); missing files fall back to a generated illustration. To reset the database, delete `backend/prisma/dev.db` and run `npx prisma db push` + `npm run seed` again.

## API

`POST /api/auth/register`, `/api/auth/login`, `/api/auth/logout`; `GET /api/auth/me`; `GET /api/categories`; `GET /api/products` (`q, category, brand, condition, location, minPrice, maxPrice, sort, page, limit`); `GET /api/products/:id`; `POST /api/orders` (COD); `GET /api/orders`; `POST /api/orders/:id/cancel`.

State-changing requests must send the header `X-Requested-With: fetch` (`assets/js/api.js` does this).