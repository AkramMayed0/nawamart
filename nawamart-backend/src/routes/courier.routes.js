const express = require('express');
const router = express.Router();
const {
  listCouriers,
  createCourier,
  assignDispatch,
  listDispatches,
  sendToPool,
  getPortalAvailable,
  acceptFromPool,
  getPortalTasks,
  updateTaskStatus,
} = require('../controllers/courier.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const { requireFeature } = require('../middleware/requireFeature');

// ─── Courier Portal Routes (Unauthenticated / Magic Link) ───────────────
// These do not require merchant auth because couriers use a magic link
router.get('/portal/:courierId/available', getPortalAvailable);
router.post('/portal/:courierId/accept', acceptFromPool);
router.get('/portal/:courierId/tasks', getPortalTasks);
router.put('/portal/:courierId/tasks/:dispatchId', updateTaskStatus);

// ─── Merchant Dashboard Routes ──────────────────────────────────────────
router.use(verifyToken, requireRole('merchant'));
router.use(requireFeature('local_courier_dispatcher'));

router.get('/couriers', listCouriers);
router.post('/couriers', createCourier);
router.get('/dispatches', listDispatches);
router.post('/dispatches', assignDispatch);
router.post('/pool', sendToPool);

module.exports = router;
