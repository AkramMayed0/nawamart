const mongoose = require('mongoose');

const inventoryAdjustmentSchema = new mongoose.Schema(
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
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'المنتج مطلوب'],
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryLocation',
      default: null,
    },
    type: {
      type: String,
      enum: [
        'manual',
        'order',
        'purchase_order',
        'transfer_in',
        'transfer_out',
        'return',
        'bundle_deduction',
        'correction',
      ],
      required: [true, 'نوع التعديل مطلوب'],
    },
    quantity: {
      type: Number,
      required: [true, 'الكمية مطلوبة'],
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, 'السبب لا يمكن أن يتجاوز 500 حرف'],
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'الملاحظات لا يمكن أن تتجاوز 1000 حرف'],
      default: null,
    },
    reference: {
      type: {
        type: String,
        enum: ['Order', 'Product', 'InventoryAdjustment', null],
        default: null,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: [true, 'المستخدم مطلوب'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

inventoryAdjustmentSchema.index({ store: 1, createdAt: -1 });
inventoryAdjustmentSchema.index({ product: 1, createdAt: -1 });
inventoryAdjustmentSchema.index({ type: 1 });
inventoryAdjustmentSchema.index({ store: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('InventoryAdjustment', inventoryAdjustmentSchema);
