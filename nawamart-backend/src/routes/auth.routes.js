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
} = require('../controllers/auth.controller');
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

// ─── Customer Auth ────────────────────────────────────────────────────────────
// POST /api/auth/customer/register
router.post('/customer/register', customerRegister);

// POST /api/auth/customer/login
router.post('/customer/login', customerLogin);

// POST /api/auth/customer/google
router.post('/customer/google', customerGoogleLogin);

// GET /api/auth/me
router.get('/me', verifyToken, getMe);

// PUT /api/auth/me
router.put('/me', verifyToken, avatarUpload, updateMe);

module.exports = router;
