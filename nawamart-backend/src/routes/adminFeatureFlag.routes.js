const express = require('express');
const router = express.Router();
const {
  listFlags,
  getFlag,
  createFlag,
  updateFlag,
  deleteFlag,
} = require('../controllers/featureFlag.controller');
const { verifyAdmin } = require('../middleware/verifyAdmin');

router.use(verifyAdmin);

router.get('/', listFlags);
router.get('/:id', getFlag);
router.post('/', createFlag);
router.put('/:id', updateFlag);
router.delete('/:id', deleteFlag);

module.exports = router;
