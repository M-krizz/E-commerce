# ParamaShop Frontend

Next.js 15 App Router frontend for ParamaShop (TypeScript, Tailwind CSS).

## Structure

- **`app/`** — Routes: layout, landing, auth (login, OTP), dashboard (user, seller, admin), products (add, list), orders (place, history), logs
- **`components/`** — Navbar, Sidebar, ProtectedRoute, ProductCard, OrderTable
- **`utils/`** — auth, roleGuard
- **`lib/`** — Axios API client (`lib/axios.ts`; config lives here instead of `app/api` to avoid conflicting with Next.js API routes)
- **`styles/`** — globals.css

## Setup

```bash
npm install
# Copy .env.local.example to .env.local if needed
npm run dev
```

Backend API URL: set `NEXT_PUBLIC_API_URL` in `.env.local` (default `http://localhost:5000`).

## Scripts

- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run start` — Production server
- `npm run lint` — ESLint
