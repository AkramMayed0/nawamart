const jwt = require('jsonwebtoken');
const Merchant = require('../models/Merchant');
const Customer = require('../models/Customer');

/**
 * Verify JWT and attach decoded user to req.user
 * Supports both merchant and customer tokens.
 *
 * Token payload shape:
 *   { id, role: 'merchant' | 'customer', iat, exp }
 */
const verifyToken = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'غير مصرح — يرجى تسجيل الدخول أولاً',
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token signature & expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'انتهت صلاحية الجلسة — يرجى تسجيل الدخول مجدداً'
          : 'رمز المصادقة غير صالح';
      return res.status(401).json({ success: false, data: null, message });
    }

    // 3. Fetch user from DB based on role in token
    let user = null;
    if (decoded.role === 'merchant') {
      user = await Merchant.findById(decoded.id).select('-password');
    } else if (decoded.role === 'customer') {
      user = await Customer.findById(decoded.id).select('-password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'المستخدم غير موجود — يرجى تسجيل الدخول مجدداً',
      });
    }

    if (!user.isActive) {
      // Check if suspension was timed and has expired — auto-restore
      if (user.suspendedUntil && new Date(user.suspendedUntil) <= new Date()) {
        user.isActive = true;
        user.suspendedUntil = null;
        await user.save();
      } else {
        const remaining = user.suspendedUntil
          ? ` حتى ${new Date(user.suspendedUntil).toLocaleDateString('ar-YE')}`
          : ' — يرجى التواصل مع الدعم';
        return res.status(403).json({
          success: false,
          data: null,
          message: `تم تعليق حسابك${remaining}`,
        });
      }
    }

    // 4. Attach to request
    req.user = user;
    req.userRole = decoded.role;
    if (decoded.storeId) req.customerStoreId = decoded.storeId;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role guard — use AFTER verifyToken
 * Usage: requireRole('merchant') or requireRole('customer')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'ليس لديك صلاحية للوصول إلى هذا المورد',
      });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };
