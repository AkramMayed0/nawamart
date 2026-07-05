const express = require('express');
const router = express.Router();
const {
  createBackup,
  listBackups,
  getBackup,
  deleteBackup,
  exportStore,
} = require('../controllers/backup.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

router.use(verifyToken);
router.use(requireRole('merchant'));

router.post('/', createBackup);
router.get('/', listBackups);
router.get('/:id', getBackup);
router.delete('/:id', deleteBackup);
router.get('/export/:storeId', exportStore);

module.exports = router;
