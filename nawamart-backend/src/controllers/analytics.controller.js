const MetricSnapshot = require('../models/MetricSnapshot');
const MetricsService = require('../services/MetricsService');
const HealthScoringService = require('../services/HealthScoringService');
const { asyncHandler, apiResponse, getPaginationParams, paginateResponse } = require('../utils/helpers');

const getPlatformMetrics = asyncHandler(async (req, res) => {
  const { type = 'daily', limit = 30 } = req.query;

  const snapshots = await MetricSnapshot.find({
    snapshotType: type,
    scope: 'platform',
  })
    .sort({ periodEnd: -1 })
    .limit(parseInt(limit))
    .lean();

  return apiResponse(res, {
    message: 'تم جلب مقاييس المنصة',
    data: snapshots,
  });
});

const getPlatformOverview = asyncHandler(async (req, res) => {
  const latest = await MetricSnapshot.findOne({ scope: 'platform' })
    .sort({ periodEnd: -1 })
    .lean();

  if (!latest) {
    const snapshot = await MetricsService.generateSnapshot('daily');
    return apiResponse(res, {
      message: 'تم جلب نظرة عامة للمنصة',
      data: snapshot,
    });
  }

  return apiResponse(res, {
    message: 'تم جلب نظرة عامة للمنصة',
    data: latest,
  });
});

const refreshMetrics = asyncHandler(async (req, res) => {
  const { type = 'daily' } = req.body;

  const snapshot = await MetricsService.generateSnapshot(type);

  if (!snapshot) {
    return res.status(500).json({
      success: false,
      data: null,
      message: 'فشل في تحديث المقاييس',
    });
  }

  return apiResponse(res, {
    message: 'تم تحديث المقاييس بنجاح',
    data: snapshot,
  });
});

const getMerchantAnalytics = asyncHandler(async (req, res) => {
  const merchantId = req.params.merchantId || req.user._id;
  const { from, to } = req.query;

  const dateFrom = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dateTo = to ? new Date(to) : new Date();

  const stats = await MetricsService.getMerchantStats(merchantId, dateFrom, dateTo);

  return apiResponse(res, {
    message: 'تم جلب تحليلات التاجر',
    data: stats,
  });
});

const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const dateFrom = from ? new Date(from) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const dateTo = to ? new Date(to) : new Date();

  const snapshots = await MetricSnapshot.find({
    snapshotType: 'monthly',
    scope: 'platform',
    periodEnd: { $gte: dateFrom, $lte: dateTo },
  })
    .sort({ periodEnd: 1 })
    .lean();

  const monthlyBreakdown = snapshots.map(s => ({
    period: s.periodStart,
    mrr: s.metrics.revenue.mrr,
    arr: s.metrics.revenue.arr,
    revenue: s.metrics.platform.newRevenue,
    totalRevenue: s.metrics.platform.totalRevenue,
    averageOrderValue: s.metrics.revenue.averageOrderValue,
    churnRate: s.metrics.revenue.churnRate,
  }));

  const latest = snapshots[snapshots.length - 1];
  const currentMetrics = latest ? {
    mrr: latest.metrics.revenue.mrr,
    arr: latest.metrics.revenue.arr,
    churnRate: latest.metrics.revenue.churnRate,
    averageOrderValue: latest.metrics.revenue.averageOrderValue,
    conversionRate: latest.metrics.revenue.conversionRate,
    ltv: latest.metrics.revenue.ltv,
  } : null;

  return apiResponse(res, {
    message: 'تم جلب تحليلات الإيرادات',
    data: {
      currentMetrics,
      monthlyBreakdown,
    },
  });
});

const getHealthScores = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req);
  const { search } = req.query;

  const result = await HealthScoringService.getMerchantHealthList(page, limit, search);

  return apiResponse(res, {
    message: 'تم جلب درجات صحة التجار',
    data: result.data,
    pagination: result.pagination,
  });
});

const getHealthOverview = asyncHandler(async (req, res) => {
  const overview = await HealthScoringService.getHealthOverview();

  return apiResponse(res, {
    message: 'تم جلب نظرة عامة على صحة التجار',
    data: overview,
  });
});

const getMerchantHealth = asyncHandler(async (req, res) => {
  const merchantId = req.params.merchantId;
  const health = await HealthScoringService.computeMerchantHealth(merchantId);

  if (!health) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'التاجر غير موجود',
    });
  }

  return apiResponse(res, {
    message: 'تم جلب درجة صحة التاجر',
    data: health,
  });
});

const getUsageMetrics = asyncHandler(async (req, res) => {
  const latest = await MetricSnapshot.findOne({ scope: 'platform' })
    .sort({ periodEnd: -1 })
    .lean();

  const usage = latest ? latest.metrics.usage : {
    totalBandwidthMb: 0,
    totalStorageMb: 0,
    averageBandwidthPerStore: 0,
    averageStoragePerStore: 0,
    apiCalls: 0,
  };

  return apiResponse(res, {
    message: 'تم جلب مقاييس استخدام الموارد',
    data: usage,
  });
});

const getFeatureAdoption = asyncHandler(async (req, res) => {
  const Store = require('../models/Store');

  const stores = await Store.find({ isActive: true }).select('featureToggles plan').lean();
  const total = stores.length || 1;

  const featureCounts = {};
  stores.forEach(store => {
    if (store.featureToggles) {
      Object.entries(store.featureToggles).forEach(([feature, enabled]) => {
        if (enabled) {
          featureCounts[feature] = (featureCounts[feature] || 0) + 1;
        }
      });
    }
  });

  const features = Object.entries(featureCounts)
    .map(([name, count]) => ({
      name,
      label: getFeatureLabel(name),
      activeStores: count,
      adoptionRate: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.adoptionRate - a.adoptionRate);

  const planDistribution = {};
  stores.forEach(store => {
    const plan = store.plan || 'starter';
    planDistribution[plan] = (planDistribution[plan] || 0) + 1;
  });

  return apiResponse(res, {
    message: 'تم جلب معدلات تبني الميزات',
    data: {
      features,
      planDistribution,
      totalStores: stores.length,
    },
  });
});

function getFeatureLabel(name) {
  const labels = {
    blog: 'المدونة',
    reviews: 'التقييمات',
    wishlists: 'قائمة الرغبات',
    multiLanguage: 'تعدد اللغات',
    dropshipping: 'دروب شيبينغ',
  };
  return labels[name] || name;
}

const getMetricHistory = asyncHandler(async (req, res) => {
  const { metric, from, to, type = 'daily' } = req.query;
  const dateFrom = from ? new Date(from) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const dateTo = to ? new Date(to) : new Date();

  const snapshots = await MetricSnapshot.find({
    snapshotType: type,
    scope: 'platform',
    periodEnd: { $gte: dateFrom, $lte: dateTo },
  })
    .sort({ periodEnd: 1 })
    .lean();

  const extractMetric = (snap) => {
    if (!metric) return snap.metrics.platform;
    const parts = metric.split('.');
    let value = snap.metrics;
    for (const part of parts) {
      if (value && typeof value === 'object') value = value[part];
      else return null;
    }
    return value;
  };

  const history = snapshots.map(s => ({
    date: s.periodEnd,
    value: extractMetric(s),
  })).filter(h => h.value !== null);

  return apiResponse(res, {
    message: 'تم جلب تاريخ المقياس',
    data: history,
  });
});

module.exports = {
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
};
