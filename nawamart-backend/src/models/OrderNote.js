const mongoose = require('mongoose');

const orderNoteSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      default: null,
    },
    authorName: {
      type: String,
      default: 'النظام',
    },
    content: {
      type: String,
      required: [true, 'محتوى الملاحظة مطلوب'],
      trim: true,
      maxlength: 2000,
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
    isCustomerVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderNoteSchema.index({ order: 1, createdAt: -1 });

module.exports = mongoose.model('OrderNote', orderNoteSchema);
