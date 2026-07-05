const mongoose = require('mongoose');

const dataRequestSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    default: null,
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    default: null,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null,
  },
  type: {
    type: String,
    enum: ['export', 'deletion', 'rectification'],
    required: [true, 'نوع الطلب مطلوب'],
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending',
  },
  requestedBy: {
    type: String,
    enum: ['customer', 'merchant', 'admin'],
    required: [true, 'الجهة الطالبة مطلوبة'],
  },
  requestedEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: null,
  },
  reason: {
    type: String,
    trim: true,
    maxlength: [1000, 'السبب لا يمكن أن يتجاوز 1000 حرف'],
    default: null,
  },
  dataPayload: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  exportFormat: {
    type: String,
    enum: ['json', 'csv'],
    default: 'json',
  },
  exportUrl: {
    type: String,
    default: null,
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  processedAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  rejectionReason: {
    type: String,
    default: null,
  },
  notes: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

dataRequestSchema.virtual('isExpired').get(function () {
  return this.expiresAt && new Date() > this.expiresAt;
});

dataRequestSchema.index({ customer: 1, type: 1 });
dataRequestSchema.index({ merchant: 1, store: 1 });
dataRequestSchema.index({ status: 1, createdAt: -1 });
dataRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('DataRequest', dataRequestSchema);
