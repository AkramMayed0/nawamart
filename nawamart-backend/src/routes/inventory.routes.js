const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const ctrl = require('../controllers/inventory.controller');

router.use(verifyToken, requireRole('merchant'));

// Inventory items
router.get('/items', ctrl.getInventoryItems);
router.get('/items/:id', ctrl.getInventoryItem);
router.put('/items/:id', ctrl.updateInventoryItem);

// Adjustments
router.post('/adjustments', ctrl.createAdjustment);
router.get('/adjustments', ctrl.getAdjustments);

// Locations
router.post('/locations', ctrl.createLocation);
router.get('/locations', ctrl.getLocations);
router.put('/locations/:id', ctrl.updateLocation);
router.delete('/locations/:id', ctrl.deleteLocation);

// Transfers
router.post('/transfers', ctrl.transferStock);

// Reports
router.get('/reports/valuation', ctrl.getValuationReport);
router.get('/reports/low-stock', ctrl.getLowStockReport);
router.get('/reports/projected-depletion', ctrl.getProjectedDepletion);

// History
router.get('/history', ctrl.getInventoryHistory);

module.exports = router;
