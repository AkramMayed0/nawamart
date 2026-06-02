const Order   = require('../models/Order');
const Product = require('../models/Product');
const Store   = require('../models/Store');
const Chat    = require('../models/Chat');
const {
  apiResponse,
  asyncHandler,
  getPaginationParams,
  paginateResponse,
} = require('../utils/helpers');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders
// Create a new order (Customer only)
// ─────────────────────────────────────────────────────────────────────────────
const createOrder = asyncHandler(async (req, res) => {
  const { storeId, items, deliveryAddress, contactPhone, paymentMethod, paymentWasl, notes, contactMethod, contactHandle } = req.body;

  if (!storeId) {
    return res.status(400).json({ success: false, message: 'معرّف المتجر مطلوب', data: null });
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'السلة فارغة', data: null });
  }

  if (!deliveryAddress?.name || !deliveryAddress?.city || !deliveryAddress?.phone) {
    return res.status(400).json({ success: false, message: 'اسم العميل والمدينة ورقم الهاتف مطلوبة', data: null });
  }

  const store = await Store.findById(storeId);
  if (!store || !store.isActive) {
    return res.status(404).json({ success: false, message: 'المتجر غير متاح', data: null });
  }

  // Tenant validation: if customer is store-scoped, verify they belong to this store
  if (req.user.store && req.user.store.toString() !== storeId) {
    return res.status(403).json({
      success: false,
      data: null,
      message: 'لا يمكنك الطلب من هذا المتجر — الحساب مسجل في متجر آخر',
    });
  }

  // Calculate shipping fee for physical stores based on delivery city
  let shippingFee = 0;
  if (store.type === 'physical' && deliveryAddress?.city) {
    const cityFee = store.shippingFees?.find(
      (sf) => sf.city === deliveryAddress.city
    );
    shippingFee = cityFee?.fee ?? 0;
  }

  let totalAmount = 0;
  const processedItems = [];

  // Fetch products, verify availability, snapshot prices
  for (const item of items) {
    if (!item.product || !item.quantity || item.quantity < 1) {
      return res.status(400).json({ success: false, message: 'بيانات المنتج غير صالحة', data: null });
    }

    const product = await Product.findById(item.product);
    if (!product || product.isDeleted || !product.isActive) {
      return res.status(400).json({
        success: false,
        message: `المنتج غير متاح: ${product?.name ?? item.product}`,
        data: null,
      });
    }

    if (!product.unlimitedStock && product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `الكمية المطلوبة غير متوفرة للمنتج: ${product.name}`,
        data: null,
      });
    }

    const unitPrice = product.salePrice ?? product.price;
    totalAmount += unitPrice * item.quantity;

    processedItems.push({
      product:  product._id,
      name:     product.name,
      price:    unitPrice,
      quantity: item.quantity,
      image:    product.images?.[0] ?? null,
    });

    // Deduct stock (skip if unlimited)
    if (!product.unlimitedStock) {
      product.stock -= item.quantity;
      if (product.stock === 0) product.isActive = false;
      await product.save();
    }
  }

  // Add shipping fee to total
  totalAmount += shippingFee;

  // Cash orders → pending; transfer orders → payment_under_review
  const initialStatus = paymentMethod === 'cash' ? 'pending' : 'payment_under_review';

  const order = await Order.create({
      customer: req.user._id,
    merchant: store.merchant,
    store:    store._id,
    items:    processedItems,
    totalAmount,
    shippingFee,
    deliveryAddress,
    paymentMethod,
    paymentWasl: paymentWasl ?? null,
    notes:       notes ?? null,
    status:      initialStatus,
    contactMethod: contactMethod || deliveryAddress?.contactMethod || 'whatsapp',
    contactHandle: contactHandle || deliveryAddress?.phone || null,
  });

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء الطلب بنجاح',
    data: order,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/merchant
