const ActivityLog = require('../models/ActivityLog');

function buildActorInfo(req) {
  return {
    user: req.user._id,
    userName: req.user.name || null,
    userRole: req.storeRole || req.userStoreRole || null,
    ip: req.ip || req.connection?.remoteAddress || null,
    userAgent: req.headers?.['user-agent'] || null,
  };
}

async function logActivity(req, { action, resourceType, resourceId, resourceName, details, changes }) {
  const actor = buildActorInfo(req);
  const storeId = req.params.storeId || req.body.storeId || req.query.storeId || req.user?.store || null;

  try {
    await ActivityLog.create({
      store: storeId,
      ...actor,
      action,
      resource: {
        type: resourceType,
        id: resourceId || null,
        name: resourceName || null,
      },
      details: details || null,
      changes: changes || null,
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
}

module.exports = { logActivity };