const express = require('express');
const router = express.Router();
const {
  createStore,
  getMyStores,
  getStoreBySlug,
  updateStore,
  switchStore,
  duplicateStore,
} = require('../controllers/store.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const { uploadStore } = require('../utils/cloudinary');

// Multer middleware for accepting logo and banner uploads
const storeUploads = uploadStore.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);

// ─── Protected Routes (Merchant Only) — must come BEFORE /:slug ──────────────
// POST /api/stores/switch — switches active store context
router.post('/switch', verifyToken, requireRole('merchant'), switchStore);

// GET /api/stores/my
router.get('/my', verifyToken, requireRole('merchant'), getMyStores);

// POST /api/stores
router.post('/', verifyToken, requireRole('merchant'), storeUploads, createStore);

// PUT /api/stores/:id
router.put('/:id', verifyToken, requireRole('merchant'), storeUploads, updateStore);

// POST /api/stores/:id/duplicate — duplicate store with products for backup/testing
router.post('/:id/duplicate', verifyToken, requireRole('merchant'), duplicateStore);

// ─── Public Routes ────────────────────────────────────────────────────────────
// GET /api/stores/:slug
router.get('/:slug', getStoreBySlug);

module.exports = router;
