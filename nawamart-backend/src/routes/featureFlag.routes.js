const express = require('express');
const router = express.Router();
const {
  listFlags,
  getFlag,
  createFlag,
  updateFlag,
  deleteFlag,
} = require('../controllers/featureFlag.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

router.use(verifyToken);
router.use(requireRole('merchant'));

router.get('/', listFlags);
router.get('/:id', getFlag);

module.exports = router;
