const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getFeatureRequests,
  voteFeatureRequest,
  unvoteFeatureRequest,
  updateFeatureRequestStatus,
  getNPSReport,
  getRecentFeedback,
  getFeedbackStats,
  getAllFeedback,
} = require('../controllers/feedback.controller');
const { verifyToken } = require('../middleware/verifyToken');
const { verifyAdmin } = require('../middleware/verifyAdmin');

async function verifyAnyAuth(req, res, next) {
  try {
    const jwt = require('jsonwebtoken');
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, data: null, message: 'غير مصرح — يرجى تسجيل الدخول أولاً' });
    }
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    if (decoded.role === 'admin') {
      req.user = decoded;
      req.userRole = 'admin';
      const Admin = require('../models/Admin');
      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin || !admin.isActive) {
        return res.status(401).json({ success: false, data: null, message: 'حساب المشرف غير موجود أو معطل' });
      }
      req.user = admin;
      return next();
    }
    return verifyToken(req, res, next);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, data: null, message: 'انتهت صلاحية الجلسة — يرجى تسجيل الدخول مجدداً' });
    }
    return res.status(401).json({ success: false, data: null, message: 'رمز المصادقة غير صالح' });
  }
}

router.post('/', verifyAnyAuth, submitFeedback);
router.get('/feature-requests', getFeatureRequests);
router.post('/feature-requests/:id/vote', verifyAnyAuth, voteFeatureRequest);
router.delete('/feature-requests/:id/vote', verifyAnyAuth, unvoteFeatureRequest);
router.patch('/feature-requests/:id/status', verifyAdmin, updateFeatureRequestStatus);
router.get('/nps-report', verifyAdmin, getNPSReport);
router.get('/recent', verifyAdmin, getRecentFeedback);
router.get('/stats', verifyAdmin, getFeedbackStats);
router.get('/', verifyAdmin, getAllFeedback);

module.exports = router;
