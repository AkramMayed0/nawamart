const express = require('express');
const router = express.Router();
const { getMyFeatures } = require('../controllers/feature.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

router.get('/my', verifyToken, requireRole('merchant'), getMyFeatures);

module.exports = router;
