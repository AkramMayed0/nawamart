const Order   = require('../models/Order');
const Product = require('../models/Product');
const Store   = require('../models/Store');
const Chat    = require('../models/Chat');
const { deliverOrderDigitalItems } = require('../services/DigitalDeliveryService');
const InventoryService = require('../services/InventoryService');
const OrderService     = require('../services/OrderService');
const {
  apiResponse,
  asyncHandler,
  getPaginationParams,
  paginateResponse,
} = require('../utils/helpers');
const { logActivity } = require('../services/audit');
const { fire } = require('../services/webhookService');

function matchesId(value, expected) {
  if (!value || !expected) return false;
  const id = value._id ? value._id : value;
  return id.toString() === expected.toString();
}

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
    const quantity = Number(item.quantity);
    if (!item.product || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
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

    if (product.store.toString() !== storeId) {
      return res.status(400).json({
        success: false,
        message: `المنتج "${product.name}" لا ينتمي إلى هذا المتجر`,
        data: null,
      });
    }

    const inventoryItem = await InventoryService.getOrCreateItem(product, storeId, store.merchant);

    if (!product.unlimitedStock && inventoryItem.trackQuantity && inventoryItem.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `الكمية المطلوبة غير متوفرة للمنتج: ${product.name}`,
        data: null,
      });
    }

    const unitPrice = product.salePrice ?? product.price;
    totalAmount += unitPrice * quantity;

    processedItems.push({
      product:  product._id,
      name:     product.name,
      price:    unitPrice,
      quantity,
      image:    product.images?.[0] ?? null,
    });

    // Deduct stock via InventoryService (handles bundles & components)
    if (!product.unlimitedStock && inventoryItem.trackQuantity) {
      await InventoryService.deductStock({
        items: [{ product: product._id, quantity }],
        storeId,
        merchantId: store.merchant,
        performedBy: store.merchant,
      });
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
    digitalDelivery: {
      status: store.type === 'digital' ? 'pending' : 'not_applicable',
      items: [],
    },
    contactMethod: contactMethod || deliveryAddress?.contactMethod || 'whatsapp',
    contactHandle: contactHandle || deliveryAddress?.phone || null,
  });

  fire('order.created', order.toObject(), store._id, store.merchant);

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
  const { status, storeId, date_from, date_to, paymentMethod, search, sort } = req.query;
  const query = { merchant: req.user._id };
  if (status) {
    if (status === 'pending_group') query.status = { $in: ['pending', 'payment_under_review'] };
    else if (status === 'shipped_group') query.status = { $in: ['shipped', 'chat-open'] };
    else if (status === 'delivered_group') query.status = { $in: ['delivered', 'digital-delivered'] };
    else query.status = status;
  }
  if (storeId) query.store = storeId;
  if (paymentMethod) query.paymentMethod = paymentMethod;
  if (date_from || date_to) {
    query.createdAt = {};
    if (date_from) query.createdAt.$gte = new Date(date_from);
    if (date_to)   query.createdAt.$lte = new Date(date_to);
  }
  if (search) {
    query.$or = [
      { 'deliveryAddress.name': new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      { 'deliveryAddress.phone': new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
    ];
  }
  const sortOpt = sort === 'amount_asc' ? { totalAmount: 1 } : sort === 'amount_desc' ? { totalAmount: -1 } : { createdAt: -1 };
  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('customer', 'name phone')
      .populate('store', 'name type plan')
      .sort(sortOpt)
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
// Get a single order by ID (owner only)
// ─────────────────────────────────────────────────────────────────────────────
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('store', 'name logo contactPhone type slug plan')
    .populate('items.product', 'name images');

  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  if (!req.user) {
    return res.status(401).json({ success: false, message: 'المصادقة مطلوبة', data: null });
  }

  const userId = req.user._id.toString();
  const isCustomer = req.userRole === 'customer' && matchesId(order.customer, userId);
  const isMerchant = req.userRole === 'merchant' && matchesId(order.merchant, userId);

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
  order.confirmedBy = req.user._id;

  // Auto-create delivery chat only for business plan stores
  const store = await Store.findById(order.store).select('plan type');
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

  if (store?.type === 'digital') {
    await deliverOrderDigitalItems(order, store);
  }

  await order.save();

  await logActivity(req, {
    action: 'order.confirm',
    resourceType: 'order',
    resourceId: order._id,
    resourceName: `طلب #${order._id}`,
    details: `تم تأكيد الطلب بقيمة ${order.totalAmount} ريال`,
  });

  fire('order.confirmed', order.toObject(), order.store, order.merchant);

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

  // Restore stock via InventoryService (handles bundles & components)
  await InventoryService.restoreStock({
    items: order.items,
    storeId: order.store,
    merchantId: order.merchant,
    performedBy: req.user._id,
  });

  order.status          = 'rejected';
  order.rejectedAt      = new Date();
  order.rejectedBy      = req.user._id;
  order.rejectionReason = req.body.reason ?? null;
  await order.save();

  await logActivity(req, {
    action: 'order.reject',
    resourceType: 'order',
    resourceId: order._id,
    resourceName: `طلب #${order._id}`,
    details: `تم رفض الطلب${req.body.reason ? ': ' + req.body.reason : ''}`,
  });

  fire('order.rejected', order.toObject(), order.store, order.merchant);

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
  order.shippedBy = req.user._id;
  await order.save();

  await logActivity(req, {
    action: 'order.ship',
    resourceType: 'order',
    resourceId: order._id,
    resourceName: `طلب #${order._id}`,
    details: `تم شحن الطلب`,
  });

  fire('order.shipped', order.toObject(), order.store, order.merchant);

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
  order.deliveredBy = req.user._id;
  await order.save();

  await logActivity(req, {
    action: 'order.deliver',
    resourceType: 'order',
    resourceId: order._id,
    resourceName: `طلب #${order._id}`,
    details: `تم تسليم الطلب`,
  });

  fire('order.delivered', order.toObject(), order.store, order.merchant);

  return apiResponse(res, { message: 'تم تسليم الطلب بنجاح', data: order });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/orders/:id/process
// Merchant marks order as processing (between confirmed and shipped)
// ─────────────────────────────────────────────────────────────────────────────
const processOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, merchant: req.user._id });
  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  try {
    const updated = await OrderService.processOrder(order, req.user._id);
    await logActivity(req, {
      action: 'order.process',
      resourceType: 'order',
      resourceId: order._id,
      resourceName: `طلب #${order._id}`,
      details: 'بدأت معالجة الطلب',
    });
    fire('order.processing', updated.toObject(), updated.store, updated.merchant);
    return apiResponse(res, { message: 'تم تحديث الحالة إلى قيد المعالجة', data: updated });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message, data: null });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/:id/cancel
