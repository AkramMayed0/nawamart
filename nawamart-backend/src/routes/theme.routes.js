const express = require('express');
const router = express.Router();
const {
  getThemes,
  getThemeBySlug,
  installTheme,
  uninstallTheme,
  getCategories,
} = require('../controllers/theme.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

router.get('/categories', getCategories);
router.get('/', getThemes);
router.get('/:slug', getThemeBySlug);

router.post('/:storeId/install', verifyToken, requireRole('merchant'), installTheme);
router.post('/:storeId/uninstall', verifyToken, requireRole('merchant'), uninstallTheme);

module.exports = router;
