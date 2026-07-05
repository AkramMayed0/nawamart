# Disaster Recovery Plan — NawaMart

## RPO / RTO Targets

| Tier | RPO (Recovery Point Objective) | RTO (Recovery Time Objective) |
|------|-------------------------------|-------------------------------|
| Platform (MongoDB Atlas) | 1 hour (PITR enabled) | 4 hours |
| Merchant store data | 24 hours (daily backup) | 2 hours |
| File uploads (Cloudinary) | Real-time (replica) | 1 hour |

## Backup Strategy

### Automated (scheduled)
- **Daily platform backup** at midnight UTC via scheduler (`BackupService.createBackup({ type: 'scheduled' })`)
- **Metric snapshots** generated daily/weekly/monthly (`MetricsService`)
- **MongoDB Atlas continuous backups** with Point-in-Time Recovery (PITR)
- **Cloudinary** for all uploaded files (images, wasl receipts, chat files)

### On-Demand
- `npm run backup:create` — CLI script for manual backup
- `POST /api/backups` — API endpoint for merchant-initiated backups
- `POST /api/stores/:id/duplicate` — Duplicate store with products for testing
- `GET /api/backups/export/:storeId` — Download store data as JSON

### Retention
- Platform backups: 30 days (TTL index on `expiresAt`)
- Metric snapshots: 365 days (TTL index on MetricSnapshot)
- Export files: 7 days (cleaned by hourly scheduler job)
- Soft-deleted products: 30-day recovery window, then auto-purged

## Restore Procedures

### 1. Restore a single product from soft-delete
```
POST /api/products/:id/restore
```
Restores the product within the 30-day recovery window.

### 2. Restore from a backup file
```
node scripts/backup-restore.js <BACKUP_ID>
```
Restores store config and products from a previously created backup.

### 3. Full database restore (MongoDB Atlas)
1. Go to MongoDB Atlas → Backup → Restore
2. Select the desired snapshot or PITR point
3. Restore to a new cluster or replace existing
4. Update `MONGODB_URI` in environment

### 4. Application restore
```
git checkout <tag>
npm ci
npm start
```

## Runbooks

### Runbook A: Database Failure
1. **Detect**: Check `/api/health` and `/api/ready` endpoints
2. **Assess**: Check MongoDB Atlas status dashboard
3. **Failover**: Atlas auto-failover if replica set configured
4. **Restore**: If data corruption, use Atlas PITR restore
5. **Verify**: Run health checks, verify merchant data integrity

### Runbook B: Application Crash
1. **Detect**: PM2 monitoring alerts / 502 errors
2. **Investigate**: `pm2 logs`, `journalctl -u nawamart`
3. **Restart**: `pm2 restart ecosystem.config.js`
4. **Rollback**: Deploy previous Docker image tag
5. **Verify**: Check `/api/health`, test a merchant login

### Runbook C: Security Incident
1. **Isolate**: Revoke compromised API keys/tokens
2. **Snapshot**: Create immediate backup (`POST /api/backups`)
3. **Analyze**: Review activity logs (`ActivityLog` model)
4. **Remediate**: Rotate secrets, update firewall rules
5. **Restore**: If data tampered, restore from pre-incident backup
6. **Report**: Log incident details for compliance

### Runbook D: Merchant Data Loss
1. **Verify**: Check if soft-delete recovery applies (30-day window)
2. **Restore product**: `POST /api/products/:id/restore`
3. **Full store**: Use store duplication from existing store
4. **Backup restore**: Use `node scripts/backup-restore.js <BACKUP_ID>`
5. **Export**: Use GDPR export endpoint for JSON download

## Geographic Redundancy

- **MongoDB Atlas**: Multi-AZ replica set (3 nodes across availability zones)
- **Application**: Deployed on Railway with auto-scaling across regions
- **File storage**: Cloudinary with global CDN distribution
- **Frontend**: Vercel with edge network deployment
- **Custom domains**: Automatic SSL via Let's Encrypt

## Testing Schedule

| Test | Frequency | Responsible |
|------|-----------|-------------|
| Backup integrity check | Weekly | DevOps |
| Restore drill (staging) | Monthly | DevOps |
| Failover test | Quarterly | DevOps |
| Security incident drill | Quarterly | Security team |
| Full DR exercise | Annually | All teams |
