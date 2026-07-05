const jwt = require('jsonwebtoken');

function requireMfaChallenge(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'غير مصرح — يرجى تسجيل الدخول أولاً',
      });
    }
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'انتهت صلاحية الجلسة — يرجى تسجيل الدخول مجدداً',
      });
    }
    if (decoded.purpose !== 'mfa') {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'رمز غير صالح لمصادقة MFA',
      });
    }
    req.mfaUserId = decoded.id;
    if (decoded.storeId) req.mfaStoreId = decoded.storeId;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { requireMfaChallenge };
