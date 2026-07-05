const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const {
  generateMfaSecret,
  verifyAndEnableMfa,
  disableMfa,
  getMfaStatus,
  regenerateBackupCodes,
} = require('../controllers/mfa.controller');

router.use(verifyToken);

router.get('/status', getMfaStatus);
router.post('/generate', generateMfaSecret);
router.post('/verify-enable', verifyAndEnableMfa);
router.post('/disable', disableMfa);
router.post('/regenerate-backup-codes', regenerateBackupCodes);

module.exports = router;
