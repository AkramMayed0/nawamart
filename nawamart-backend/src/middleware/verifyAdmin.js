const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * verifyAdmin — JWT middleware that only allows Admin tokens.
 * Attach as route middleware after verifyToken if you want combined guards,
 * or use standalone for admin-only routes.
 */
const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'غير مصرح — يرجى تسجيل دخول المشرف أولاً',
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'انتهت صلاحية جلسة المشرف — يرجى تسجيل الدخول مجدداً'
          : 'رمز المصادقة غير صالح';
      return res.status(401).json({ success: false, data: null, message });
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'هذه المنطقة للمشرفين فقط',
      });
    }

    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'حساب المشرف غير موجود أو معطل',
      });
    }

    req.user = admin;
    req.userRole = 'admin';
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyAdmin };
