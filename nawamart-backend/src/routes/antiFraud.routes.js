const express = require('express');
const router = express.Router();
const {
  listReturnRisks,
  createReturnRisk,
  checkReturnRisk,
} = require('../controllers/antiFraud.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const { requireFeature } = require('../middleware/requireFeature');

router.use(verifyToken, requireRole('merchant'));
router.use(requireFeature('anti_fraud_return_shield'));

router.get('/returns', listReturnRisks);
router.post('/returns', createReturnRisk);
router.get('/check', checkReturnRisk);
router.post('/check', checkReturnRisk);

module.exports = router;
