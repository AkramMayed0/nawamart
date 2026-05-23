const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const Admin   = require('../models/Admin');
const { asyncHandler, apiResponse } = require('../utils/helpers');
const { verifyAdmin } = require('../middleware/verifyAdmin');
const {
  getStats,
  getMerchants,
  getMerchantById,
  toggleMerchantActive,
  getStores,
  toggleStoreActive,
  setStorePlan,
  getOrders,
  getCustomers,
  toggleCustomerActive,
} = require('../controllers/admin.controller');

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES  (no auth required)
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/admin/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'البريد الإلكتروني وكلمة المرور مطلوبان',
    });
  }

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!admin) {
    return res.status(401).json({ success: false, data: null, message: 'بيانات الدخول غير صحيحة' });
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, data: null, message: 'بيانات الدخول غير صحيحة' });
  }

  if (!admin.isActive) {
    return res.status(403).json({ success: false, data: null, message: 'حساب المشرف معطل' });
  }

  const token = jwt.sign(
    { id: admin._id, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const { password: _pw, ...adminData } = admin.toObject();

  return apiResponse(res, {
    message: 'تم تسجيل دخول المشرف بنجاح',
    data: { admin: adminData, token },
  });
}));

// POST /api/admin/seed  (dev only — creates the first admin account)
router.post('/seed', asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, data: null, message: 'غير مسموح في الإنتاج' });
  }

  const exists = await Admin.findOne({ email: 'admin@nawamart.com' });
  if (exists) {
    return res.status(409).json({ success: false, data: null, message: 'المشرف موجود بالفعل' });
  }

  const admin = await Admin.create({
    name:     'NawaMart Admin',
    email:    'admin@nawamart.com',
    password: 'Admin@123456',
  });

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء حساب المشرف — قم بتغيير كلمة المرور فوراً',
    data: { email: admin.email },
  });
}));

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTES  (verifyAdmin middleware — admin JWT required)
// ─────────────────────────────────────────────────────────────────────────────
router.use(verifyAdmin);

// ── Platform Stats ────────────────────────────────────────────────────────────
// GET /api/admin/stats
router.get('/stats', getStats);

// ── Merchants ─────────────────────────────────────────────────────────────────
// GET  /api/admin/merchants              list all (paginated, searchable)
// GET  /api/admin/merchants/:id          single merchant + stores
// PATCH /api/admin/merchants/:id/toggle-active   activate / suspend
router.get  ('/merchants',                    getMerchants);
router.get  ('/merchants/:id',                getMerchantById);
router.patch('/merchants/:id/toggle-active',  toggleMerchantActive);

// ── Stores ────────────────────────────────────────────────────────────────────
// GET  /api/admin/stores                 list all (paginated, filterable by plan)
// PATCH /api/admin/stores/:id/toggle-active   activate / deactivate
// PATCH /api/admin/stores/:id/set-plan        manually override subscription plan
router.get  ('/stores',                    getStores);
router.patch('/stores/:id/toggle-active',  toggleStoreActive);
router.patch('/stores/:id/set-plan',       setStorePlan);

// ── Orders ────────────────────────────────────────────────────────────────────
// GET /api/admin/orders                  list all platform orders (paginated)
router.get('/orders', getOrders);

// ── Customers ─────────────────────────────────────────────────────────────────
// GET  /api/admin/customers              list all (paginated, searchable)
// PATCH /api/admin/customers/:id/toggle-active   activate / suspend
router.get  ('/customers',                    getCustomers);
router.patch('/customers/:id/toggle-active',  toggleCustomerActive);

module.exports = router;
