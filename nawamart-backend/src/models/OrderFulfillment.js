const mongoose = require('mongoose');

const fulfillmentItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name:     { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderFulfillmentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    items: {
      type: [fulfillmentItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'يجب إضافة منتج واحد على الأقل',
      },
    },
    carrier: {
      type: String,
      trim: true,
      default: null,
    },
    trackingNumber: {
      type: String,
      trim: true,
      default: null,
    },
    trackingUrl: {
      type: String,
      trim: true,
      default: null,
    },
    shippedAt:   { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderFulfillmentSchema.index({ order: 1, createdAt: -1 });

module.exports = mongoose.model('OrderFulfillment', orderFulfillmentSchema);
