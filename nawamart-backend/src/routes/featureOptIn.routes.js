const express = require('express');
const router = express.Router();
const { merchantFeatures, optIn } = require('../controllers/featureFlag.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

router.use(verifyToken);
router.use(requireRole('merchant'));

router.get('/my', merchantFeatures);
router.post('/opt-in', optIn);

module.exports = router;