// List orders for the logged-in merchant (paginated + filterable)
// ─────────────────────────────────────────────────────────────────────────────
const getMerchantOrders = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPaginationParams(req);
  const { status, storeId, date_from, date_to } = req.query;

  const query = { merchant: req.user._id };
  if (status)  query.status = status;
  if (storeId) query.store  = storeId;
  if (date_from || date_to) {
    query.createdAt = {};
    if (date_from) query.createdAt.$gte = new Date(date_from);
    if (date_to)   query.createdAt.$lte = new Date(date_to);
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('customer', 'name phone')
      .populate('store', 'name type plan')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  return apiResponse(res, {
    message: 'تم جلب الطلبات بنجاح',
    data: orders,
    pagination: paginateResponse(total, page, limit),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/customer
// List orders for the logged-in customer (with store info)
// ─────────────────────────────────────────────────────────────────────────────
const getCustomerOrders = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPaginationParams(req);

  const [orders, total] = await Promise.all([
    Order.find({ customer: req.user._id })
      .populate('store', 'name type logo slug plan')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments({ customer: req.user._id }),
  ]);

  return apiResponse(res, {
    message: 'تم جلب الطلبات بنجاح',
    data: orders,
    pagination: paginateResponse(total, page, limit),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/:id
// Get a single order by ID (public for tracking, full for owner)
// ─────────────────────────────────────────────────────────────────────────────
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('store', 'name logo contactPhone type slug plan')
    .populate('items.product', 'name images');

  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  if (!req.user) {
    return apiResponse(res, { message: 'تم جلب الطلب بنجاح', data: order });
  }

  const userId = req.user._id.toString();
  const isCustomer = req.userRole === 'customer' && order.customer?._id?.toString() === userId;
  const isMerchant = req.userRole === 'merchant' && order.merchant._id?.toString() === userId;

  if (!isCustomer && !isMerchant) {
    return res.status(403).json({ success: false, message: 'لا تملك صلاحية الوصول لهذا الطلب', data: null });
  }

  return apiResponse(res, { message: 'تم جلب الطلب بنجاح', data: order });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/orders/:id/confirm
// Merchant confirms the order
// ─────────────────────────────────────────────────────────────────────────────
const confirmOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, merchant: req.user._id });

  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  if (!['pending', 'payment_under_review'].includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: `لا يمكن تأكيد الطلب وحالته الحالية: ${order.status}`,
      data: null,
    });
  }

  order.status      = 'confirmed';
  order.confirmedAt = new Date();

  // Auto-create delivery chat only for business plan stores
  const store = await Store.findById(order.store).select('plan');
  if (order.customer && !order.chatId && store?.plan === 'business') {
    let chat = await Chat.findOne({ order: order._id });
    if (!chat) {
      chat = await Chat.create({
        store:    order.store,
        merchant: order.merchant,
        customer: order.customer,
        order:    order._id,
        messages: [],
      });
    }
    order.chatId = chat._id;
  }

  await order.save();

  return apiResponse(res, { message: 'تم تأكيد الطلب', data: order });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/orders/:id/reject
// Merchant rejects the order and restores stock
// ─────────────────────────────────────────────────────────────────────────────
const rejectOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, merchant: req.user._id });

  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  if (['shipped', 'delivered', 'rejected'].includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: `لا يمكن رفض الطلب وحالته الحالية: ${order.status}`,
      data: null,
    });
  }

  // Restore stock for all items
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
      $set: { isActive: true },
    });
  }

  order.status          = 'rejected';
  order.rejectedAt      = new Date();
  order.rejectionReason = req.body.reason ?? null;
  await order.save();

  return apiResponse(res, { message: 'تم رفض الطلب واستعادة الكميات', data: order });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/orders/:id/ship
// Merchant marks order as shipped
// ─────────────────────────────────────────────────────────────────────────────
const shipOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, merchant: req.user._id });

  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  if (order.status !== 'confirmed') {
    return res.status(400).json({
      success: false,
      message: `لا يمكن شحن الطلب وحالته الحالية: ${order.status}`,
      data: null,
    });
  }

  order.status    = 'shipped';
  order.shippedAt = new Date();
  await order.save();

  return apiResponse(res, { message: 'تم شحن الطلب', data: order });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/orders/:id/deliver
// Merchant marks order as delivered
// ─────────────────────────────────────────────────────────────────────────────
const deliverOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, merchant: req.user._id });

  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  if (order.status !== 'shipped') {
    return res.status(400).json({
      success: false,
      message: `لا يمكن تسليم الطلب وحالته الحالية: ${order.status}`,
      data: null,
    });
  }

  order.status      = 'delivered';
  order.deliveredAt = new Date();
  await order.save();

  return apiResponse(res, { message: 'تم تسليم الطلب بنجاح', data: order });
});

module.exports = {
  createOrder,
  getCustomerOrders,
  getMerchantOrders,
  getOrderById,
  confirmOrder,
  rejectOrder,
  shipOrder,
  deliverOrder,
};
