const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  generateReport,
  sendReportNow,
  toggleReportSchedule,
} = require('../controllers/report.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const { verifyAdmin } = require('../middleware/verifyAdmin');

async function verifyAnyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'غير مصرح — يرجى تسجيل الدخول أولاً',
    });
  }

  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.decode(authHeader.split(' ')[1]);
    if (!decoded || !decoded.role) {
      return res.status(401).json({ success: false, data: null, message: 'رمز المصادقة غير صالح' });
    }
    if (decoded.role === 'admin') {
      return verifyAdmin(req, res, next);
    }
    return verifyToken(req, res, next);
  } catch {
    return res.status(401).json({ success: false, data: null, message: 'رمز المصادقة غير صالح' });
  }
}

router.use(verifyAnyAuth);

router.post('/', requireRole('admin', 'merchant'), createReport);
router.get('/', getReports);
router.get('/:id', getReportById);
router.put('/:id', updateReport);
router.delete('/:id', deleteReport);
router.get('/:id/generate', generateReport);
router.post('/:id/send', requireRole('admin', 'merchant'), sendReportNow);
router.patch('/:id/toggle-schedule', toggleReportSchedule);

module.exports = router;
