const express = require('express');
const router = express.Router();
const {
  requestSubscription,
  getMySubscriptions,
  getProration,
  getAllSubscriptions,
  approveSubscription,
  rejectSubscription,
} = require('../controllers/subscription.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const { verifyAdmin } = require('../middleware/verifyAdmin');

// ─── Merchant Routes ──────────────────────────────────────────────────────────
// POST /api/subscriptions/request
router.post('/request', verifyToken, requireRole('merchant'), requestSubscription);

// GET /api/subscriptions/my
router.get('/my', verifyToken, requireRole('merchant'), getMySubscriptions);

// GET /api/subscriptions/prorate (estimate proration for target plan)
router.get('/prorate', verifyToken, requireRole('merchant'), getProration);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
// GET /api/subscriptions (admin: list all)
router.get('/', verifyAdmin, getAllSubscriptions);

// PUT /api/subscriptions/:id/approve
router.put('/:id/approve', verifyAdmin, approveSubscription);

// PUT /api/subscriptions/:id/reject
router.put('/:id/reject', verifyAdmin, rejectSubscription);

module.exports = router;
