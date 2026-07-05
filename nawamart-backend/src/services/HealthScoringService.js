const Merchant = require('../models/Merchant');
const Store = require('../models/Store');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');

class HealthScoringService {
  WEIGHTS = {
    recentActivity: 0.15,
    orderVolume: 0.20,
    revenue: 0.20,
    storeHealth: 0.15,
    customerEngagement: 0.10,
    accountAge: 0.10,
    productCatalog: 0.10,
  };

  async computeMerchantHealth(merchantId) {
    const merchant = await Merchant.findById(merchantId).select('_id createdAt isActive suspendedUntil').lean();
    if (!merchant) return null;

    const [stores, storeMetrics, orderMetrics, productCount, recentActivity, customerCount] = await Promise.all([
      Store.find({ merchant: merchantId }).select('_id name isActive storeStatus plan createdAt').lean(),
      Store.aggregate([
        { $match: { merchant: merchantId } },
        {
          $group: {
            _id: null,
            activeStores: { $sum: { $cond: ['$isActive', 1, 0] } },
            totalStores: { $sum: 1 },
            hasLiveStore: { $max: { $cond: [{ $eq: ['$storeStatus', 'live'] }, 1, 0] } },
          },
        },
      ]),
      Order.aggregate([
        { $match: { merchant: merchantId } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            completedOrders: { $sum: { $cond: [{ $in: ['$status', ['delivered', 'confirmed']] }, 1, 0] } },
            totalRevenue: { $sum: { $cond: [{ $in: ['$status', ['delivered', 'confirmed', 'shipped']] }, '$totalAmount', 0] } },
            avgOrderValue: { $avg: '$totalAmount' },
          },
        },
      ]),
      Product.countDocuments({ merchant: merchantId, isDeleted: { $ne: true } }),
      ActivityLog.countDocuments({
        $or: [{ actor: merchantId }, { user: merchantId }],
        createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      }),
      Order.distinct('customer', { merchant: merchantId }),
    ]);

    const s = storeMetrics[0] || { activeStores: 0, totalStores: 0, hasLiveStore: 0 };
    const o = orderMetrics[0] || { totalOrders: 0, completedOrders: 0, totalRevenue: 0, avgOrderValue: 0 };
    const uniqueCustomers = customerCount.length;

    const metrics = {
      accountAgeDays: Math.max(1, (Date.now() - new Date(merchant.createdAt).getTime()) / (24 * 60 * 60 * 1000)),
      activeStores: s.activeStores,
      totalStores: s.totalStores,
      hasLiveStore: s.hasLiveStore,
      totalOrders: o.totalOrders,
      completedOrders: o.completedOrders,
      completionRate: o.totalOrders > 0 ? (o.completedOrders / o.totalOrders) * 100 : 0,
      totalRevenue: o.totalRevenue,
      avgOrderValue: o.avgOrderValue,
      productCount,
      recentActivityCount: recentActivity,
      uniqueCustomerCount: uniqueCustomers,
      isSuspended: !merchant.isActive || (merchant.suspendedUntil && new Date(merchant.suspendedUntil) > new Date()),
    };

    const scores = this.calculateScores(metrics);
    const weightedScore = this.calculateWeightedScore(scores);
    const tier = this.getHealthTier(weightedScore);
    const flags = this.generateFlags(scores, metrics);

    return {
      merchantId,
      score: weightedScore,
      tier,
      scores,
      metrics,
      flags,
      computedAt: new Date(),
    };
  }

  calculateScores(metrics) {
    return {
      recentActivity: Math.min(Math.round(metrics.recentActivityCount * 7.14), 100),
      orderVolume: Math.min(Math.round(metrics.totalOrders * 1.67), 100),
      revenue: Math.min(Math.round(metrics.totalRevenue / 500), 100),
      storeHealth: this.calculateStoreHealthScore(metrics),
      customerEngagement: Math.min(Math.round(metrics.uniqueCustomerCount * 5), 100),
      accountAge: Math.min(Math.round(metrics.accountAgeDays * 0.55), 100),
      productCatalog: Math.min(Math.round(metrics.productCount * 2), 100),
    };
  }

  calculateStoreHealthScore(metrics) {
    let score = 0;
    if (metrics.totalStores > 0) score += 20;
    if (metrics.activeStores > 0) score += 25;
    if (metrics.activeStores === metrics.totalStores) score += 15;
    if (metrics.hasLiveStore) score += 25;
    if (metrics.totalStores >= 2) score += 15;
    return score;
  }

  calculateWeightedScore(scores) {
    return Math.round(
      scores.recentActivity * this.WEIGHTS.recentActivity +
      scores.orderVolume * this.WEIGHTS.orderVolume +
      scores.revenue * this.WEIGHTS.revenue +
      scores.storeHealth * this.WEIGHTS.storeHealth +
      scores.customerEngagement * this.WEIGHTS.customerEngagement +
      scores.accountAge * this.WEIGHTS.accountAge +
      scores.productCatalog * this.WEIGHTS.productCatalog
    );
  }

  getHealthTier(score) {
    if (score >= 80) return 'healthy';
    if (score >= 60) return 'moderate';
    if (score >= 40) return 'at_risk';
    return 'critical';
  }

  generateFlags(scores, metrics) {
    const flags = [];
    if (scores.recentActivity < 20) flags.push('low_activity');
    if (metrics.totalOrders === 0) flags.push('no_orders');
    if (!metrics.hasLiveStore) flags.push('no_live_store');
    if (metrics.totalOrders > 0 && metrics.completionRate < 50) flags.push('high_rejection_rate');
    if (metrics.isSuspended) flags.push('suspended');
    if (metrics.productCount === 0) flags.push('no_products');
    if (metrics.uniqueCustomerCount === 0) flags.push('no_customers');
    return flags;
  }

  async getHealthOverview() {
    const merchants = await Merchant.find({ isActive: true }).select('_id createdAt').lean();
    const results = await Promise.allSettled(
      merchants.map(m => this.computeMerchantHealth(m._id))
    );

    const healthData = results.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value);

    const tiers = { healthy: 0, moderate: 0, at_risk: 0, critical: 0 };
    const totalScore = healthData.reduce((sum, h) => {
      tiers[h.tier] = (tiers[h.tier] || 0) + 1;
      return sum + h.score;
    }, 0);

    const flaggedMerchants = healthData.filter(h => h.flags.length > 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 20);

    return {
      overview: {
        totalMerchants: healthData.length,
        averageScore: healthData.length > 0 ? Math.round(totalScore / healthData.length) : 0,
        tierDistribution: tiers,
        atRiskCount: (tiers.at_risk || 0) + (tiers.critical || 0),
      },
      flaggedMerchants,
    };
  }

  async getMerchantHealthList(page = 1, limit = 20, search = '') {
    const merchants = await Merchant.find(
      search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {}
    ).select('_id name email isActive createdAt').sort({ createdAt: -1 }).lean();

    const healthResults = await Promise.allSettled(
      merchants.map(m => this.computeMerchantHealth(m._id))
    );

    let data = healthResults
      .filter(r => r.status === 'fulfilled' && r.value)
      .map((r, i) => ({ ...r.value, name: merchants[i].name, email: merchants[i].email }));

    data.sort((a, b) => a.score - b.score);

    const total = data.length;
    const skip = (page - 1) * limit;
    const paginatedData = data.slice(skip, skip + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new HealthScoringService();
