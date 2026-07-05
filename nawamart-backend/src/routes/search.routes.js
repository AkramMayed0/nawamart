const express = require('express');
const router = express.Router();
const { globalSearch } = require('../controllers/search.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

router.get('/', verifyToken, requireRole('merchant'), globalSearch);

module.exports = router;
