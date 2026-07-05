const express = require('express');
const router = express.Router();
const { listEntries, getEntry } = require('../controllers/changelog.controller');

router.get('/', listEntries);
router.get('/:id', getEntry);

module.exports = router;