// Merchant cancels order (before shipping) and restores stock
// ─────────────────────────────────────────────────────────────────────────────
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, merchant: req.user._id });
  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  try {
    const updated = await OrderService.cancelOrder(order, req.body.reason, req.user._id);
    await logActivity(req, {
      action: 'order.cancel',
      resourceType: 'order',
      resourceId: order._id,
      resourceName: `طلب #${order._id}`,
      details: `تم إلغاء الطلب${req.body.reason ? ': ' + req.body.reason : ''}`,
    });
    fire('order.cancelled', updated.toObject(), updated.store, updated.merchant);
    return apiResponse(res, { message: 'تم إلغاء الطلب واستعادة الكميات', data: updated });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message, data: null });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/:id/return
// Merchant marks order as returned (post-delivery) and restores stock
// ─────────────────────────────────────────────────────────────────────────────
const returnOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, merchant: req.user._id });
  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  try {
    const updated = await OrderService.returnOrder(order, req.body.reason, req.user._id);
    await logActivity(req, {
      action: 'order.return',
      resourceType: 'order',
      resourceId: order._id,
      resourceName: `طلب #${order._id}`,
      details: `تم إرجاع الطلب${req.body.reason ? ': ' + req.body.reason : ''}`,
    });
    fire('order.returned', updated.toObject(), updated.store, updated.merchant);
    return apiResponse(res, { message: 'تم إرجاع الطلب واستعادة الكميات', data: updated });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message, data: null });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/:id/fulfill
// Merchant creates a fulfillment (partial or full shipment)
// ─────────────────────────────────────────────────────────────────────────────
const fulfillOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, merchant: req.user._id });
  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  const { items, carrier, trackingNumber, trackingUrl, notes } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'يجب تحديد المنتجات المراد تنفيذها', data: null });
  }

  try {
    const result = await OrderService.fulfillOrder(order, {
      items, carrier, trackingNumber, trackingUrl, notes,
    }, req.user._id);

    await logActivity(req, {
      action: 'order.fulfill',
      resourceType: 'order',
      resourceId: order._id,
      resourceName: `طلب #${order._id}`,
      details: `تم تنفيذ ${items.reduce((s, i) => s + i.quantity, 0)} وحدة`,
    });

    fire('order.fulfilled', result.order.toObject(), result.order.store, result.order.merchant);

    return apiResponse(res, {
      message: 'تم تنفيذ الطلب بنجاح',
      data: { order: result.order, fulfillment: result.fulfillment },
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message, data: null });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/:id/fulfillments
// Get all fulfillments for an order
// ─────────────────────────────────────────────────────────────────────────────
const getFulfillments = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, merchant: req.user._id });
  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  const fulfillments = await OrderService.getFulfillments(order._id);
  return apiResponse(res, { message: 'تم جلب التوصيلات', data: fulfillments });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/:id/capture-payment
