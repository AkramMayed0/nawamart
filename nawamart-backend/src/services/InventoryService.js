const InventoryItem = require('../models/InventoryItem');
const InventoryAdjustment = require('../models/InventoryAdjustment');
const InventoryLocation = require('../models/InventoryLocation');
const Product = require('../models/Product');

class InventoryService {
  /**
   * Get or create an inventory item for a product
   */
  static async getOrCreateItem(product, storeId, merchantId) {
    let item = await InventoryItem.findOne({ product: product._id });
    if (!item) {
      item = await InventoryItem.create({
        store: storeId,
        merchant: merchantId,
        product: product._id,
        trackQuantity: !product.unlimitedStock,
        quantity: product.stock || 0,
        inventoryState: product.stock > 0 ? 'in_stock' : 'out_of_stock',
        sku: product.sku || undefined,
        barcode: product.barcode || undefined,
      });
    }
    return item;
  }

  /**
   * Record an inventory adjustment with audit trail
   */
  static async recordAdjustment({
    store, merchant, product, location = null,
    type, quantity, previousQuantity, reason = null,
    notes = null, reference = null, performedBy,
  }) {
    const newQuantity = previousQuantity + quantity;
    return InventoryAdjustment.create({
      store,
      merchant,
      product,
      location,
      type,
      quantity,
      previousQuantity,
      newQuantity,
      reason,
      notes,
      reference,
      performedBy,
    });
  }

  /**
   * Deduct stock for order items (handles bundles and component deduction)
   */
  static async deductStock({ items, storeId, merchantId, orderId, performedBy }) {
    const adjustments = [];

    for (const item of items) {
      const productId = item.product?._id || item.product;
      const quantity = item.quantity;

      let inventoryItem = await InventoryItem.findOne({ product: productId });

      if (!inventoryItem) {
        const product = await Product.findById(productId);
        if (!product) continue;
        inventoryItem = await this.getOrCreateItem(product, storeId, merchantId);
      }

      if (!inventoryItem.trackQuantity) continue;

      const previousQuantity = inventoryItem.quantity;
      const deductQuantity = -Math.abs(quantity);
      const newQuantity = Math.max(0, previousQuantity + deductQuantity);

      inventoryItem.quantity = newQuantity;
      await inventoryItem.save();

      const adjustment = await this.recordAdjustment({
        store: storeId,
        merchant: merchantId,
        product: productId,
        type: 'order',
        quantity: deductQuantity,
        previousQuantity,
        reason: 'خصم بسبب طلب جديد',
        reference: { type: 'Order', id: orderId },
        performedBy,
      });
      adjustments.push(adjustment);

      if (inventoryItem.isBundle && inventoryItem.components?.length > 0) {
        for (const component of inventoryItem.components) {
          const compProductId = component.product;
          const compQty = component.quantity * quantity;

          let compItem = await InventoryItem.findOne({ product: compProductId });
          if (!compItem) {
            const compProduct = await Product.findById(compProductId);
            if (compProduct) {
              compItem = await this.getOrCreateItem(compProduct, storeId, merchantId);
            }
          }

          if (compItem && compItem.trackQuantity) {
            const compPrev = compItem.quantity;
            const compNew = Math.max(0, compPrev - compQty);
            compItem.quantity = compNew;
            await compItem.save();

            const compAdj = await this.recordAdjustment({
              store: storeId,
              merchant: merchantId,
              product: compProductId,
              type: 'bundle_deduction',
              quantity: -Math.abs(compQty),
              previousQuantity: compPrev,
              reason: `خصم تلقائي من مكونات الحزمة (المنتج الرئيسي: ${inventoryItem.product})`,
              reference: { type: 'Order', id: orderId },
              performedBy,
            });
            adjustments.push(compAdj);
          }
        }
      }
    }

    return adjustments;
  }

  /**
   * Restore stock when an order is rejected/cancelled
   */
  static async restoreStock({ items, storeId, merchantId, orderId, performedBy }) {
    const adjustments = [];

    for (const item of items) {
      const productId = item.product?._id || item.product;
      const quantity = item.quantity;

      let inventoryItem = await InventoryItem.findOne({ product: productId });
      if (!inventoryItem) continue;
      if (!inventoryItem.trackQuantity) continue;

      const previousQuantity = inventoryItem.quantity;
      inventoryItem.quantity = previousQuantity + Math.abs(quantity);
      await inventoryItem.save();

      const adjustment = await this.recordAdjustment({
        store: storeId,
        merchant: merchantId,
        product: productId,
        type: 'return',
        quantity: Math.abs(quantity),
        previousQuantity,
        reason: 'استعادة مخزون بسبب إلغاء الطلب',
        reference: { type: 'Order', id: orderId },
        performedBy,
      });
      adjustments.push(adjustment);

      if (inventoryItem.isBundle && inventoryItem.components?.length > 0) {
        for (const component of inventoryItem.components) {
          const compProductId = component.product;
          const compQty = component.quantity * quantity;

          let compItem = await InventoryItem.findOne({ product: compProductId });
          if (compItem && compItem.trackQuantity) {
            const compPrev = compItem.quantity;
            compItem.quantity = compPrev + compQty;
            await compItem.save();

            await this.recordAdjustment({
              store: storeId,
              merchant: merchantId,
              product: compProductId,
              type: 'return',
              quantity: compQty,
              previousQuantity: compPrev,
              reason: 'استعادة تلقائية لمكونات الحزمة بسبب إلغاء الطلب',
              reference: { type: 'Order', id: orderId },
              performedBy,
            });
          }
        }
      }
    }

    return adjustments;
  }

