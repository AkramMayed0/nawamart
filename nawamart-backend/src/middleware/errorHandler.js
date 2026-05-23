/**
 * Global error handling middleware.
 * Must be registered LAST in Express (after all routes).
 */
const errorHandler = (err, req, res, next) => {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'حدث خطأ غير متوقع في الخادم';

  // ─── Mongoose Validation Error ─────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // Collect all field messages
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join(' | ');
  }

  // ─── Mongoose Duplicate Key Error ─────────────────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    const fieldMap = {
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      slug: 'رابط المتجر',
    };
    const fieldName = fieldMap[field] || field;
    message = `${fieldName} مستخدم بالفعل — يرجى اختيار قيمة أخرى`;
  }

  // ─── Mongoose Cast Error (invalid ObjectId) ───────────────────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'المعرّف المُرسل غير صالح';
  }

  // ─── JWT Errors ───────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'رمز المصادقة غير صالح';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'انتهت صلاحية الجلسة — يرجى تسجيل الدخول مجدداً';
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    message,
    // Only expose stack in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler — register before errorHandler
 */
const notFound = (req, res, next) => {
  const error = new Error(`المسار غير موجود: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
