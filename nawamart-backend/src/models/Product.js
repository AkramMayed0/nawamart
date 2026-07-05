const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, 'اسم المنتج مطلوب'],
      trim: true,
      minlength: [2, 'اسم المنتج يجب أن يكون على الأقل حرفين'],
      maxlength: [200, 'اسم المنتج لا يمكن أن يتجاوز 200 حرف'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'الوصف لا يمكن أن يتجاوز 2000 حرف'],
      default: null,
    },
    price: {
      type: Number,
      required: [true, 'السعر مطلوب'],
      min: [0, 'السعر لا يمكن أن يكون سالباً'],
    },
    // Optional discounted price
    salePrice: {
      type: Number,
      min: [0, 'سعر الخصم لا يمكن أن يكون سالباً'],
      default: null,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: 'لا يمكن إضافة أكثر من 10 صور للمنتج',
      },
    },
    category: {
      type: String,
      trim: true,
      default: null,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'المخزون لا يمكن أن يكون سالباً'],
    },
    // Track if unlimited stock (no inventory tracking)
    unlimitedStock: {
      type: Boolean,
      default: false,
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
    isBundle: {
      type: Boolean,
      default: false,
    },
    bundleComponents: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'الكمية يجب أن تكون 1 على الأقل'],
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    // Product weight in grams (for shipping)
    weight: {
      type: Number,
      default: null,
    },
    // SKU (stock keeping unit)
    sku: {
      type: String,
      trim: true,
      default: null,
    },
    // Who created / last updated this product (for audit trail)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      default: null,
    },
    // Brand name
    brand: {
      type: String,
      trim: true,
      default: null,
    },
    // Barcode (UPC / EAN)
    barcode: {
      type: String,
      trim: true,
      default: null,
    },
    // Whether product is featured / highlighted
    isFeatured: {
      type: Boolean,
      default: false,
    },
    digitalDelivery: {
      enabled: { type: Boolean, default: false },
      type: {
        type: String,
        enum: ['file', 'url', 'code'],
        default: 'url',
      },
      fileUrl: { type: String, trim: true, default: null },
      externalUrl: { type: String, trim: true, default: null },
      instructions: { type: String, trim: true, maxlength: 1000, default: null },
      serialCodes: [
        {
          code: { type: String, required: true, trim: true },
          isClaimed: { type: Boolean, default: false },
          claimedAt: { type: Date, default: null },
          order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ────────────────────────────────────────────────────────────────
productSchema.virtual('effectivePrice').get(function () {
  return this.salePrice && this.salePrice < this.price
    ? this.salePrice
    : this.price;
});

// ─── Indexes ────────────────────────────────────────────────────────────────
productSchema.index({ store: 1, isDeleted: 1 });
productSchema.index({ isDeleted: 1, deletedAt: 1 });
productSchema.index({ merchant: 1 });
productSchema.index({ name: 'text', description: 'text' }); // Full-text search
productSchema.index({ store: 1, 'digitalDelivery.enabled': 1 });

module.exports = mongoose.model('Product', productSchema);
