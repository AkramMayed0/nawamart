const Product = require('../models/Product');
const { canUseFeature } = require('./FeatureService');

async function deliverOrderDigitalItems(order, store) {
  if (!order || !store || store.type !== 'digital') return order;

  if (!canUseFeature(store, 'digital_product_auto_delivery')) {
    order.digitalDelivery = {
      status: 'pending',
      items: [],
      error: 'Digital auto-delivery is not enabled for this plan/store type',
    };
    return order;
  }

  const deliveredItems = [];

  for (const item of order.items) {
    const product = await Product.findById(item.product);
    const config = product?.digitalDelivery;

    if (!product || !config?.enabled) {
      order.digitalDelivery = {
        status: 'failed',
        items: deliveredItems,
        error: `Missing digital delivery configuration for ${item.name}`,
      };
      return order;
    }

    const deliveryItem = {
      product: product._id,
      name: product.name,
      type: config.type,
      fileUrl: config.type === 'file' ? config.fileUrl : null,
      externalUrl: config.type === 'url' ? config.externalUrl : null,
      codes: [],
      instructions: config.instructions || null,
    };

    if (config.type === 'code') {
      const needed = Number(item.quantity) || 1;
      const available = config.serialCodes.filter((entry) => !entry.isClaimed).slice(0, needed);

      if (available.length < needed) {
        order.digitalDelivery = {
          status: 'failed',
          items: deliveredItems,
          error: `Not enough serial codes for ${product.name}`,
        };
        return order;
      }

      for (const entry of available) {
        entry.isClaimed = true;
        entry.claimedAt = new Date();
        entry.order = order._id;
        deliveryItem.codes.push(entry.code);
      }

      await product.save();
    }

    deliveredItems.push(deliveryItem);
  }

  order.digitalDelivery = {
    status: 'delivered',
    deliveredAt: new Date(),
    items: deliveredItems,
    error: null,
  };
  order.status = 'delivered';
  order.deliveredAt = new Date();
  return order;
}

module.exports = { deliverOrderDigitalItems };
