# NawaMart — Claude Code Instructions

## Project Overview
NawaMart is a Yemeni SaaS e-commerce platform.
Merchants create online stores, customers order and pay via
e-wallet screenshot (الوصل). Two store types: Physical + Digital.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS (RTL, Cairo font)
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Real-time: Socket.io (chat for digital orders)
- File uploads: Multer + Cloudinary
- Auth: JWT
- State: Zustand + React Query
- Deploy: Vercel (frontend) + Railway (backend)

## Folder Structure
### Frontend (nawamart-frontend/src/)
- /pages        → route-level components
- /components   → reusable UI components
- /hooks        → custom React hooks
- /utils        → helper functions
- /store        → Zustand state
- /api          → Axios API calls

### Backend (nawamart-api/src/)
- /routes       → API routes
- /controllers  → business logic
- /models       → Mongoose schemas
- /middleware   → auth, error handling
- /utils        → helpers (cloudinary, etc.)
- /config       → DB connection, env config

## Coding Rules
1. Always respond in English
2. Arabic text for ALL UI strings (labels, errors, buttons)
3. All API responses format:
   { success: true/false, data: {}, message: "" }
4. Error messages always in Arabic inside message field
5. After every task provide:
   - ✅ Summary of what was done
   - 🧪 How to Test (curl commands or browser steps)
   - 🌿 Git branch: feat/feature-name
   - 📝 Commit: feat: description

## Git Conventions
- Branches: feat/..., fix/..., chore/..., refactor/...
- Commits: conventional commits format
- Always commit after each completed task

## API Structure
- POST   /api/auth/merchant/register
- POST   /api/auth/merchant/login
- POST   /api/auth/customer/register
- POST   /api/auth/customer/login
- POST   /api/stores
- GET    /api/stores/my
- GET    /api/stores/:slug (public)
- PUT    /api/stores/:id
- POST   /api/products
- GET    /api/products/store/:storeId (public)
- PUT    /api/products/:id
- DELETE /api/products/:id
- POST   /api/orders
- GET    /api/orders/merchant
- PUT    /api/orders/:id/confirm
- PUT    /api/orders/:id/reject
- PUT    /api/orders/:id/ship
- PUT    /api/orders/:id/deliver
- POST   /api/upload/wasl
- GET    /api/chats/:chatId
- POST   /api/chats/:chatId/message

## Payment Flow (No API)
Customer pays via Cherry/Kuraimi/OneCash →
uploads وصل screenshot → merchant reviews manually →
confirms or rejects order

## Brand
- Primary: #1B3F72 | Accent: #F5A623
- Fonts: Cairo (Arabic) + Inter (English)
- Direction: RTL throughout

## Notion Task Board
https://www.notion.so/7ef5db0332744870b46678a1024e3258