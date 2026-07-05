const express = require('express');
const router = express.Router();
const {
  createEntry,
  updateEntry,
  deleteEntry,
  adminListEntries,
  getEntry,
} = require('../controllers/changelog.controller');
const { verifyAdmin } = require('../middleware/verifyAdmin');

router.use(verifyAdmin);

router.get('/', adminListEntries);
router.get('/:id', getEntry);
router.post('/', createEntry);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);

module.exports = router;
