const StoreStaff = require('../models/StoreStaff');
const { hasPermission, ROLES, ROLE_HIERARCHY } = require('../utils/permissions');

async function loadStaffRole(req, res, next) {
  try {
    if (req.userRole !== 'merchant') return next();
    const storeId = req.params.storeId || req.body.storeId || req.query.storeId;
    if (!storeId) return next();
    const staff = await StoreStaff.findOne({
      store: storeId,
      user: req.user._id,
      isActive: true,
    });
    if (staff) {
      req.storeRole = staff.role;
      req.storeStaffId = staff._id;
    } else {
      const Store = require('../models/Store');
      const store = await Store.findById(storeId);
      if (store && store.merchant.toString() === req.user._id.toString()) {
        req.storeRole = ROLES.store_owner;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}

function requirePermission(...permissions) {
  return (req, res, next) => {
    const storeRole = req.storeRole || req.userStoreRole;
    if (!storeRole) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'ليس لديك صلاحية للوصول إلى هذا المورد',
      });
    }
    const hasAll = permissions.every((perm) => hasPermission(storeRole, perm));
    if (!hasAll) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'ليس لديك صلاحية كافية للقيام بهذا الإجراء',
      });
    }
    next();
  };
}

function requireRole(...roles) {
  return (req, res, next) => {
    const storeRole = req.storeRole || req.userStoreRole;
    if (!storeRole || !roles.includes(storeRole)) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'ليس لديك صلاحية للوصول إلى هذا المورد',
      });
    }
    next();
  };
}

module.exports = { loadStaffRole, requirePermission, requireRole };