// Merchant confirms payment capture for non-cash orders
// ─────────────────────────────────────────────────────────────────────────────
const capturePayment = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, merchant: req.user._id });
  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  try {
    const updated = await OrderService.capturePayment(order, req.user._id);
    await logActivity(req, {
      action: 'order.capture_payment',
      resourceType: 'order',
      resourceId: order._id,
      resourceName: `طلب #${order._id}`,
      details: 'تم تأكيد الدفع',
    });
    return apiResponse(res, { message: 'تم تأكيد الدفع', data: updated });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message, data: null });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/:id/refund
// Merchant issues a refund
// ─────────────────────────────────────────────────────────────────────────────
const refundOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, merchant: req.user._id });
  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  try {
    await OrderService.refundOrder(order, req.body, req.user._id);
    await logActivity(req, {
      action: 'order.refund',
      resourceType: 'order',
      resourceId: order._id,
      resourceName: `طلب #${order._id}`,
      details: `تم استرداد ${req.body.amount || order.totalAmount} ريال`,
    });
    return apiResponse(res, { message: 'تم تسجيل الاسترداد', data: order });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message, data: null });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/:id/notes
// Add a note to an order
// ─────────────────────────────────────────────────────────────────────────────
const addOrderNote = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, merchant: req.user._id });
  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  const { content, isInternal, isCustomerVisible } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: 'محتوى الملاحظة مطلوب', data: null });
  }

  const note = await OrderService.addNote(order._id, {
    content,
    isInternal,
    isCustomerVisible,
    authorName: req.user.name || 'التاجر',
  }, req.user._id);

  return apiResponse(res, { message: 'تمت إضافة الملاحظة', data: note });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/:id/notes
// Get notes for an order
// ─────────────────────────────────────────────────────────────────────────────
const getOrderNotes = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, merchant: req.user._id });
  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  const includeInternal = req.query.includeInternal === 'true';
  const notes = await OrderService.getNotes(order._id, includeInternal);
  return apiResponse(res, { message: 'تم جلب الملاحظات', data: notes });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/orders/:id/edit
// Merchant edits order items/notes before fulfillment
// ─────────────────────────────────────────────────────────────────────────────
const editOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, merchant: req.user._id });
  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  if (['shipped', 'delivered', 'cancelled', 'returned'].includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: 'لا يمكن تعديل الطلب بعد الشحن',
      data: null,
    });
  }

  const { items, notes, deliveryAddress, shippingFee } = req.body;

  if (items) {
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'يجب إضافة منتج واحد على الأقل', data: null });
    }
    order.items = items;
    order.totalAmount = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0) + (shippingFee || order.shippingFee || 0);
  }

  if (notes !== undefined) order.notes = notes;
  if (deliveryAddress) order.deliveryAddress = { ...order.deliveryAddress.toObject(), ...deliveryAddress };
  if (shippingFee !== undefined) {
    order.shippingFee = shippingFee;
    if (items) {
      order.totalAmount = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0) + shippingFee;
    }
  }

  await order.save();

  await logActivity(req, {
    action: 'order.edit',
    resourceType: 'order',
    resourceId: order._id,
    resourceName: `طلب #${order._id}`,
    details: 'تم تعديل الطلب',
  });

  return apiResponse(res, { message: 'تم تعديل الطلب بنجاح', data: order });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/:id/packing-slip
// Generate packing slip for an order
// ─────────────────────────────────────────────────────────────────────────────
const generatePackingSlip = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, merchant: req.user._id });
  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  try {
    const slip = await OrderService.generatePackingSlip(order._id, req.user._id);
    return apiResponse(res, { message: 'تم إنشاء فاتورة التعبئة', data: slip });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message, data: null });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/bulk
// Bulk actions on multiple orders
// ─────────────────────────────────────────────────────────────────────────────
const bulkOrders = asyncHandler(async (req, res) => {
  const { orderIds, action, data } = req.body;

  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(400).json({ success: false, message: 'يجب تحديد الطلبات', data: null });
  }

  if (!action) {
    return res.status(400).json({ success: false, message: 'الإجراء مطلوب', data: null });
  }

  const results = await OrderService.bulkAction({
    orderIds,
    action,
    data,
    userId: req.user._id,
  });

  await logActivity(req, {
    action: `order.bulk_${action}`,
    resourceType: 'order',
    resourceId: null,
    resourceName: `${orderIds.length} طلب`,
    details: `إجراء جماعي: ${action}`,
  });

  return apiResponse(res, {
    message: `تم تنفيذ الإجراء على ${results.succeeded.length} طلب`,
    data: results,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/export
// Export orders as CSV data
// ─────────────────────────────────────────────────────────────────────────────
const exportOrders = asyncHandler(async (req, res) => {
  const data = await OrderService.exportOrders(req.query, req.user._id);
  return apiResponse(res, { message: 'تم تصدير الطلبات', data });
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
  processOrder,
  cancelOrder,
  returnOrder,
  fulfillOrder,
  getFulfillments,
  capturePayment,
  refundOrder,
  addOrderNote,
  getOrderNotes,
  editOrder,
  generatePackingSlip,
  bulkOrders,
  exportOrders,
};
