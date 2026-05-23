const express = require('express');
const router = express.Router();
const {
  createStore,
  getMyStores,
  getStoreBySlug,
  updateStore,
} = require('../controllers/store.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const { uploadStore } = require('../utils/cloudinary');

// Multer middleware for accepting logo and banner uploads
const storeUploads = uploadStore.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);

// ─── Protected Routes (Merchant Only) — must come BEFORE /:slug ──────────────
// GET /api/stores/my
router.get('/my', verifyToken, requireRole('merchant'), getMyStores);

// POST /api/stores
router.post('/', verifyToken, requireRole('merchant'), storeUploads, createStore);

// PUT /api/stores/:id
router.put('/:id', verifyToken, requireRole('merchant'), storeUploads, updateStore);

// ─── Public Routes ────────────────────────────────────────────────────────────
// GET /api/stores/:slug  (must come LAST to not shadow /my)
router.get('/:slug', getStoreBySlug);

module.exports = router;
