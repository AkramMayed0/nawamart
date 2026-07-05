const Backup = require('../models/Backup');
const BackupService = require('../services/BackupService');
const { apiResponse, asyncHandler, getPaginationParams } = require('../utils/helpers');

const createBackup = asyncHandler(async (req, res) => {
  const backup = await BackupService.createBackup({
    type: req.body.type || 'manual',
    storeId: req.body.storeId || null,
    userId: req.user?._id,
  });
  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء النسخة الاحتياطية بنجاح',
    data: backup,
  });
});

const listBackups = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req);
  const result = await BackupService.listBackups({
    storeId: req.query.storeId || null,
    page,
    limit,
  });
  return apiResponse(res, {
    message: 'تم جلب النسخ الاحتياطية',
    data: result.items,
    pagination: result.pagination,
  });
});

const getBackup = asyncHandler(async (req, res) => {
  const backup = await BackupService.getBackupById(req.params.id);
  if (!backup) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'النسخة الاحتياطية غير موجودة',
    });
  }
  return apiResponse(res, {
    message: 'تم جلب بيانات النسخة الاحتياطية',
    data: backup,
  });
});

const deleteBackup = asyncHandler(async (req, res) => {
  const result = await BackupService.deleteBackup(req.params.id);
  if (!result) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'النسخة الاحتياطية غير موجودة',
    });
  }
  return apiResponse(res, {
    message: 'تم حذف النسخة الاحتياطية',
    data: null,
  });
});

const exportStore = asyncHandler(async (req, res) => {
  const backup = await BackupService.createBackup({
    type: 'manual',
    storeId: req.params.storeId,
    userId: req.user?._id,
  });

  if (backup.status === 'completed' && backup.filePath) {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../../backups', backup.filePath);
    if (fs.existsSync(filePath)) {
      return res.download(filePath, `store-export-${req.params.storeId}.json`, {
        headers: {
          'X-Backup-Id': backup._id.toString(),
        },
      });
    }
  }

  return apiResponse(res, {
    message: 'تم إنشاء التصدير، ولكن تعذر تنزيل الملف',
    data: backup,
  });
});

module.exports = {
  createBackup,
  listBackups,
  getBackup,
  deleteBackup,
  exportStore,
};
