const express = require('express');
const router = express.Router();
const {
  listCouriers,
  createCourier,
  assignDispatch,
  listDispatches,
} = require('../controllers/courier.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const { requireFeature } = require('../middleware/requireFeature');

router.use(verifyToken, requireRole('merchant'));
router.use(requireFeature('local_courier_dispatcher'));

router.get('/couriers', listCouriers);
router.post('/couriers', createCourier);
router.get('/dispatches', listDispatches);
router.post('/dispatches', assignDispatch);

module.exports = router;
