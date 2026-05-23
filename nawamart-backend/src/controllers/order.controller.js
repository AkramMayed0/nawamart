const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const { apiResponse, asyncHandler, getPaginationParams, paginateResponse } = require('../utils/helpers');

/**
 * POST /api/orders
 * Create a new order (Customer only)
 */
const createOrder = asyncHandler(async (req, res) => {
  const { storeId, items, deliveryAddress, contactPhone, paymentMethod, paymentWasl } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'السلة فارغة',
      data: null,
    });
  }

  const store = await Store.findById(storeId);
  if (!store || !store.isActive) {
    return res.status(404).json({
      success: false,
      message: 'المتجر غير متاح',
      data: null,
    });
  }

  let totalAmount = 0;
  const processedItems = [];

  // Fetch products, calculate totals, and check stock
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || product.isDeleted || !product.isActive) {
      return res.status(400).json({
        success: false,
        message: `المنتج غير متاح: ${product ? product.name : item.product}`,
        data: null,
      });
    }

    if (product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `الكمية المطلوبة غير متوفرة للمنتج: ${product.name}`,
        data: null,
      });
    }

    const price = product.salePrice || product.price;
    totalAmount += price * item.quantity;

    processedItems.push({
      product: product._id,
      name: product.name,
      price: price,
      quantity: item.quantity,
    });

    // Decrease stock
    product.stock -= item.quantity;
    if (product.stock === 0) {
      product.isActive = false;
    }
    await product.save();
  }

  const order = await Order.create({
    customer: req.user._id,
    merchant: store.merchant,
    store: store._id,
    items: processedItems,
    totalAmount,
    deliveryAddress,
    contactPhone,
    paymentMethod,
    paymentWasl,
    status: paymentMethod === 'cash' ? 'pending' : 'payment_under_review',
  });

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء الطلب بنجاح',
    data: order,
  });
});

/**
 * GET /api/orders/merchant
 * Get all orders for the logged-in merchant
 */
const getMerchantOrders = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPaginationParams(req);
  const { status, storeId } = req.query;

  const query = { merchant: req.user._id };
  if (status) query.status = status;
  if (storeId) query.store = storeId;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('customer', 'name phone')
      .populate('store', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    message: 'تم جلب الطلبات بنجاح',
    data: orders,
    pagination: paginateResponse(total, page, limit),
  });
});

/**
 * PUT /api/orders/:id/confirm
 * Confirm an order (Merchant only)
 */
const confirmOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, merchant: req.user._id });

  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  // Can only confirm if pending or payment_under_review
  if (order.status !== 'pending' && order.status !== 'payment_under_review') {
    return res.status(400).json({ success: false, message: `لا يمكن تأكيد الطلب وحالته: ${order.status}`, data: null });
  }

  order.status = 'confirmed';
  await order.save();

  return apiResponse(res, { message: 'تم تأكيد الطلب', data: order });
});

/**
 * PUT /api/orders/:id/reject
 * Reject an order (Merchant only)
 */
const rejectOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, merchant: req.user._id });

  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
      $set: { isActive: true }
    });
  }

  order.status = 'rejected';
  await order.save();

  return apiResponse(res, { message: 'تم رفض الطلب واستعادة الكميات المخزونة', data: order });
});

/**
 * PUT /api/orders/:id/ship
 * Mark an order as shipped (Merchant only)
 */
const shipOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, merchant: req.user._id });

  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  if (order.status !== 'confirmed') {
    return res.status(400).json({ success: false, message: `لا يمكن شحن الطلب وحالته: ${order.status}`, data: null });
  }

  order.status = 'shipped';
  await order.save();

  return apiResponse(res, { message: 'تم شحن الطلب', data: order });
});

/**
 * PUT /api/orders/:id/deliver
 * Mark an order as delivered (Merchant only)
 */
const deliverOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, merchant: req.user._id });

  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  if (order.status !== 'shipped') {
    return res.status(400).json({ success: false, message: `لا يمكن تسليم الطلب وحالته: ${order.status}`, data: null });
  }

  order.status = 'delivered';
  await order.save();

  return apiResponse(res, { message: 'تم تسليم الطلب بنجاح', data: order });
});

module.exports = {
  createOrder,
  getMerchantOrders,
  confirmOrder,
  rejectOrder,
  shipOrder,
  deliverOrder,
};
