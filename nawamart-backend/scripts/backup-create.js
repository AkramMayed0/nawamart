/**
 * CLI script: node scripts/backup-create.js [--store STORE_ID] [--type manual|scheduled|pre-upgrade]
 *
 * Creates a backup of the platform or a specific store.
 * Requires MONGODB_URI and other env vars from .env
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function main() {
  const args = process.argv.slice(2);
  const storeIdx = args.indexOf('--store');
  const typeIdx = args.indexOf('--type');

  const storeId = storeIdx !== -1 && storeIdx + 1 < args.length ? args[storeIdx + 1] : null;
  const type = typeIdx !== -1 && typeIdx + 1 < args.length ? args[typeIdx + 1] : 'manual';

  if (!['manual', 'scheduled', 'pre-upgrade'].includes(type)) {
    console.error('Invalid type. Use: manual, scheduled, or pre-upgrade');
    process.exit(1);
  }

  const mongoose = require('mongoose');
  const BackupService = require('../src/services/BackupService');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`[Backup] Connected to MongoDB. Creating ${type} backup${storeId ? ` for store ${storeId}` : ' (platform)'}...`);

  try {
    const backup = await BackupService.createBackup({ type, storeId });
    console.log(`[Backup] Done! Status: ${backup.status}`);
    console.log(`[Backup] File: ${backup.filePath}`);
    console.log(`[Backup] Size: ${((backup.fileSize || 0) / 1024).toFixed(1)} KB`);
    console.log(`[Backup] Expires: ${backup.expiresAt}`);
  } catch (err) {
    console.error(`[Backup] Failed: ${err.message}`);
    process.exit(1);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main();
