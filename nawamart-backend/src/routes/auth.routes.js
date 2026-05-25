const express = require('express');
const router = express.Router();
const {
  merchantRegister,
  merchantLogin,
  customerRegister,
  customerLogin,
  getMe,
} = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/verifyToken');

// ─── Merchant Auth ────────────────────────────────────────────────────────────
// POST /api/auth/merchant/register
router.post('/merchant/register', merchantRegister);

// POST /api/auth/merchant/login
router.post('/merchant/login', merchantLogin);

// ─── Customer Auth ────────────────────────────────────────────────────────────
// POST /api/auth/customer/register
router.post('/customer/register', customerRegister);

// POST /api/auth/customer/login
router.post('/customer/login', customerLogin);

// GET /api/auth/me
router.get('/me', verifyToken, getMe);

module.exports = router;
