const fs = require('fs');
const path = require('path');
const Backup = require('../models/Backup');
const Store = require('../models/Store');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const logger = require('../utils/logger');

const BACKUP_DIR = path.join(__dirname, '../../backups');

function ensureDir() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function createBackup({ type = 'manual', storeId = null, userId = null } = {}) {
  ensureDir();

  const backup = await Backup.create({
    store: storeId,
    type,
    status: 'running',
    startedAt: new Date(),
    createdBy: userId,
  });

  try {
    const data = { createdAt: new Date().toISOString(), type };

    if (storeId) {
      const store = await Store.findById(storeId).lean();
      if (!store) throw new Error('المتجر غير موجود');
      data.store = store;

      const products = await Product.find({ store: storeId, isDeleted: false }).lean();
      const orders = await Order.find({ store: storeId }).lean();
      const customers = await Customer.find({ store: storeId }).lean();

      data.products = products;
      data.orders = orders;
      data.customers = customers;
      data.metadata = {
        productCount: products.length,
        orderCount: orders.length,
        customerCount: customers.length,
      };
    } else {
      const stores = await Store.find({}).lean();
      const products = await Product.find({ isDeleted: false }).lean();
      const orders = await Order.find({}).lean();
      const customers = await Customer.find({}).lean();

      data.stores = stores;
      data.products = products;
      data.orders = orders;
      data.customers = customers;
      data.metadata = {
        storeCount: stores.length,
        productCount: products.length,
        orderCount: orders.length,
        customerCount: customers.length,
      };
    }

    const filename = `backup-${storeId || 'platform'}-${Date.now()}.json`;
    const filePath = path.join(BACKUP_DIR, filename);
    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, json, 'utf-8');
    const stats = fs.statSync(filePath);

    backup.status = 'completed';
    backup.filePath = filename;
    backup.fileSize = stats.size;
    backup.metadata = { ...backup.metadata, ...data.metadata, sizeBytes: stats.size };
    backup.completedAt = new Date();
    await backup.save();

    logger.info(`[Backup] Created ${storeId ? 'store' : 'platform'} backup: ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
    return backup;
  } catch (err) {
    backup.status = 'failed';
    backup.errorMessage = err.message;
    backup.completedAt = new Date();
    await backup.save();
    logger.error(`[Backup] Failed: ${err.message}`);
    throw err;
  }
}

async function cleanupExpiredBackups() {
  try {
    const result = await Backup.deleteMany({
      expiresAt: { $lte: new Date() },
    });

    if (result.deletedCount > 0) {
      logger.info(`[Backup] Cleaned up ${result.deletedCount} expired backup record(s)`);

      const files = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('backup-'));
      const validFiles = await Backup.find({}).select('filePath').lean();
      const validSet = new Set(validFiles.map(b => b.filePath).filter(Boolean));

      let removed = 0;
      for (const file of files) {
        if (!validSet.has(file)) {
          fs.unlinkSync(path.join(BACKUP_DIR, file));
          removed++;
        }
      }
      if (removed > 0) {
        logger.info(`[Backup] Removed ${removed} orphaned backup file(s)`);
      }
    }
  } catch (err) {
    logger.error(`[Backup] Cleanup error: ${err.message}`);
  }
}

async function listBackups({ storeId = null, page = 1, limit = 20 } = {}) {
  const query = storeId ? { store: storeId } : {};
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Backup.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Backup.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

async function getBackupById(backupId) {
  return Backup.findById(backupId).lean();
}

async function deleteBackup(backupId) {
  const backup = await Backup.findById(backupId);
  if (!backup) return null;

  if (backup.filePath) {
    const filePath = path.join(BACKUP_DIR, backup.filePath);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) {
      logger.warn(`[Backup] Could not remove file: ${backup.filePath}`);
    }
  }

  await backup.deleteOne();
  return { _id: backupId };
}

async function cleanupExportFiles() {
  const EXPORT_DIR = path.join(__dirname, '../../exports');
  try {
    if (!fs.existsSync(EXPORT_DIR)) return;

    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const files = fs.readdirSync(EXPORT_DIR);
    let removed = 0;

    for (const file of files) {
      const filePath = path.join(EXPORT_DIR, file);
      try {
        const stat = fs.statSync(filePath);
        if (now - stat.mtimeMs > SEVEN_DAYS) {
          fs.unlinkSync(filePath);
          removed++;
        }
      } catch { }
    }

    if (removed > 0) {
      logger.info(`[Backup] Cleaned up ${removed} expired export file(s)`);
    }
  } catch (err) {
    logger.error(`[Backup] Export cleanup error: ${err.message}`);
  }
}

async function purgeExpiredDeletedProducts() {
  try {
    const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await Product.deleteMany({
      isDeleted: true,
      deletedAt: { $lte: THIRTY_DAYS_AGO },
    });
    if (result.deletedCount > 0) {
      logger.info(`[Backup] Permanently purged ${result.deletedCount} expired deleted product(s)`);
    }
  } catch (err) {
    logger.error(`[Backup] Product purge error: ${err.message}`);
  }
}

module.exports = {
  createBackup,
  cleanupExpiredBackups,
  cleanupExportFiles,
  purgeExpiredDeletedProducts,
  listBackups,
  getBackupById,
  deleteBackup,
};
