const express = require('express');
const router = express.Router();
const {
  getPlatformMetrics,
  getPlatformOverview,
  refreshMetrics,
  getMerchantAnalytics,
  getRevenueAnalytics,
  getHealthScores,
  getHealthOverview,
  getMerchantHealth,
  getUsageMetrics,
  getFeatureAdoption,
  getMetricHistory,
} = require('../controllers/analytics.controller');
const { verifyAdmin } = require('../middleware/verifyAdmin');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

router.get('/platform/metrics', verifyAdmin, getPlatformMetrics);
router.get('/platform/overview', verifyAdmin, getPlatformOverview);
router.post('/platform/refresh', verifyAdmin, refreshMetrics);

router.get('/revenue', verifyAdmin, getRevenueAnalytics);

router.get('/health', verifyAdmin, getHealthScores);
router.get('/health/overview', verifyAdmin, getHealthOverview);
router.get('/health/:merchantId', verifyAdmin, getMerchantHealth);

router.get('/usage', verifyAdmin, getUsageMetrics);
router.get('/features', verifyAdmin, getFeatureAdoption);
router.get('/history', verifyAdmin, getMetricHistory);

router.get('/merchant/:merchantId', verifyAdmin, getMerchantAnalytics);
router.get('/merchant', verifyToken, requireRole('merchant'), getMerchantAnalytics);

module.exports = router;
