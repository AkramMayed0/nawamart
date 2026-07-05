# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NawaMart is a Yemeni SaaS e-commerce platform. Merchants subscribe to a plan, create stores, and customers shop through those storefronts. The repo is a monorepo with two apps:

- `nawamart-backend/` — Node.js/Express REST API + Socket.io
- `nawamart-frontend/` — React 18 / Vite SPA (RTL, Arabic UI)

---

## Commands

### Root (orchestrates both apps)
```bash
npm run ci              # install + test backend, install + build frontend
npm run build:frontend  # build frontend only
npm run test:backend    # run backend unit tests only
```

### Backend (`nawamart-backend/`)
```bash
npm run dev             # nodemon watch mode
npm start               # production node
npm test                # unit test (test-proration.js)
npm run test:integration  # subscription limits integration test
npm run check           # syntax-only check (node --check)
npm run audit           # npm audit --audit-level=high
npm run backup:create   # create a platform backup
npm run backup:list     # list existing backups
npm run backup:restore  # restore from a backup
```

### Frontend (`nawamart-frontend/`)
```bash
npm run dev     # Vite dev server (http://localhost:5173)
npm run build   # production build
npm run preview # preview the production build
```

---

## Environment Setup

Copy `nawamart-backend/.env.example` to `nawamart-backend/.env`. Required variables:

| Variable | Notes |
|---|---|
| `MONGODB_URI` | Atlas connection string |
| `JWT_SECRET` | ≥32 chars in production |
| `CLIENT_URL` | Comma-separated allowed origins |
| `CLOUDINARY_*` | Cloud name, API key/secret |
| `SMTP_*` | Nodemailer config for password-reset emails |
| `GOOGLE_CLIENT_ID` | OAuth2 |

In development, `CLIENT_URL` defaults to `http://localhost:3000,http://localhost:5173`.

---

## Architecture

### Backend

**Entry points:** `src/server.js` creates the HTTP server and Socket.io instance, connects MongoDB, seeds themes, and starts the cron-style analytics/backup scheduler. `src/app.js` builds the Express app (middleware stack, all route mounts) and is imported by `server.js`.

**Auth model:** Three user types — `Merchant`, `Customer`, `Admin`. JWTs carry `{ id, role }`. `verifyToken` middleware DB-hydrates the user on every request and auto-lifts timed suspensions. `requireRole()` is the role guard applied after `verifyToken`. Staff inherit from the merchant's store via `StoreStaff` model + `rbac.js` middleware.

**Plan system:** `PlanService.js` is the stateless single source of truth for plan constants (starter/pro/business), prices (YER), and upgrade validation. `BillingService.js` handles subscription lifecycle. `ProrationService.js` computes credits on upgrades. `planLimits.js` middleware enforces per-plan caps before route handlers run. `requireFeature.js` middleware gates features via `FeatureService.js`.

**API response shape:** All responses follow `{ success: bool, data: any, message: string }`.

**Key middleware chain (per request):**
1. `requestId` → `helmet` → `mongoSanitize` → `cors` → `globalLimiter` → body-parser → `sanitizeRequest` → `stripHtml`
2. Route-specific: `authLimiter` on auth endpoints, `verifyToken` → `requireRole` → `planLimits`/`requireFeature` on protected routes

**Socket.io:** Mounted on the same HTTP server. Auth via `socket.handshake.auth.token`. Chat rooms are joined explicitly by `joinRoom`/`join_chat` events. Message sending is API-only (sockets are used for presence, typing, and read receipts only). The `io` instance is attached to `app` via `app.set('io', io)` so controllers can emit events.

**Scheduler:** `server.js` runs `setInterval`-based jobs for daily/weekly/monthly metric snapshots (`MetricsService`), hourly report delivery (`ReportService`), hourly backup cleanup, and daily full backup (`BackupService`).

**Services layer:** All business logic lives in `src/services/`. Controllers are thin and delegate to services. Notable services: `OrderService`, `InventoryService`, `WalletService`, `DigitalDeliveryService`, `WebhookService`, `AuditService`.

### Frontend

**State management:** Zustand stores for each actor — `useAuthStore` (merchant), `useCustomerAuthStore` (customer), `useAdminStore`. React Query handles server state / caching.

**Routing (App.jsx):**
- `/` — landing page
- `/dashboard/*` — merchant dashboard (protected, requires merchant JWT)
- `/admin/*` — super-admin panel (separate session via `getAdminSession`)
- `/courier/*` — courier portal
- `/store/:slug/*` — public storefront (StorefrontLayout)
- `/auth/*` — merchant auth flows
- `/subscribe/*` — plan subscription

