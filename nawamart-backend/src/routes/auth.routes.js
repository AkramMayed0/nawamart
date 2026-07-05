const express = require('express');
const router = express.Router();
const {
  merchantRegister,
  merchantLogin,
  merchantMfaVerify,
  merchantGoogleLogin,
  customerRegister,
  customerLogin,
  customerGoogleLogin,
  getMe,
  updateMe,
  forgotPassword,
  resetPassword,
  refreshToken,
  listSessions,
  revokeSession,
} = require('../controllers/auth.controller');
const Merchant = require('../models/Merchant');
const Customer = require('../models/Customer');
const { verifyToken } = require('../middleware/verifyToken');
const { uploadAvatar } = require('../utils/cloudinary');

const avatarUpload = uploadAvatar.single('profileImage');

// ─── Merchant Auth ────────────────────────────────────────────────────────────
router.post('/merchant/register', merchantRegister);
router.post('/merchant/login', merchantLogin);
router.post('/merchant/mfa-verify', merchantMfaVerify);
router.post('/merchant/google', merchantGoogleLogin);
router.post('/merchant/forgot-password', forgotPassword(Merchant, 'merchant'));
router.post('/merchant/reset-password/:token', resetPassword(Merchant));

// ─── Customer Auth ────────────────────────────────────────────────────────────
router.post('/customer/register', customerRegister);
router.post('/customer/login', customerLogin);
router.post('/customer/google', customerGoogleLogin);
router.post('/customer/forgot-password', forgotPassword(Customer, 'customer'));
router.post('/customer/reset-password/:token', resetPassword(Customer));

// ─── Session / Token Management ───────────────────────────────────────────────
router.post('/refresh-token', refreshToken);

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.get('/me', verifyToken, getMe);
router.put('/me', verifyToken, avatarUpload, updateMe);
router.get('/sessions', verifyToken, listSessions);
router.delete('/sessions/:sessionId', verifyToken, revokeSession);

module.exports = router;
