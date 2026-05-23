const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { asyncHandler, apiResponse } = require('../utils/helpers');

// ─── POST /api/admin/login ────────────────────────────────────────────────────
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'البريد الإلكتروني وكلمة المرور مطلوبان',
    });
  }

  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin) {
    return res.status(401).json({ success: false, data: null, message: 'بيانات الدخول غير صحيحة' });
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, data: null, message: 'بيانات الدخول غير صحيحة' });
  }

  const token = jwt.sign(
    { id: admin._id, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const { password: _, ...adminData } = admin.toObject();

  return apiResponse(res, {
    message: 'تم تسجيل دخول المشرف بنجاح',
    data: { admin: adminData, token },
  });
}));

// ─── POST /api/admin/seed ─────────────────────────────────────────────────────
// ONE-TIME route to create the admin — disable after first use in production!
router.post('/seed', asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, data: null, message: 'غير مسموح في الإنتاج' });
  }

  const exists = await Admin.findOne({ email: 'admin@nawamart.com' });
  if (exists) {
    return res.status(409).json({ success: false, data: null, message: 'المشرف موجود بالفعل' });
  }

  const admin = await Admin.create({
    name: 'NawaMart Admin',
    email: 'admin@nawamart.com',
    password: 'Admin@123456',
  });

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء حساب المشرف بنجاح',
    data: { email: admin.email, note: 'قم بتغيير كلمة المرور فوراً' },
  });
}));

module.exports = router;
