# NawaMart Backend

Yemeni SaaS e-commerce platform API built with Node.js + Express + MongoDB.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# → Edit .env and fill in MONGODB_URI, JWT_SECRET, and Cloudinary credentials

# 3. Start dev server
npm run dev

# 4. Verify health
curl http://localhost:5000/api/health
```

## Project Structure

```
src/
├── config/
│   └── db.js               # MongoDB Atlas connection
├── controllers/
│   └── auth.controller.js  # Auth business logic
├── middleware/
│   ├── verifyToken.js       # JWT verification + role guard
│   └── errorHandler.js     # Global error handler
├── models/
│   ├── Merchant.js
│   ├── Customer.js
│   ├── Store.js
│   ├── Product.js
│   ├── Order.js
│   └── Chat.js
├── routes/
│   └── auth.routes.js
├── utils/
│   ├── cloudinary.js        # File upload helpers
│   └── helpers.js           # asyncHandler, paginate
├── app.js                   # Express app setup
└── server.js                # Entry point + Socket.io
```

## API Response Format

All endpoints return:
```json
{
  "success": true | false,
  "data": { ... } | null,
  "message": "رسالة بالعربية"
}
```

## Auth Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/merchant/register` | Register a new merchant |
| POST | `/api/auth/merchant/login` | Merchant login |
| POST | `/api/auth/customer/register` | Register a new customer |
| POST | `/api/auth/customer/login` | Customer login |

### Merchant Register
```bash
curl -X POST http://localhost:5000/api/auth/merchant/register \
  -H "Content-Type: application/json" \
  -d '{"name":"أحمد علي","email":"ahmed@example.com","phone":"777123456","password":"secret123"}'
```

### Merchant Login
```bash
curl -X POST http://localhost:5000/api/auth/merchant/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmed@example.com","password":"secret123"}'
```

### Customer Register
```bash
curl -X POST http://localhost:5000/api/auth/customer/register \
  -H "Content-Type: application/json" \
  -d '{"name":"فاطمة محمد","email":"fatima@example.com","phone":"711123456","password":"secret123"}'
```

### Customer Login
```bash
curl -X POST http://localhost:5000/api/auth/customer/login \
  -H "Content-Type: application/json" \
  -d '{"email":"fatima@example.com","password":"secret123"}'
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

## Using the JWT Token

```bash
# Use the token returned from login in subsequent requests:
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/stores/my
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | `development` or `production` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | Frontend URL for CORS |

## Git Branches

- `main` — production-ready code
- `feat/auth` — auth endpoints (current)
- `feat/stores` — store CRUD
- `feat/products` — product management
- `feat/orders` — order lifecycle
- `feat/chat` — real-time chat
