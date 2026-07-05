const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const { loadStaffRole, requireRole } = require('../middleware/rbac');
const {
  listStaff,
  addStaff,
  updateStaff,
  removeStaff,
  getMyStores,
} = require('../controllers/staff.controller');

router.use(verifyToken);

router.get('/my-stores', getMyStores);

router.get('/:storeId', loadStaffRole, requireRole('store_owner', 'store_manager'), listStaff);
router.post('/:storeId', loadStaffRole, requireRole('store_owner'), addStaff);
router.patch('/:storeId/:staffId', loadStaffRole, requireRole('store_owner'), updateStaff);
router.delete('/:storeId/:staffId', loadStaffRole, requireRole('store_owner'), removeStaff);

module.exports = router;