  /**
   * Manual inventory adjustment with reason
   */
  static async manualAdjustment({
    store, merchant, productId, location = null,
    quantity, reason = null, notes = null, performedBy,
  }) {
    let inventoryItem = await InventoryItem.findOne({ product: productId });
    if (!inventoryItem) {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('المنتج غير موجود');
      }
      inventoryItem = await this.getOrCreateItem(product, store, merchant);
    }

    if (!inventoryItem.trackQuantity) {
      throw new Error('المنتج لا يتتبع الكمية');
    }

    const previousQuantity = inventoryItem.quantity;
    inventoryItem.quantity = Math.max(0, previousQuantity + quantity);
    if (location) inventoryItem.location = location;
    await inventoryItem.save();

    const adjustment = await this.recordAdjustment({
      store,
      merchant,
      product: productId,
      location,
      type: 'manual',
      quantity,
      previousQuantity,
      reason,
      notes,
      performedBy,
    });

    await Product.findByIdAndUpdate(productId, { stock: inventoryItem.quantity });

    return { inventoryItem, adjustment };
  }

  /**
   * Transfer stock between locations
   */
  static async transferStock({
    store, merchant, productId,
    fromLocation, toLocation, quantity, reason = null, performedBy,
  }) {
    const fromItem = await InventoryItem.findOne({ product: productId, location: fromLocation });
    if (!fromItem || fromItem.quantity < quantity) {
      throw new Error('الكمية غير متوفرة في الموقع المصدر');
    }

    const fromPrev = fromItem.quantity;
    fromItem.quantity = fromPrev - quantity;
    await fromItem.save();

    await this.recordAdjustment({
      store, merchant, product: productId,
      location: fromLocation, type: 'transfer_out',
      quantity: -quantity, previousQuantity: fromPrev,
      reason: reason || 'تحويل إلى موقع آخر',
      performedBy,
    });

    let toItem = await InventoryItem.findOne({ product: productId, location: toLocation });
    if (!toItem) {
      const product = await Product.findById(productId);
      toItem = await InventoryItem.create({
        store, merchant, product: productId,
        trackQuantity: true, quantity: 0,
        location: toLocation, sku: product?.sku, barcode: product?.barcode,
      });
    }

    const toPrev = toItem.quantity;
    toItem.quantity = toPrev + quantity;
    await toItem.save();

    await this.recordAdjustment({
      store, merchant, product: productId,
      location: toLocation, type: 'transfer_in',
      quantity, previousQuantity: toPrev,
      reason: reason || 'استلام من موقع آخر',
      performedBy,
    });

    return { fromItem, toItem };
  }

  /**
   * Get low stock items for a store
   */
  static async getLowStockItems(storeId) {
    return InventoryItem.find({
      store: storeId,
      trackQuantity: true,
      isLowStock: true,
    })
      .populate('product', 'name price salePrice images sku')
      .populate('location', 'name')
      .sort({ quantity: 1 });
  }

  /**
   * Get inventory valuation report
   */
  static async getValuationReport(storeId) {
    const items = await InventoryItem.find({ store: storeId, trackQuantity: true })
      .populate('product', 'name price salePrice sku');

    let totalValue = 0;
    const details = items.map((item) => {
      const unitPrice = item.product?.salePrice || item.product?.price || 0;
      const lineValue = item.quantity * unitPrice;
      totalValue += lineValue;
      return {
        productId: item.product?._id,
        productName: item.product?.name || 'غير معروف',
        sku: item.sku || item.product?.sku,
        quantity: item.quantity,
        unitPrice,
        lineValue,
        inventoryState: item.inventoryState,
      };
    });

    return {
      totalValue,
      totalItems: items.length,
      totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
      details,
    };
  }

  /**
   * Get projected depletion report (items at risk of running out)
   */
  static async getProjectedDepletion(storeId) {
    const items = await InventoryItem.find({
      store: storeId,
      trackQuantity: true,
      quantity: { $gt: 0, $lte: 20 },
    })
      .populate('product', 'name price salePrice images sku')
      .populate('location', 'name')
      .sort({ quantity: 1 });

    return items.map((item) => ({
      _id: item._id,
      product: item.product,
      location: item.location,
      quantity: item.quantity,
      lowStockThreshold: item.lowStockThreshold,
      isLowStock: item.isLowStock,
      inventoryState: item.inventoryState,
      sku: item.sku,
    }));
  }

  /**
   * Get inventory history/audit trail for a store
   */
  static async getHistory(storeId, query = {}) {
    const filter = { store: storeId };
    if (query.productId) filter.product = query.productId;
    if (query.type) filter.type = query.type;
    if (query.date_from || query.date_to) {
      filter.createdAt = {};
      if (query.date_from) filter.createdAt.$gte = new Date(query.date_from);
      if (query.date_to) filter.createdAt.$lte = new Date(query.date_to);
    }

    return InventoryAdjustment.find(filter)
      .populate('product', 'name images sku')
      .populate('location', 'name')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  /**
   * Sync inventory item with product stock field
   */
  static async syncWithProduct(productId) {
    const inventoryItem = await InventoryItem.findOne({ product: productId });
    if (!inventoryItem) return null;

    await Product.findByIdAndUpdate(productId, { stock: inventoryItem.quantity });
    return inventoryItem;
  }
}

module.exports = InventoryService;
