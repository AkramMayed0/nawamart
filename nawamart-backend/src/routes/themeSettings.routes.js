const express = require('express');
const router = express.Router();
const {
  getThemeSettings,
  updateColors,
  updateFonts,
  updateLayout,
  updateSpacing,
  updateCustomCss,
  updateCustomHtml,
  resetThemeSettings,
  getPublicThemeSettings,
} = require('../controllers/themeSettings.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

router.get('/public/:storeId', getPublicThemeSettings);

router.get('/:storeId', verifyToken, requireRole('merchant'), getThemeSettings);
router.put('/:storeId/colors', verifyToken, requireRole('merchant'), updateColors);
router.put('/:storeId/fonts', verifyToken, requireRole('merchant'), updateFonts);
router.put('/:storeId/layout', verifyToken, requireRole('merchant'), updateLayout);
router.put('/:storeId/spacing', verifyToken, requireRole('merchant'), updateSpacing);
router.put('/:storeId/css', verifyToken, requireRole('merchant'), updateCustomCss);
router.put('/:storeId/html', verifyToken, requireRole('merchant'), updateCustomHtml);
router.post('/:storeId/reset', verifyToken, requireRole('merchant'), resetThemeSettings);

module.exports = router;
