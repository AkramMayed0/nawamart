const express = require('express');
const router = express.Router();
const {
  listApiKeys, createApiKey, deleteApiKey, updateApiKey, rotateApiKey, getScopes,
} = require('../controllers/apiKey.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

router.get('/scopes', getScopes);

router.get('/:storeId', verifyToken, requireRole('merchant'), listApiKeys);
router.post('/:storeId', verifyToken, requireRole('merchant'), createApiKey);
router.put('/:id', verifyToken, requireRole('merchant'), updateApiKey);
router.delete('/:id', verifyToken, requireRole('merchant'), deleteApiKey);
router.post('/:id/rotate', verifyToken, requireRole('merchant'), rotateApiKey);

module.exports = router;
