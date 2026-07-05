const StoreStaff = require('../models/StoreStaff');
const Merchant = require('../models/Merchant');
const Store = require('../models/Store');
const { ROLES } = require('../utils/permissions');
const { logActivity } = require('../services/audit');

async function listStaff(req, res, next) {
  try {
    const { storeId } = req.params;
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'المتجر غير موجود',
      });
    }
    const isOwner = store.merchant.toString() === req.user._id.toString();
    if (!isOwner && req.storeRole !== 'store_owner' && req.storeRole !== 'store_manager') {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'ليس لديك صلاحية لعرض الموظفين',
      });
    }
    const staffList = await StoreStaff.find({ store: storeId, isActive: true })
      .populate('user', 'name email phone profileImage')
      .sort({ createdAt: -1 });
    const ownerInfo = {
      _id: store.merchant,
      name: req.user.name,
      email: req.user.email,
      role: 'store_owner',
    };
    return res.status(200).json({
      success: true,
      message: 'تم جلب قائمة الموظفين',
      data: {
        owner: ownerInfo,
        staff: staffList,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function addStaff(req, res, next) {
  try {
    const { storeId } = req.params;
    const { email, role } = req.body;
    if (!email || !role) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'البريد الإلكتروني والدور مطلوبان',
      });
    }
    if (!Object.values(ROLES).includes(role) || role === 'store_owner') {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'دور غير صالح',
      });
    }
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'المتجر غير موجود',
      });
    }
    const isOwner = store.merchant.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'فقط مالك المتجر يمكنه إضافة موظفين',
      });
    }
    const user = await Merchant.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'المستخدم غير موجود — يجب أن يكون مسجلاً في نوامارت أولاً',
      });
    }
    if (store.merchant.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'لا يمكن إضافة مالك المتجر كموظف',
      });
    }
    const existing = await StoreStaff.findOne({ store: storeId, user: user._id });
    if (existing) {
      if (existing.isActive) {
        return res.status(409).json({
          success: false,
          data: null,
          message: 'هذا المستخدم مضاف بالفعل إلى المتجر',
        });
      }
      existing.isActive = true;
      existing.role = role;
      existing.invitedBy = req.user._id;
      await existing.save();
      const populated = await StoreStaff.populate(existing, { path: 'user', select: 'name email phone profileImage' });

      await logActivity(req, {
        action: 'staff.create',
        resourceType: 'staff',
        resourceId: existing._id,
        resourceName: user.name || user.email,
        details: `تم إعادة تفعيل الموظف ${user.name || user.email} بدور ${role}`,
        changes: { after: { role, email: user.email } },
      });

      return res.status(200).json({
        success: true,
        message: 'تم إعادة تفعيل الموظف',
        data: populated,
      });
    }
    const staff = await StoreStaff.create({
      store: storeId,
      user: user._id,
      role,
      invitedBy: req.user._id,
    });
    const populated = await StoreStaff.populate(staff, { path: 'user', select: 'name email phone profileImage' });

    await logActivity(req, {
      action: 'staff.create',
      resourceType: 'staff',
      resourceId: staff._id,
      resourceName: user.name || user.email,
      details: `تم إضافة الموظف ${user.name || user.email} بدور ${role}`,
      changes: { after: { role, email: user.email } },
    });

    return res.status(201).json({
      success: true,
      message: 'تم إضافة الموظف بنجاح',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
}

async function updateStaff(req, res, next) {
  try {
    const { storeId, staffId } = req.params;
    const { role, isActive } = req.body;
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'المتجر غير موجود',
      });
    }
    const isOwner = store.merchant.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'فقط مالك المتجر يمكنه تعديل صلاحيات الموظفين',
      });
    }
    const staff = await StoreStaff.findOne({ _id: staffId, store: storeId });
    if (!staff) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'الموظف غير موجود',
      });
    }
    const oldRole = staff.role;
    if (role) {
      if (!Object.values(ROLES).includes(role) || role === 'store_owner') {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'دور غير صالح',
        });
      }
      staff.role = role;
    }
    if (isActive !== undefined) {
      staff.isActive = isActive;
    }
    await staff.save();
    const populated = await StoreStaff.populate(staff, { path: 'user', select: 'name email phone profileImage' });

    await logActivity(req, {
      action: 'staff.update',
      resourceType: 'staff',
      resourceId: staff._id,
      resourceName: populated.user?.name || populated.user?.email || '',
      details: role ? `تم تغيير دور الموظف من ${oldRole} إلى ${role}` : 'تم تحديث بيانات الموظف',
      changes: role ? { before: { role: oldRole }, after: { role } } : null,
    });

    return res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات الموظف بنجاح',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
}

async function removeStaff(req, res, next) {
  try {
    const { storeId, staffId } = req.params;
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'المتجر غير موجود',
      });
    }
    const isOwner = store.merchant.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'فقط مالك المتجر يمكنه إزالة الموظفين',
      });
    }
    const staff = await StoreStaff.findOne({ _id: staffId, store: storeId });
    if (!staff) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'الموظف غير موجود',
      });
    }
    const userName = staff.user?.name || '';
    staff.isActive = false;
    await staff.save();

    await logActivity(req, {
      action: 'staff.delete',
      resourceType: 'staff',
      resourceId: staff._id,
      resourceName: userName,
      details: `تم إزالة الموظف ${userName}`,
    });

    return res.status(200).json({
      success: true,
      message: 'تم إزالة الموظف بنجاح',
      data: null,
    });
  } catch (error) {
    next(error);
  }
}

async function getMyStores(req, res, next) {
  try {
    const staffEntries = await StoreStaff.find({
      user: req.user._id,
      isActive: true,
    }).populate('store', 'name slug logo');
    const stores = staffEntries.map((entry) => ({
      _id: entry.store._id,
      name: entry.store.name,
      slug: entry.store.slug,
      logo: entry.store.logo,
      role: entry.role,
      staffId: entry._id,
    }));
    return res.status(200).json({
      success: true,
      message: 'تم جلب المتاجر',
      data: stores,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listStaff,
  addStaff,
  updateStaff,
  removeStaff,
  getMyStores,
};