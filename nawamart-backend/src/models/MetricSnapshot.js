const mongoose = require('mongoose');

const metricSnapshotSchema = new mongoose.Schema(
  {
    snapshotType: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    scope: {
      type: String,
      enum: ['platform', 'merchant', 'store'],
      default: 'platform',
    },
    scopeRef: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    metrics: {
      platform: {
        totalMerchants: { type: Number, default: 0 },
        activeMerchants: { type: Number, default: 0 },
        totalCustomers: { type: Number, default: 0 },
        totalStores: { type: Number, default: 0 },
        activeStores: { type: Number, default: 0 },
        totalProducts: { type: Number, default: 0 },
        totalOrders: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        pendingSubscriptions: { type: Number, default: 0 },
        newMerchants: { type: Number, default: 0 },
        newStores: { type: Number, default: 0 },
        newCustomers: { type: Number, default: 0 },
        newOrders: { type: Number, default: 0 },
        newRevenue: { type: Number, default: 0 },
      },
      revenue: {
        mrr: { type: Number, default: 0 },
        arr: { type: Number, default: 0 },
        churnRate: { type: Number, default: 0 },
        averageOrderValue: { type: Number, default: 0 },
        conversionRate: { type: Number, default: 0 },
        revenueByPlan: {
          starter: { type: Number, default: 0 },
          pro: { type: Number, default: 0 },
          business: { type: Number, default: 0 },
        },
        ltv: { type: Number, default: 0 },
      },
      usage: {
        totalBandwidthMb: { type: Number, default: 0 },
        totalStorageMb: { type: Number, default: 0 },
        averageBandwidthPerStore: { type: Number, default: 0 },
        averageStoragePerStore: { type: Number, default: 0 },
        apiCalls: { type: Number, default: 0 },
      },
      health: {
        averageHealthScore: { type: Number, default: 0 },
        atRiskMerchants: { type: Number, default: 0 },
        healthyMerchants: { type: Number, default: 0 },
        featureAdoptionRate: { type: Number, default: 0 },
        mostUsedFeatures: [{ type: String }],
      },
    },
    metadata: {
      generatedBy: { type: String, default: 'system' },
      generationDurationMs: { type: Number, default: 0 },
      errors: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

metricSnapshotSchema.index({ snapshotType: 1, periodStart: -1 });
metricSnapshotSchema.index({ scope: 1, scopeRef: 1, snapshotType: 1, periodStart: -1 });
metricSnapshotSchema.index({ periodEnd: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

module.exports = mongoose.model('MetricSnapshot', metricSnapshotSchema);
