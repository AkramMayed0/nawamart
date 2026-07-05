const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name:     { type: String, required: true },  // snapshot at order time
    price:    { type: Number, required: true },  // snapshot at order time
    quantity: {
      type: Number,
      required: true,
      min: [1, 'الكمية يجب أن تكون واحداً على الأقل'],
    },
    image: { type: String, default: null },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'المتجر مطلوب'],
    },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: [true, 'التاجر مطلوب'],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'يجب إضافة منتج واحد على الأقل',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'المبلغ الإجمالي لا يمكن أن يكون سالباً'],
    },
    // Shipping fee snapshot (set at order creation, 0 for digital stores)
    shippingFee: {
      type: Number,
      default: 0,
      min: [0, 'رسوم الشحن لا يمكن أن تكون سالبة'],
    },
    // Delivery address snapshot
    deliveryAddress: {
      name:     { type: String, required: true },
      city:     { type: String, required: true },
      district: { type: String, default: null },
      details:  { type: String, default: null },
      phone:    { type: String, required: true },
      location: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
      },
    },
    // Preferred contact method for digital delivery
    contactMethod: {
      type: String,
      enum: ['whatsapp', 'telegram', 'instagram', 'phone'],
      default: 'whatsapp',
    },
    contactHandle: {
      type: String,
      trim: true,
      default: null,
    },
    // Order lifecycle status
    // payment_under_review = paid via transfer, awaiting merchant confirmation
    status: {
      type: String,
      enum: {
        values: ['pending', 'payment_under_review', 'confirmed', 'processing', 'rejected', 'shipped', 'delivered', 'returned', 'cancelled'],
        message: 'حالة الطلب غير صالحة',
      },
      default: 'pending',
    },
    // Payment method
    paymentMethod: {
      type: String,
      enum: {
        values: ['kuraimi', 'oneCash', 'jaib', 'cash'],
        message: 'طريقة الدفع غير صالحة',
      },
      required: [true, 'طريقة الدفع مطلوبة'],
    },
    // Wasl (receipt) screenshot URL uploaded by customer
    paymentWasl: {
      type: String,
      default: null,
    },
    // Whether the merchant confirmed payment receipt
    paymentConfirmed: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'الملاحظات لا يمكن أن تتجاوز 500 حرف'],
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
    // Link to the chat created for this order (digital delivery)
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      default: null,
    },
    digitalDelivery: {
      status: {
        type: String,
        enum: ['not_applicable', 'pending', 'delivered', 'failed'],
        default: 'not_applicable',
      },
      deliveredAt: { type: Date, default: null },
      items: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
          name: { type: String, default: null },
          type: { type: String, enum: ['file', 'url', 'code'], default: 'url' },
          fileUrl: { type: String, default: null },
          externalUrl: { type: String, default: null },
          codes: { type: [String], default: [] },
          instructions: { type: String, default: null },
        },
      ],
      error: { type: String, default: null },
    },
    // Packing slip metadata
    packingSlip: {
      generatedAt:  { type: Date, default: null },
      generatedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', default: null },
      printedCount: { type: Number, default: 0 },
    },
    // Total fulfilled quantity across all fulfillments
    fulfilledQuantity: { type: Number, default: 0 },
    isFullyFulfilled:  { type: Boolean, default: false },
    // Flag to indicate if this order is available in the courier pool
    inCourierPool: {
      type: Boolean,
      default: false,
    },
    // Who performed each status transition (for audit trail)
    confirmedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', default: null },
    rejectedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', default: null },
    shippedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', default: null },
    deliveredBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', default: null },
    processingBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', default: null },
    cancelledBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', default: null },
    returnedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', default: null },
    // Timestamps for each status transition
    confirmedAt:  { type: Date, default: null },
    rejectedAt:   { type: Date, default: null },
    shippedAt:    { type: Date, default: null },
    deliveredAt:  { type: Date, default: null },
    processingAt: { type: Date, default: null },
    cancelledAt:  { type: Date, default: null },
    returnedAt:   { type: Date, default: null },
    cancellationReason: {
      type: String,
      trim: true,
      default: null,
    },
    // Order timeline (computed audit trail)
    orderTimeline: [
      {
        action:  { type: String, required: true },
        label:   { type: String, required: true },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', default: null },
        performedByName: { type: String, default: 'النظام' },
        timestamp: { type: Date, default: Date.now },
        details: { type: String, default: null },
      },
    ],
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
orderSchema.index({ store: 1, status: 1 });
orderSchema.index({ merchant: 1, createdAt: -1 });
orderSchema.index({ merchant: 1, status: 1, createdAt: -1 });
orderSchema.index({ merchant: 1, store: 1, createdAt: -1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ store: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
