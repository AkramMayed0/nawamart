const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const { loadStaffRole, requireRole } = require('../middleware/rbac');
const { listActivity } = require('../controllers/activity.controller');

router.use(verifyToken);

router.get('/:storeId', loadStaffRole, requireRole('store_owner', 'store_manager'), listActivity);

module.exports = router;