**Admin panel (`/admin/*`):** Completely separate auth session from the merchant/customer JWT flow. Uses `useAdminStore` (Zustand) and a distinct `verifyAdmin` middleware on the backend that checks `role === 'admin'` in the decoded JWT. Admin tokens are NOT interchangeable with merchant tokens.

Admin pages and their backend endpoints:

| Frontend page | Backend route | Purpose |
|---|---|---|
| `AdminLogin` | `POST /api/admin/login` | Admin-only login (email + password) |
| `AdminForgotPassword` | `POST /api/admin/forgot-password` | Send reset email |
| `AdminResetPassword` | `POST /api/admin/reset-password/:token` | Consume reset token |
| `AdminOverview` | `GET /api/admin/stats` | Platform-wide counts: merchants, stores, orders, revenue |
| `AdminMerchants` | `GET /api/admin/merchants` · `GET /api/admin/merchants/:id` · `PATCH /api/admin/merchants/:id/toggle-active` | List, inspect, activate/suspend merchants |
| `AdminStores` | `GET /api/admin/stores` · `PATCH /api/admin/stores/:id/toggle-active` · `PATCH /api/admin/stores/:id/set-plan` | List stores, toggle active, manually override plan |
| `AdminOrders` | `GET /api/admin/orders` | Platform-wide order list (paginated) |
| `AdminCustomers` | `GET /api/admin/customers` · `PATCH /api/admin/customers/:id/toggle-active` | List and suspend customers |
| `AdminSubscriptions` | `/api/subscriptions` (shared) | View and manage merchant subscriptions |
| `AdminAnalytics` | `/api/analytics` + `/api/reports` | Platform metrics and report delivery |
| `AdminHealthScores` | `/api/admin/health-scores` (via MetricsService) | Merchant health scoring |
| `AdminTickets` | `/api/support/tickets` | Support ticket queue |
| `AdminKnowledgeBase` | `/api/support/knowledge` | Knowledge base articles |
| `AdminFeedback` | `/api/support/feedback` | User feedback submissions |
| `AdminFeatureFlags` | `GET/POST/PUT/DELETE /api/admin/features` | Toggle platform-wide feature flags |
| `AdminChangelog` | `GET/POST/PUT/DELETE /api/admin/changelog` | Manage public changelog entries |

**Seeding the first admin account (dev only):**
```bash
curl -X POST http://localhost:5000/api/admin/seed
# Creates admin@nawamart.com / Admin@123456 — change immediately
```
This endpoint is blocked in `NODE_ENV=production`.

**Admin model:** `src/models/Admin.js` — minimal schema (name, email, hashed password, isActive, password-reset fields). No plan/store association. `verifyAdmin` middleware in `src/middleware/verifyAdmin.js` handles token verification independently of `verifyToken`.

**API layer:** `src/api/axios.js` is the configured Axios instance. Per-domain files (`auth.js`, `stores.js`, `orders.js`, etc.) export typed request functions.

**UI stack:** Tailwind CSS with `dir="rtl"`. Font is Cairo (Arabic). Component library is `lucide-react` for icons, `react-hot-toast` for notifications.

**Storefront theming:** Merchants configure themes via `/api/themes` and `/api/theme-settings`. The `ThemeCustomizerPage` in the dashboard writes to `ThemeSetting` model which the public storefront reads at runtime.

---

## DevOps

**CI (GitHub Actions `.github/workflows/ci.yml`):** Triggers on PR and push to `main`. Two parallel jobs:
- `backend`: `npm ci` → syntax check → security audit → unit tests
- `frontend`: `npm ci` → security audit → `vite build`

**Docker:** `docker-compose.yml` at repo root. Backend on port 5000, frontend (nginx) on port 80. Pass secrets via environment variables — they are not baked into the image.

**Health endpoints:**
- `GET /api/health` — always 200, returns uptime/env
- `GET /api/ready` — 200 only when MongoDB is connected (use for k8s readiness probes)

**Graceful shutdown:** `SIGTERM`/`SIGINT` close the HTTP server before `process.exit(0)`. Unhandled rejections also trigger graceful shutdown.

**Logging:** Winston with daily-rotate-file transport (`src/utils/logger.js`). HTTP access logs go through Morgan → Winston.

**Backups:** `BackupService.js` + scripts in `nawamart-backend/scripts/`. Managed via npm scripts and the hourly scheduler.
