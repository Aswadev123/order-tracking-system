# Order Tracking App

Small Next.js + MongoDB order tracking example.

## Prerequisites
- Node.js (recommended 18+)
- npm
- MongoDB running and reachable (use `.env.local` to set URI)

## Environment
Create `.env.local` at the project root with at least:

```
MONGO_URI=mongodb://127.0.0.1:27017/order-tracking
JWT_SECRET=your_jwt_secret_here
```

Do NOT commit secrets to git.

## Install

```bash
npm install
```

## Run (development)

```bash
npm run dev
```

Open http://localhost:3000

## Build / Production

```bash
npm run build
npm run start
```

## API endpoints (overview)
- `POST /api/auth/register` — register a user (body: name,email,password,role)
- `POST /api/auth/login` — login (body: email,password) => returns `token` and `role`
- `GET /api/orders/all` — ADMIN: list all orders
- `GET /api/drivers` — ADMIN: list driver users
- `POST /api/orders/create` — MERCHANT: create order (see below)
- `POST /api/orders/assign-driver` — ADMIN: assign driver to order
- `POST /api/orders/unassign-driver` — ADMIN: remove driver assignment
- `POST /api/orders/update-status` — DRIVER: update order status

## Creating an order (fields)
Merchant `POST /api/orders/create` accepts JSON body with at least:
- `customerName` (string, required)
- `address` (string, required)
- `phone` (string, required, digits)
- Optional: `pickAddress`, `cost`, `details`

These fields are persisted to the `orders` collection and displayed in dashboards.

## Migrating existing orders
If your existing orders lack the new fields (`pickAddress`, `phone`, `cost`, `details`), run the provided migration script to set them to `null`:

```bash
node scripts/migrate-add-order-fields.js
```

The script reads `.env.local` for `MONGO_URI`.

Alternatively use `mongosh` to update a single document:

```js
use order-tracking
db.orders.updateOne(
	{ _id: ObjectId("69582180bd18ed9f2c83dbc7") },
	{ $set: { pickAddress: null, phone: null, cost: null, details: null } }
)
```

## Testing / Linting
- Lint: `npm run lint` (requires ESLint setup)
- There are no automated tests currently; consider adding unit/integration tests for API routes.

## Notes & Recommendations
- Store `JWT_SECRET` and `MONGO_URI` securely (deployment secrets, not in repo).
- Server routes now validate inputs (e.g., phone and cost) for `create` route.
- Consider adding `OrderHistory` writes when orders are created/updated for auditability.
- Improve auth middleware: centralize token verification and role checks.

## Files of interest
- App: `app/` (Next.js app router pages and API routes)
- Models: `models/Order.ts`, `models/User.ts`, `models/OrderHistory.ts`
- Lib: `lib/db.ts`, `lib/auth.ts`
- Migration: `scripts/migrate-add-order-fields.js`

---

If you want, I can add a one-line `npm` script for running the migration or commit this README and run the migration here.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
