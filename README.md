<div align="center">

# 🛒 Electroni-Store

**Buy. Sell. Exchange. Upgrade.** — A full-stack marketplace for quality-tested used and refurbished electronics in Nepal.

A complete e-commerce platform built for an E-Commerce Practical Examination: a vanilla-JS storefront served by a Node.js + Express API with a relational database, session-cookie authentication, and server-side order processing.

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-database-003B57?logo=sqlite&logoColor=white)

</div>

---

## ✨ What it does

A customer can browse a catalogue of refurbished devices, filter and search, add items to a cart and wishlist, create an account, place a **Cash-on-Delivery** order, and track it in their order history. Behind the scenes every order is validated and priced **on the server**, and stock is decremented **atomically** to prevent overselling.

| Area | Details |
|---|---|
| 🛍 **Catalogue** | 8 categories, 24 products, server-side search / filter / sort / pagination |
| 🔐 **Authentication** | Register & login with bcrypt-hashed passwords and HTTP-only session cookies |
| 🛡 **Security** | CSRF protection on all state-changing routes, role-injection blocked, rate-limited login |
| 🛒 **Cart & Wishlist** | Per-user, persisted in the database |
| 💳 **Checkout** | COD orders, server-recalculated totals, idempotency-key deduplication |
| 📦 **Stock** | Atomic decrement — parallel orders can never oversell |
| 🧾 **Orders** | Order history and cancellation (restores stock) |
| 🎨 **UI** | Responsive dark/light theme, product gallery, compare tool |

## 🧱 Tech Stack

- **Frontend:** HTML5, CSS3, vanilla JavaScript (ES6+) — no frameworks
- **Backend:** Node.js, Express.js
- **Database:** SQLite via **Prisma ORM** (15 models)
- **Auth:** bcryptjs + cookie sessions + CSRF middleware
- **Validation:** Zod schemas on every API input
- **Testing:** Custom end-to-end API smoke suite (36 assertions)

## 🚀 Getting Started

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Create the database
cp .env.example .env        # then edit DATABASE_URL if needed
npx prisma db push

# 3. Seed categories, demo users and 24 products
npm run seed

# 4. Start the server
npm run dev
```

Open **http://localhost:4000** — always through the server, not by opening `index.html` directly, so the API and session cookies work.

### Demo accounts

All seeded accounts use the password **`ChangeMe!2026`**.

| Email | Role |
|---|---|
| `admin@retech.local` | Super admin |
| `buyer@retech.local` | Customer |
| `seller@retech.local` | Seller |

## 📁 Project Structure

```
├── index.html, shop.html, ...   Storefront pages (vanilla JS)
├── assets/
│   ├── css/                   Stylesheets
│   └── js/                    api.js (API client), catalog.js, auth.js, cart.js, ...
├── backend/
│   ├── server.js              Express app — serves API + static frontend
│   ├── src/                   auth, catalog, orders, db, util
│   ├── prisma/
│   │   ├── schema.prisma      Database schema (15 models)
│   │   └── seed.js            Demo data seeder
│   └── tests/smoke.js         36-assertion end-to-end API suite
└── tools/                     Dev utilities
```

## 🔌 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login (sets session cookie) |
| `POST` | `/api/auth/logout` | Logout |
| `GET` | `/api/auth/me` | Current session user |
| `GET` | `/api/categories` | List categories |
| `GET` | `/api/products` | Search / filter / sort / paginate |
| `GET` | `/api/products/:id` | Product detail |
| `POST` | `/api/orders` | Place COD order |
| `GET` | `/api/orders` | Current user's orders |
| `POST` | `/api/orders/:id/cancel` | Cancel a pending order |

> State-changing requests must send `X-Requested-With: fetch` (handled by `assets/js/api.js`) as CSRF defence.

## 🧪 Testing

```bash
cd backend
npm run test:smoke      # requires the server running + database seeded
```

Covers catalogue filtering/sorting, auth + CSRF, order pricing and idempotency, stock atomicity under a parallel overselling race, and cancellation restoring stock — **36 assertions**.

## ⚠️ Scope & Limitations

This is an **educational project**; some features are intentionally simplified:

- **Sample data** — the 24 products are demo seed data, not real inventory.
- **Payments** — eSewa / Khalti are not integrated; checkout offers Cash on Delivery only.
- **Seller portal** — seller listings, exchange requests and the admin console are client-side demonstrations without backend endpoints yet.
- **Images** — product photos are optional; missing files fall back to a generated illustration.

## 🔭 Future Enhancements

- Integrate eSewa / Khalti payment gateways
- Seller portal + admin approval workflow (backend)
- Cloud image storage and email/SMS notifications
- Reviews and ratings moderation

---

<div align="center">
Built as an E-Commerce Practical Examination project.
</div>
