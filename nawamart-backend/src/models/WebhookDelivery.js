const mongoose = require('mongoose');

const webhookDeliverySchema = new mongoose.Schema({
  webhook: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Webhook',
    required: [true, 'الويب هوك مطلوب'],
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: [true, 'التاجر مطلوب'],
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: [true, 'المتجر مطلوب'],
  },
  event: {
    type: String,
    required: [true, 'الحدث مطلوب'],
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  responseStatusCode: {
    type: Number,
    default: null,
  },
  responseBody: {
    type: String,
    default: null,
    maxlength: [10000, 'رد الخادم طويل جداً'],
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  attempts: {
    type: Number,
    default: 0,
  },
  maxAttempts: {
    type: Number,
    default: 3,
    min: [1, 'يجب محاولة واحدة على الأقل'],
    max: [10, 'لا يمكن أن تتجاوز المحاولات 10'],
  },
  nextRetryAt: {
    type: Date,
    default: null,
  },
  error: {
    type: String,
    default: null,
  },
  duration: {
    type: Number,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

webhookDeliverySchema.index({ webhook: 1, createdAt: -1 });
webhookDeliverySchema.index({ merchant: 1, store: 1 });
webhookDeliverySchema.index({ status: 1, nextRetryAt: 1 });

module.exports = mongoose.model('WebhookDelivery', webhookDeliverySchema);
