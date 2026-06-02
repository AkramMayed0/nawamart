const express = require('express');
const router = express.Router();
const {
  merchantRegister,
  merchantLogin,
  merchantGoogleLogin,
  customerRegister,
  customerLogin,
  customerGoogleLogin,
  getMe,
  updateMe,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth.controller');
const Merchant = require('../models/Merchant');
const Customer = require('../models/Customer');
const { verifyToken } = require('../middleware/verifyToken');
const { uploadAvatar } = require('../utils/cloudinary');

const avatarUpload = uploadAvatar.single('profileImage');

// ─── Merchant Auth ────────────────────────────────────────────────────────────
// POST /api/auth/merchant/register
router.post('/merchant/register', merchantRegister);

// POST /api/auth/merchant/login
router.post('/merchant/login', merchantLogin);

// POST /api/auth/merchant/google
router.post('/merchant/google', merchantGoogleLogin);

// POST /api/auth/merchant/forgot-password
router.post('/merchant/forgot-password', forgotPassword(Merchant, 'merchant'));

// POST /api/auth/merchant/reset-password/:token
router.post('/merchant/reset-password/:token', resetPassword(Merchant));

// ─── Customer Auth ────────────────────────────────────────────────────────────
// POST /api/auth/customer/register
router.post('/customer/register', customerRegister);

// POST /api/auth/customer/login
router.post('/customer/login', customerLogin);

// POST /api/auth/customer/google
router.post('/customer/google', customerGoogleLogin);

// POST /api/auth/customer/forgot-password
router.post('/customer/forgot-password', forgotPassword(Customer, 'customer'));

// POST /api/auth/customer/reset-password/:token
router.post('/customer/reset-password/:token', resetPassword(Customer));

// GET /api/auth/me
router.get('/me', verifyToken, getMe);

// PUT /api/auth/me
router.put('/me', verifyToken, avatarUpload, updateMe);

module.exports = router;
