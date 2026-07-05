const express = require('express');
const router = express.Router();
const {
  getPresets,
  getPublicPresets,
  savePreset,
  applyPreset,
  deletePreset,
  togglePublic,
} = require('../controllers/themePreset.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

router.get('/public', getPublicPresets);

router.get('/:storeId', verifyToken, requireRole('merchant'), getPresets);
router.post('/:storeId', verifyToken, requireRole('merchant'), savePreset);
router.post('/:storeId/apply', verifyToken, requireRole('merchant'), applyPreset);
router.put('/:storeId/:presetId/toggle', verifyToken, requireRole('merchant'), togglePublic);
router.delete('/:storeId/:presetId', verifyToken, requireRole('merchant'), deletePreset);

module.exports = router;
