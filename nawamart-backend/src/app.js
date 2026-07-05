const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const mfaRoutes = require('./routes/mfa.routes');
const staffRoutes = require('./routes/staff.routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { requestId, sanitizeRequest, stripHtml } = require('./middleware/security');
const { validateEnv } = require('./config/env');
const logger = require('./utils/logger');

const app = express();
const runtime = validateEnv();

app.set('trust proxy', 1);
app.use(requestId);

const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", 'https://accounts.google.com'],
  styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  fontSrc: ["'self'", 'https://fonts.gstatic.com'],
  imgSrc: ["'self'", 'data:', 'blob:',
    ...(process.env.CLOUDINARY_CLOUD_NAME ? [`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}`] : []),
  ],
  connectSrc: ["'self'", 'https://accounts.google.com', 'https://maps.googleapis.com'],
  frameSrc: ["'self'", 'https://accounts.google.com'],
  objectSrc: ["'none'"],
  upgradeInsecureRequests: runtime.isProduction ? [] : undefined,
};

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: runtime.isProduction
    ? { directives: cspDirectives }
    : false,
  hsts: runtime.isProduction
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,
}));

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// ─── Logging ──────────────────────────────────────────────────────────────────
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

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

// ─── Body Parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '10kb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.FORM_BODY_LIMIT || '1mb' }));
app.use(sanitizeRequest);
app.use(stripHtml);

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
app.use('/api/mfa', mfaRoutes);
app.use('/api/staff', staffRoutes);
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
const activityRoutes = require('./routes/activity.routes');
const searchRoutes = require('./routes/search.routes');
const bulkRoutes = require('./routes/bulk.routes');
const exportRoutes = require('./routes/export.routes');
const discountRoutes = require('./routes/discount.routes');
const apiKeyRoutes = require('./routes/apiKey.routes');
const webhookRoutes = require('./routes/webhook.routes');
const publicApiRoutes = require('./routes/publicApi.routes');
const complianceRoutes = require('./routes/compliance.routes');
const { getPublicLegalPage } = require('./controllers/compliance.controller');
const analyticsRoutes = require('./routes/analytics.routes');
const reportRoutes = require('./routes/report.routes');
const ticketRoutes = require('./routes/ticket.routes');
const knowledgeRoutes = require('./routes/knowledge.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const backupRoutes = require('./routes/backup.routes');
const featureFlagRoutes = require('./routes/featureFlag.routes');
const adminFeatureFlagRoutes = require('./routes/adminFeatureFlag.routes');
const featureOptInRoutes = require('./routes/featureOptIn.routes');
const changelogRoutes = require('./routes/changelog.routes');
const adminChangelogRoutes = require('./routes/adminChangelog.routes');
const themeRoutes = require('./routes/theme.routes');
const themeSettingsRoutes = require('./routes/themeSettings.routes');
const themePresetRoutes = require('./routes/themePreset.routes');
const homepageRoutes = require('./routes/homepage.routes');
const themeAssetRoutes = require('./routes/themeAsset.routes');
const pageRoutes = require('./routes/page.routes');
const inventoryRoutes = require('./routes/inventory.routes');

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
app.use('/api/activity', activityRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/bulk', bulkRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/v1', publicApiRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/support/tickets', ticketRoutes);
app.use('/api/support/knowledge', knowledgeRoutes);
app.use('/api/support/feedback', feedbackRoutes);
app.use('/api/backups', backupRoutes);
app.use('/api/changelog', changelogRoutes);
app.use('/api/features/flags', featureFlagRoutes);
app.use('/api/features/opt-in', featureOptInRoutes);
app.use('/api/admin/features', adminFeatureFlagRoutes);
app.use('/api/admin/changelog', adminChangelogRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/theme-settings', themeSettingsRoutes);
app.use('/api/theme-presets', themePresetRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/theme-assets', themeAssetRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/inventory', inventoryRoutes);

app.get('/api/stores/:slug/legal/:type', getPublicLegalPage);

// ─── 404 & Global Error Handler ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
