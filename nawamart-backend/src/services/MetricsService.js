const Merchant = require('../models/Merchant');
const Customer = require('../models/Customer');
const Store = require('../models/Store');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Subscription = require('../models/Subscription');
const MetricSnapshot = require('../models/MetricSnapshot');
const ActivityLog = require('../models/ActivityLog');

class MetricsService {
  async computePlatformSnapshot(snapshotType, periodStart, periodEnd) {
    const start = performance.now();

    try {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

      const [
        totalMerchants, totalCustomers, totalStores, totalOrders, totalProducts,
        activeMerchants, activeStores, pendingSubscriptions,
        periodMerchants, periodStores, periodCustomers, periodOrders,
        revenueAgg, periodRevenueAgg,
        planCounts,
      ] = await Promise.all([
        Merchant.countDocuments(),
        Customer.countDocuments(),
        Store.countDocuments(),
        Order.countDocuments(),
        Product.countDocuments({ isDeleted: { $ne: true } }),
        Merchant.countDocuments({ isActive: true, updatedAt: { $gte: twoDaysAgo } }),
        Store.countDocuments({ isActive: true }),
        Subscription.countDocuments({ status: 'pending' }),
        Merchant.countDocuments({ createdAt: { $gte: periodStart, $lte: periodEnd } }),
        Store.countDocuments({ createdAt: { $gte: periodStart, $lte: periodEnd } }),
        Customer.countDocuments({ createdAt: { $gte: periodStart, $lte: periodEnd } }),
        Order.countDocuments({ createdAt: { $gte: periodStart, $lte: periodEnd } }),
        Order.aggregate([
          { $match: { status: { $in: ['confirmed', 'shipped', 'delivered'] } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
        ]),
        Order.aggregate([
          { $match: { status: { $in: ['confirmed', 'shipped', 'delivered'] }, createdAt: { $gte: periodStart, $lte: periodEnd } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
        ]),
        Store.aggregate([
          { $group: { _id: '$plan', count: { $sum: 1 } } },
        ]),
      ]);

      const totalRevenue = revenueAgg[0]?.total ?? 0;
      const totalPaidOrders = revenueAgg[0]?.count ?? 0;
      const periodRevenue = periodRevenueAgg[0]?.total ?? 0;
      const periodPaidOrders = periodRevenueAgg[0]?.count ?? 0;

      const mrr = this.computeMRR(planCounts);
      const arr = mrr * 12;
      const averageOrderValue = totalPaidOrders > 0 ? Math.round(totalRevenue / totalPaidOrders) : 0;
      const conversionRate = totalOrders > 0 ? Math.round((periodOrders / totalOrders) * 100) : 0;

      return {
        platform: {
          totalMerchants,
          activeMerchants,
          totalCustomers,
          totalStores,
          activeStores,
          totalProducts,
          totalOrders,
          totalRevenue,
          pendingSubscriptions,
          newMerchants: periodMerchants,
          newStores: periodStores,
          newCustomers: periodCustomers,
          newOrders: periodOrders,
          newRevenue: periodRevenue,
        },
        revenue: {
          mrr,
          arr,
          churnRate: await this.computeChurnRate(periodStart, periodEnd),
          averageOrderValue,
          conversionRate,
          revenueByPlan: {
            starter: 0,
            pro: 0,
            business: 0,
          },
          ltv: averageOrderValue > 0 ? await this.computeLTV() : 0,
        },
        usage: await this.computeResourceUsage(),
        health: await this.computePlatformHealth(),
      };
    } catch (err) {
      return null;
    }
  }

  computeMRR(planCounts) {
    const planPrices = { starter: 0, pro: 15000, business: 45000 };
    return planCounts.reduce((sum, p) => {
      const price = planPrices[p._id] || 0;
      return sum + (price * p.count);
    }, 0);
  }

  async computeChurnRate(periodStart, periodEnd) {
    const totalAtStart = await Merchant.countDocuments({
      createdAt: { $lt: periodStart },
      isActive: true,
    });

    if (totalAtStart === 0) return 0;

    const churnedInPeriod = await Merchant.countDocuments({
      isActive: false,
      updatedAt: { $gte: periodStart, $lte: periodEnd },
    });

    return Math.round((churnedInPeriod / totalAtStart) * 100 * 100) / 100;
  }

  async computeLTV() {
    const avg = await Order.aggregate([
      { $match: { status: { $in: ['confirmed', 'shipped', 'delivered'] } } },
      { $group: { _id: '$merchant', totalSpent: { $sum: '$totalAmount' }, orderCount: { $sum: 1 } } },
      { $group: { _id: null, avgLtv: { $avg: '$totalSpent' } } },
    ]);
    return avg[0]?.avgLtv ?? 0;
  }

  async computeResourceUsage() {
    const totalStores = await Store.countDocuments();
    return {
      totalBandwidthMb: 0,
      totalStorageMb: 0,
      averageBandwidthPerStore: 0,
      averageStoragePerStore: 0,
      apiCalls: 0,
    };
  }

  async computePlatformHealth() {
    const scores = await this.computeHealthScores();
    const total = scores.length;
    if (total === 0) {
      return {
        averageHealthScore: 0,
        atRiskMerchants: 0,
        healthyMerchants: 0,
        featureAdoptionRate: 0,
        mostUsedFeatures: [],
      };
    }

    const atRisk = scores.filter(s => s.score < 40).length;
    const healthy = scores.filter(s => s.score >= 70).length;
    const avgScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / total);

    return {
      averageHealthScore: avgScore,
      atRiskMerchants: atRisk,
      healthyMerchants: healthy,
      featureAdoptionRate: 0,
      mostUsedFeatures: [],
    };
  }

  async computeHealthScores() {
    const merchants = await Merchant.find({ isActive: true }).select('_id createdAt').lean();
    const scores = [];

    for (const merchant of merchants) {
      const [storeCount, orderCount, orderRevenue, recentActivity, customerCount] = await Promise.all([
        Store.countDocuments({ merchant: merchant._id }),
        Order.countDocuments({ merchant: merchant._id, status: { $in: ['confirmed', 'shipped', 'delivered'] } }),
        Order.aggregate([
          { $match: { merchant: merchant._id, status: { $in: ['confirmed', 'shipped', 'delivered'] } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        ActivityLog.countDocuments({ actor: { $in: [merchant._id] }, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
        Customer.countDocuments({ merchant: merchant._id }),
      ]);

      const revenue = orderRevenue[0]?.total ?? 0;
      const accountAge = Math.max(1, (Date.now() - new Date(merchant.createdAt).getTime()) / (30 * 24 * 60 * 60 * 1000));
      const recentActivityScore = Math.min(recentActivity * 10, 100);
      const orderScore = Math.min(orderCount * 5, 100);
      const revenueScore = Math.min(Math.round(revenue / 1000), 100);
      const storeScore = Math.min(storeCount * 20, 100);
      const customerScore = Math.min(customerCount * 2, 100);

      const score = Math.round(
        0.15 * recentActivityScore +
        0.25 * orderScore +
        0.25 * revenueScore +
        0.10 * storeScore +
        0.10 * customerScore +
        0.15 * Math.min(accountAge * 5, 100)
      );

      scores.push({ merchantId: merchant._id, score });
    }

    return scores;
  }

  async generateSnapshot(snapshotType = 'daily') {
    const now = new Date();
    let periodStart, periodEnd;

    if (snapshotType === 'daily') {
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (snapshotType === 'weekly') {
      const dayOfWeek = now.getDay();
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek - 7);
      periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
    } else {
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const start = performance.now();
    const metrics = await this.computePlatformSnapshot(snapshotType, periodStart, periodEnd);
    const duration = Math.round(performance.now() - start);

    if (!metrics) return null;

    const snapshot = await MetricSnapshot.create({
      snapshotType,
      periodStart,
      periodEnd,
      scope: 'platform',
      metrics,
      metadata: {
        generatedBy: 'system',
        generationDurationMs: duration,
      },
    });

    return snapshot;
  }

  async getMerchantStats(merchantId, dateFrom, dateTo) {
    const [totalOrders, totalRevenue, totalProducts, totalCustomers,
      recentOrders, monthlyRevenue, statusCounts] = await Promise.all([
      Order.countDocuments({ merchant: merchantId }),
      Order.aggregate([
        { $match: { merchant: merchantId, status: { $in: ['confirmed', 'shipped', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Product.countDocuments({ merchant: merchantId, isDeleted: { $ne: true } }),
      Customer.countDocuments({ merchant: merchantId }),
      Order.find({ merchant: merchantId }).sort({ createdAt: -1 }).limit(5).lean(),
      Order.aggregate([
        { $match: { merchant: merchantId, status: { $in: ['confirmed', 'shipped', 'delivered'] } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 12 },
      ]),
      Order.aggregate([
        { $match: { merchant: merchantId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total ?? 0,
      totalProducts,
      totalCustomers,
      recentOrders,
      monthlyRevenue,
      orderStatusBreakdown: statusCounts,
    };
  }
}

module.exports = new MetricsService();
