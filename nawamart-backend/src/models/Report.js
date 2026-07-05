const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'اسم التقرير مطلوب'],
      trim: true,
      maxlength: [200, 'اسم التقرير لا يمكن أن يتجاوز 200 حرف'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'الوصف لا يمكن أن يتجاوز 1000 حرف'],
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    createdByRole: {
      type: String,
      enum: ['admin', 'merchant'],
      required: true,
    },
    scope: {
      type: String,
      enum: ['platform', 'merchant', 'store'],
      default: 'platform',
    },
    scopeRef: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    config: {
      metrics: {
        type: [String],
        default: [],
      },
      dateRange: {
        preset: {
          type: String,
          enum: ['today', 'yesterday', 'last7days', 'last30days', 'thisMonth', 'lastMonth', 'thisQuarter', 'lastQuarter', 'thisYear', 'custom'],
          default: 'last30days',
        },
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
      },
      filters: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
      groupBy: {
        type: String,
        enum: ['day', 'week', 'month', 'quarter', 'year', null],
        default: null,
      },
      chartType: {
        type: String,
        enum: ['table', 'bar', 'line', 'pie', 'area', 'number', null],
        default: 'table',
      },
    },
    schedule: {
      enabled: { type: Boolean, default: false },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly', null],
        default: null,
      },
      nextRunAt: { type: Date, default: null },
      lastRunAt: { type: Date, default: null },
      recipients: {
        type: [{ type: String, trim: true, lowercase: true }],
        default: [],
      },
      format: {
        type: String,
        enum: ['email_html', 'csv', 'json'],
        default: 'email_html',
      },
    },
    lastSentAt: { type: Date, default: null },
    totalSent: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ createdBy: 1 });
reportSchema.index({ 'schedule.enabled': 1, 'schedule.nextRunAt': 1 });
reportSchema.index({ scope: 1, scopeRef: 1 });

module.exports = mongoose.model('Report', reportSchema);
