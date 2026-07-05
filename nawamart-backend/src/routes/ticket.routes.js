const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  addMessage,
  changeStatus,
  assignTicket,
  addInternalNote,
  rateSatisfaction,
  getTicketStats,
} = require('../controllers/ticket.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');
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

router.post('/', verifyAnyAuth, requireRole('admin', 'merchant', 'customer'), createTicket);
router.get('/', verifyAnyAuth, getTickets);
router.get('/stats', verifyAdmin, getTicketStats);
router.get('/:id', verifyAnyAuth, getTicketById);
router.post('/:id/messages', verifyAnyAuth, addMessage);
router.patch('/:id/status', verifyAnyAuth, changeStatus);
router.patch('/:id/assign', verifyAdmin, assignTicket);
router.post('/:id/notes', verifyAdmin, addInternalNote);
router.post('/:id/rate', verifyAnyAuth, rateSatisfaction);

module.exports = router;
