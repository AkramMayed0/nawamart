/**
 * CLI script: node scripts/backup-list.js [--store STORE_ID] [--page 1] [--limit 20]
 *
 * Lists backups stored in the database.
 * Requires MONGODB_URI from .env
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function main() {
  const args = process.argv.slice(2);
  const storeIdx = args.indexOf('--store');
  const pageIdx = args.indexOf('--page');
  const limitIdx = args.indexOf('--limit');

  const storeId = storeIdx !== -1 && storeIdx + 1 < args.length ? args[storeIdx + 1] : null;
  const page = pageIdx !== -1 && pageIdx + 1 < args.length ? parseInt(args[pageIdx + 1]) : 1;
  const limit = limitIdx !== -1 && limitIdx + 1 < args.length ? parseInt(args[limitIdx + 1]) : 20;

  const mongoose = require('mongoose');
  const BackupService = require('../src/services/BackupService');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`[Backup] Connected. Fetching backups...`);

  const result = await BackupService.listBackups({ storeId, page, limit });

  console.log(`\nBackups (page ${result.pagination.page}/${result.pagination.pages}, total: ${result.pagination.total}):`);
  console.log('-'.repeat(120));
  for (const b of result.items) {
    const size = b.fileSize ? `${(b.fileSize / 1024).toFixed(1)} KB` : 'N/A';
    console.log(`  ${b._id}  |  ${b.type.padEnd(12)}  |  ${b.status.padEnd(10)}  |  ${size.padEnd(10)}  |  ${b.createdAt}`);
  }
  if (result.items.length === 0) console.log('  (none)');

  await mongoose.disconnect();
  process.exit(0);
}

main();
