const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (
  process.env.CLIENT_URL || 'http://localhost:3000,http://localhost:5173'
)
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      // Always allow Vite dev server (5173) regardless of .env configuration
      if (!origin || allowedOrigins.includes(origin) || origin === 'http://localhost:5173') {
        return callback(null, true);
      }
      callback(new Error(`CORS: Origin ${origin} غير مسموح`));
    },
    credentials: true,
  })
);

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: 'عدد الطلبات تجاوز الحد المسموح — يرجى المحاولة بعد 15 دقيقة',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60, // Stricter for auth routes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: 'عدد محاولات تسجيل الدخول تجاوز الحد — يرجى المحاولة بعد 15 دقيقة',
  },
});

app.use(globalLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files (Uploads) ───────────────────────────────────────────────────
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── HTTP Logging ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()) + 's',
    },
    message: 'الخادم يعمل بشكل طبيعي',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth/merchant/register', authLimiter);
app.use('/api/auth/merchant/login', authLimiter);
app.use('/api/auth/merchant/forgot-password', authLimiter);
app.use('/api/auth/customer/register', authLimiter);
app.use('/api/auth/customer/login', authLimiter);
app.use('/api/auth/customer/forgot-password', authLimiter);
app.use('/api/admin/login', authLimiter);
app.use('/api/admin/forgot-password', authLimiter);
app.use('/api/auth', authRoutes);
const storeRoutes = require('./routes/store.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const uploadRoutes = require('./routes/upload.routes');
const chatRoutes = require('./routes/chat.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const walletRoutes = require('./routes/wallet.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const adminRoutes = require('./routes/admin.routes');

app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/admin', adminRoutes);

// ─── 404 & Global Error Handler ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
