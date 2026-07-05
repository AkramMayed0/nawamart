const express = require('express');
const router = express.Router();
const {
  getThemeSettings,
  updateColors,
  updateTypography,
  updateLayout,
  updateHeader,
  updateFooter,
  updateButtons,
  updateBadges,
  updateIcons,
  updateImages,
  updateProductPage,
  updateCollectionPage,
  updateCart,
  updateCheckout,
  updateMobile,
  updateSpacing,
  updateCustomCss,
  updateCustomHtml,
  updateBulk,
  resetThemeSettings,
  getPublicThemeSettings,
} = require('../controllers/themeSettings.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

router.get('/public/:storeId', getPublicThemeSettings);

router.get('/:storeId', verifyToken, requireRole('merchant'), getThemeSettings);
router.put('/:storeId/colors', verifyToken, requireRole('merchant'), updateColors);
router.put('/:storeId/typography', verifyToken, requireRole('merchant'), updateTypography);
router.put('/:storeId/layout', verifyToken, requireRole('merchant'), updateLayout);
router.put('/:storeId/header', verifyToken, requireRole('merchant'), updateHeader);
router.put('/:storeId/footer', verifyToken, requireRole('merchant'), updateFooter);
router.put('/:storeId/buttons', verifyToken, requireRole('merchant'), updateButtons);
router.put('/:storeId/badges', verifyToken, requireRole('merchant'), updateBadges);
router.put('/:storeId/icons', verifyToken, requireRole('merchant'), updateIcons);
router.put('/:storeId/images', verifyToken, requireRole('merchant'), updateImages);
router.put('/:storeId/product-page', verifyToken, requireRole('merchant'), updateProductPage);
router.put('/:storeId/collection-page', verifyToken, requireRole('merchant'), updateCollectionPage);
router.put('/:storeId/cart', verifyToken, requireRole('merchant'), updateCart);
router.put('/:storeId/checkout', verifyToken, requireRole('merchant'), updateCheckout);
router.put('/:storeId/mobile', verifyToken, requireRole('merchant'), updateMobile);
router.put('/:storeId/spacing', verifyToken, requireRole('merchant'), updateSpacing);
router.put('/:storeId/css', verifyToken, requireRole('merchant'), updateCustomCss);
router.put('/:storeId/html', verifyToken, requireRole('merchant'), updateCustomHtml);
router.put('/:storeId/bulk', verifyToken, requireRole('merchant'), updateBulk);
router.post('/:storeId/reset', verifyToken, requireRole('merchant'), resetThemeSettings);

module.exports = router;
