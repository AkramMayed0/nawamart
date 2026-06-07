const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['merchant', 'customer'],
      required: true,
    },
    senderType: {
      type: String,
      enum: ['merchant', 'customer'],
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'link', 'product_card'],
      default: 'text',
      required: true,
    },
    // ─── Product card snapshot (populated for type=product_card) ─────────────
    productCard: {
      productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
      name:        { type: String, default: null },
      price:       { type: Number, default: null },
      salePrice:   { type: Number, default: null },
      image:       { type: String, default: null },
      isDigital:   { type: Boolean, default: false },
      storeSlug:   { type: String, default: null },
      currency:    { type: String, default: 'YER' },
    },
    content: {
      type: String,
      required: false,
      trim: true,
      maxlength: [2000, 'الرسالة لا يمكن أن تتجاوز 2000 حرف'],
      default: '',
    },
    fileName: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    replyContent: {
      type: String,
      default: null,
    },
    replyType: {
      type: String,
      default: null,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for backward compatibility / aliasing if needed
messageSchema.virtual('senderId').get(function () {
  return this.sender;
});

const chatSchema = new mongoose.Schema(
  {
    // ─── Chat type ─────────────────────────────────────────────────────────────
    chatType: {
      type: String,
      enum: ['sales', 'delivery'],
      default: 'delivery',
    },
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
    // Link chat to a specific order
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    receiptConfirmed: {
      type: Boolean,
      default: false,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    // Track unread counts per side
    merchantUnread: {
      type: Number,
      default: 0,
    },
    customerUnread: {
      type: Number,
      default: 0,
    },
    lastMessage: {
      type: String,
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
// Ensure one chat per order, or one active store chat per customer
chatSchema.index({ order: 1 }, { unique: true, sparse: true });
chatSchema.index({ merchant: 1, customer: 1, store: 1 }, { unique: true });
chatSchema.index({ merchant: 1, lastMessageAt: -1 });
chatSchema.index({ customer: 1, lastMessageAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
