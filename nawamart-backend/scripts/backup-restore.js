/**
 * CLI script: node scripts/backup-restore.js <BACKUP_ID>
 *
 * Restores data from a backup JSON file.
 * Requires MONGODB_URI from .env
 *
 * WARNING: This is a best-effort restore. It imports products and store config
 * from the backup file. It does NOT drop existing data.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function main() {
  const backupId = process.argv[2];
  if (!backupId) {
    console.error('Usage: node scripts/backup-restore.js <BACKUP_ID>');
    process.exit(1);
  }

  const mongoose = require('mongoose');
  const path = require('path');
  const fs = require('fs');
  const Backup = require('../src/models/Backup');
  const Store = require('../src/models/Store');
  const Product = require('../src/models/Product');

  await mongoose.connect(process.env.MONGODB_URI);

  const backup = await Backup.findById(backupId);
  if (!backup) {
    console.error(`Backup not found: ${backupId}`);
    process.exit(1);
  }
  if (backup.status !== 'completed' || !backup.filePath) {
    console.error(`Backup is not in completed state (status: ${backup.status})`);
    process.exit(1);
  }

  const filePath = path.join(__dirname, '..', 'backups', backup.filePath);
  if (!fs.existsSync(filePath)) {
    console.error(`Backup file not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`[Restore] Reading backup: ${backup.filePath}`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  if (backup.store && data.store) {
    console.log(`[Restore] Restoring store: ${data.store.name}`);
    const { _id, __v, createdAt, updatedAt, ...storeData } = data.store;
    delete storeData.totalProducts;
    delete storeData.totalOrders;
    await Store.findByIdAndUpdate(backup.store, storeData, { upsert: true });
  }

  if (data.products && data.products.length > 0) {
    console.log(`[Restore] Restoring ${data.products.length} product(s)...`);
    let restored = 0;
    for (const p of data.products) {
      const { _id, __v, createdAt, updatedAt, isDeleted, deletedAt, ...productData } = p;
      const exists = await Product.findById(_id);
      if (exists) {
        if (exists.isDeleted) {
          await Product.findByIdAndUpdate(_id, { ...productData, isDeleted: false, deletedAt: null });
          restored++;
        }
      } else {
        await Product.create({ _id, ...productData, isDeleted: false, deletedAt: null });
        restored++;
      }
    }
    console.log(`[Restore] Restored ${restored} product(s)`);
  }

  console.log(`[Restore] Done!`);
  await mongoose.disconnect();
  process.exit(0);
}

main();
