const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
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
      unique: true,
    },
    trackQuantity: {
      type: Boolean,
      default: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'الكمية لا يمكن أن تكون سالبة'],
    },
    inventoryState: {
      type: String,
      enum: ['in_stock', 'out_of_stock', 'backorder', 'coming_soon'],
      default: 'out_of_stock',
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, 'الحد الأدنى لا يمكن أن يكون سالباً'],
    },
    isLowStock: {
      type: Boolean,
      default: false,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryLocation',
      default: null,
    },
    isBundle: {
      type: Boolean,
      default: false,
    },
    components: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'الكمية يجب أن تكون 1 على الأقل'],
        },
      },
    ],
    sku: {
      type: String,
      trim: true,
      default: null,
    },
    barcode: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

inventoryItemSchema.virtual('value').get(function () {
  return null;
});

inventoryItemSchema.pre('save', function (next) {
  if (!this.trackQuantity) {
    this.inventoryState = 'in_stock';
    this.isLowStock = false;
    return next();
  }
  if (this.quantity <= 0) {
    if (this.inventoryState !== 'backorder' && this.inventoryState !== 'coming_soon') {
      this.inventoryState = 'out_of_stock';
    }
  } else if (this.quantity > 0) {
    if (this.inventoryState === 'out_of_stock') {
      this.inventoryState = 'in_stock';
    }
  }
  this.isLowStock = this.trackQuantity && this.lowStockThreshold > 0 && this.quantity > 0 && this.quantity <= this.lowStockThreshold;
  next();
});

inventoryItemSchema.index({ store: 1, inventoryState: 1 });
inventoryItemSchema.index({ store: 1, isLowStock: 1 });
inventoryItemSchema.index({ store: 1, location: 1 });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
