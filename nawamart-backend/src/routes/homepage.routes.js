const express = require('express');
const router = express.Router();
const {
  getSections,
  getPublicSections,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  toggleSection,
} = require('../controllers/homepage.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

router.get('/public/:storeId', getPublicSections);

router.get('/:storeId', verifyToken, requireRole('merchant'), getSections);
router.post('/:storeId', verifyToken, requireRole('merchant'), createSection);
router.put('/:storeId/reorder', verifyToken, requireRole('merchant'), reorderSections);
router.put('/:storeId/:sectionId', verifyToken, requireRole('merchant'), updateSection);
router.put('/:storeId/:sectionId/toggle', verifyToken, requireRole('merchant'), toggleSection);
router.delete('/:storeId/:sectionId', verifyToken, requireRole('merchant'), deleteSection);

module.exports = router;
