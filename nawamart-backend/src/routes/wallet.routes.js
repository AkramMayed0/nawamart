const express = require('express');
const router = express.Router();
const { getBalance, getLedger } = require('../controllers/wallet.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

router.get('/balance', verifyToken, requireRole('merchant'), getBalance);
router.get('/ledger', verifyToken, requireRole('merchant'), getLedger);

module.exports = router;
