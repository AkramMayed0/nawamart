# NawaMart API — Antigravity Instructions

## Project
NawaMart backend API — Yemeni SaaS e-commerce platform.

## Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Multer + Cloudinary (file uploads)
- Socket.io (real-time chat)

## Folder Structure
src/
  routes/       → API routes
  controllers/  → business logic
  models/       → Mongoose schemas
  middleware/   → auth, error handling
  utils/        → cloudinary, helpers
  config/       → DB connection

## API Response Format
Always return:
{ success: true/false, data: {}, message: "" }

## Error Messages
Always in Arabic inside message field

## Rules
1. After every task provide:
   - ✅ What was done
   - 🧪 How to Test (curl commands)
   - 🌿 Git branch: feat/feature-name
   - 📝 Commit: conventional commits format
2. Never expose .env values
3. Always validate inputs server-side
4. Return 401 for unauth, 403 for forbidden

## Core Payment Flow
No payment gateway. Customer pays via 
Cherry/Kuraimi/OneCash → uploads وصل screenshot → 
merchant manually confirms.

## API Endpoints to build (in order):
1. POST /api/auth/merchant/register
2. POST /api/auth/merchant/login
3. POST /api/auth/customer/register
4. POST /api/auth/customer/login
5. POST /api/stores
6. GET  /api/stores/my
7. GET  /api/stores/:slug (public)
8. PUT  /api/stores/:id
9. POST /api/products
10. GET  /api/products/store/:storeId
11. PUT  /api/products/:id
12. DELETE /api/products/:id
13. POST /api/orders
14. GET  /api/orders/merchant
15. PUT  /api/orders/:id/confirm
16. PUT  /api/orders/:id/reject
17. PUT  /api/orders/:id/ship
18. PUT  /api/orders/:id/deliver
19. POST /api/upload/wasl
20. GET  /api/chats/:chatId
21. POST /api/chats/:chatId/message

## Notion Task Board
https://www.notion.so/41699d4b62cb4817a5692a72f300c03f