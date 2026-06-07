const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { requestId, sanitizeRequest } = require('./middleware/security');
const { validateEnv } = require('./config/env');

const app = express();
const runtime = validateEnv();

app.set('trust proxy', 1);
app.use(requestId);

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: runtime.isProduction ? undefined : false,
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = runtime.allowedOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: Origin ${origin} is not allowed`));
    },
    credentials: true,
  })
);

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX || 600),
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
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    data: null,
    message: 'عدد محاولات تسجيل الدخول تجاوز الحد — يرجى المحاولة بعد 15 دقيقة',
  },
});

app.use(globalLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.FORM_BODY_LIMIT || '1mb' }));
app.use(sanitizeRequest);

// ─── Static Files (Uploads) ───────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  etag: true,
  immutable: true,
  maxAge: runtime.isProduction ? '7d' : 0,
}));

// ─── HTTP Logging ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  morgan.token('id', (req) => req.id);
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : ':id :remote-addr :method :url :status :res[content-length] - :response-time ms'));
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

app.get('/api/ready', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({
    success: ready,
    data: {
      status: ready ? 'ready' : 'not_ready',
      database: mongoose.STATES[mongoose.connection.readyState] || 'unknown',
      timestamp: new Date().toISOString(),
    },
    message: ready ? 'Ready' : 'Database is not connected',
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
const featureRoutes = require('./routes/feature.routes');
const antiFraudRoutes = require('./routes/antiFraud.routes');
const courierRoutes = require('./routes/courier.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');

app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/anti-fraud', antiFraudRoutes);
app.use('/api/courier', courierRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// ─── 404 & Global Error Handler ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
