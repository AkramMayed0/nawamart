const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ['merchant', 'customer'],
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // Could ref either Merchant or Customer — polymorphic
    },
    text: {
      type: String,
      trim: true,
      maxlength: [2000, 'الرسالة لا يمكن أن تتجاوز 2000 حرف'],
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const chatSchema = new mongoose.Schema(
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
    // Optional: link chat to a specific order
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
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
chatSchema.index({ merchant: 1, customer: 1, store: 1 }, { unique: true });
chatSchema.index({ merchant: 1, lastMessageAt: -1 });
chatSchema.index({ customer: 1, lastMessageAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
