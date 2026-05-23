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
      required: [true, 'العميل مطلوب'],
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
    // Delivery address snapshot
    deliveryAddress: {
      city:     { type: String, required: true },
      district: { type: String, default: null },
      details:  { type: String, default: null },
      phone:    { type: String, required: true },
    },
    // Order lifecycle status
    // payment_under_review = paid via transfer, awaiting merchant confirmation
    status: {
      type: String,
      enum: {
        values: ['pending', 'payment_under_review', 'confirmed', 'rejected', 'shipped', 'delivered'],
        message: 'حالة الطلب غير صالحة',
      },
      default: 'pending',
    },
    // Payment method
    paymentMethod: {
      type: String,
      enum: {
        values: ['cherry', 'kuraimi', 'oneCash', 'cash'],
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
    // Timestamps for each status transition
    confirmedAt:  { type: Date, default: null },
    rejectedAt:   { type: Date, default: null },
    shippedAt:    { type: Date, default: null },
    deliveredAt:  { type: Date, default: null },
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
orderSchema.index({ customer: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
