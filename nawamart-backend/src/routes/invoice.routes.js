const express = require('express');
const router = express.Router();
const { getMyInvoices } = require('../controllers/invoice.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

router.get('/my', verifyToken, requireRole('merchant'), getMyInvoices);

module.exports = router;
