const express = require('express');
const router = express.Router();
const {
  getPages,
  getPage,
  createPage,
  updatePage,
  deletePage,
  addSection,
  updateSection,
  removeSection,
  reorderSections,
  addBlock,
  updateBlock,
  removeBlock,
  getPublicPage,
} = require('../controllers/page.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

router.get('/public/:storeId/:slug', getPublicPage);

router.get('/:storeId', verifyToken, requireRole('merchant'), getPages);
router.post('/:storeId', verifyToken, requireRole('merchant'), createPage);
router.get('/:storeId/:id', verifyToken, requireRole('merchant'), getPage);
router.put('/:storeId/:id', verifyToken, requireRole('merchant'), updatePage);
router.delete('/:storeId/:id', verifyToken, requireRole('merchant'), deletePage);

router.post('/:storeId/:id/sections', verifyToken, requireRole('merchant'), addSection);
router.put('/:storeId/:id/sections/:sectionId', verifyToken, requireRole('merchant'), updateSection);
router.delete('/:storeId/:id/sections/:sectionId', verifyToken, requireRole('merchant'), removeSection);
router.put('/:storeId/:id/sections/reorder', verifyToken, requireRole('merchant'), reorderSections);
router.post('/:storeId/:id/sections/:sectionId/blocks', verifyToken, requireRole('merchant'), addBlock);
router.put('/:storeId/:id/sections/:sectionId/blocks/:blockId', verifyToken, requireRole('merchant'), updateBlock);
router.delete('/:storeId/:id/sections/:sectionId/blocks/:blockId', verifyToken, requireRole('merchant'), removeBlock);

module.exports = router;
