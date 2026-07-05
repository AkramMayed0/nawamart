const Courier = require('../models/Courier');
const DeliveryDispatch = require('../models/DeliveryDispatch');
const Order = require('../models/Order');
const { apiResponse, asyncHandler, getPaginationParams, paginateResponse } = require('../utils/helpers');

function buildLightweightMapUrl(dropoff = {}) {
  if (dropoff.lat != null && dropoff.lng != null) {
    return `https://www.google.com/maps?q=${encodeURIComponent(`${dropoff.lat},${dropoff.lng}`)}`;
  }
  if (dropoff.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dropoff.address)}`;
  }
  return null;
}

const listCouriers = asyncHandler(async (req, res) => {
  const store = req.featureStore;
  const couriers = await Courier.find({ store: store._id }).sort({ createdAt: -1 });
  return apiResponse(res, { message: 'تم جلب قائمة المندوبين', data: couriers });
});

const createCourier = asyncHandler(async (req, res) => {
  const store = req.featureStore;
  const { name, phone, vehicleType, notes } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, data: null, message: 'الاسم ورقم الهاتف مطلوبان' });
  }

  const courier = await Courier.create({
    store: store._id,
    merchant: req.user._id,
    name,
    phone,
    vehicleType: vehicleType || 'motorbike',
    notes: notes || null,
  });

  return apiResponse(res, { statusCode: 201, message: 'تم إضافة المندوب بنجاح', data: courier });
});

const assignDispatch = asyncHandler(async (req, res) => {
  const store = req.featureStore;
  const { orderId, courierId, pickup, dropoff, notes } = req.body;

  if (!orderId || !courierId) {
    return res.status(400).json({ success: false, data: null, message: 'معرّف الطلب والمندوب مطلوبان' });
  }

  const [order, courier] = await Promise.all([
    Order.findOne({ _id: orderId, store: store._id, merchant: req.user._id }),
    Courier.findOne({ _id: courierId, store: store._id, merchant: req.user._id, isActive: true }),
  ]);

  if (!order || !courier) {
    return res.status(404).json({ success: false, data: null, message: 'الطلب أو المندوب غير موجود' });
  }

  const dispatch = await DeliveryDispatch.create({
    store: store._id,
    merchant: req.user._id,
    order: order._id,
    courier: courier._id,
    pickup: pickup || {},
    dropoff: dropoff || {
      label: order.deliveryAddress?.name,
      address: [order.deliveryAddress?.city, order.deliveryAddress?.district, order.deliveryAddress?.details]
        .filter(Boolean)
        .join(', '),
      lat: order.deliveryAddress?.location?.lat ?? null,
      lng: order.deliveryAddress?.location?.lng ?? null,
    },
    lightweightMapUrl: buildLightweightMapUrl(dropoff || order.deliveryAddress?.location || {}),
    notes: notes || null,
  });

  courier.currentStatus = 'busy';
  await courier.save();

  return apiResponse(res, { statusCode: 201, message: 'تم تعيين المندوب للطلب', data: dispatch });
});

const listDispatches = asyncHandler(async (req, res) => {
  const store = req.featureStore;
  const { limit, skip, page } = getPaginationParams(req);

  const [items, total] = await Promise.all([
    DeliveryDispatch.find({ store: store._id })
      .populate('courier', 'name phone vehicleType currentStatus')
      .populate('order', 'status totalAmount deliveryAddress')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    DeliveryDispatch.countDocuments({ store: store._id }),
  ]);

  return apiResponse(res, {
    message: 'تم جلب قائمة التوصيلات',
    data: items,
    pagination: paginateResponse(total, page, limit),
  });
});

// ─── Courier Pool (Merchant side) ──────────────────────────────────────────

const sendToPool = asyncHandler(async (req, res) => {
  const store = req.featureStore;
  const { orderId } = req.body;

  if (!orderId) return res.status(400).json({ success: false, message: 'معرّف الطلب مطلوب', data: null });

  const order = await Order.findOne({ _id: orderId, store: store._id, merchant: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });

  if (order.inCourierPool) {
    return res.status(400).json({ success: false, message: 'الطلب موجود بالفعل في قائمة المندوبين', data: null });
  }

  const existingDispatch = await DeliveryDispatch.findOne({ order: order._id, status: { $ne: 'cancelled' } });
  if (existingDispatch) {
    return res.status(400).json({ success: false, message: 'تم تعيين مندوب لهذا الطلب مسبقاً', data: null });
  }

  order.inCourierPool = true;
  await order.save();

  return apiResponse(res, { message: 'تم إضافة الطلب لقائمة المندوبين', data: order });
});

// ─── Courier Portal (Courier side - Unauthenticated / Magic Link) ──────────

const getPortalAvailable = asyncHandler(async (req, res) => {
  const { courierId } = req.params;
  const courier = await Courier.findById(courierId);
  if (!courier || !courier.isActive) {
    return res.status(404).json({ success: false, message: 'المندوب غير موجود أو غير مفعل', data: null });
  }

  const orders = await Order.find({ store: courier.store, inCourierPool: true, status: { $in: ['confirmed', 'shipped'] } })
    .select('deliveryAddress totalAmount paymentMethod createdAt status');

  return apiResponse(res, { message: 'تم جلب الطلبات المتاحة', data: orders });
});

const acceptFromPool = asyncHandler(async (req, res) => {
  const { courierId } = req.params;
  const { orderId } = req.body;

  const courier = await Courier.findById(courierId);
  if (!courier || !courier.isActive) {
    return res.status(404).json({ success: false, message: 'المندوب غير موجود أو غير مفعل', data: null });
  }

  const order = await Order.findOne({ _id: orderId, store: courier.store, inCourierPool: true });
  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب لم يعد متاحاً في القائمة', data: null });
  }

  order.inCourierPool = false;
  await order.save();

  const dispatch = await DeliveryDispatch.create({
    store: courier.store,
    merchant: courier.merchant,
    order: order._id,
    courier: courier._id,
    pickup: {},
    dropoff: {
      label: order.deliveryAddress?.name,
      address: [order.deliveryAddress?.city, order.deliveryAddress?.district, order.deliveryAddress?.details]
        .filter(Boolean)
        .join(', '),
      lat: order.deliveryAddress?.location?.lat ?? null,
      lng: order.deliveryAddress?.location?.lng ?? null,
    },
    lightweightMapUrl: buildLightweightMapUrl(order.deliveryAddress?.location || {}),
    notes: 'قبله المندوب من القائمة',
  });

  courier.currentStatus = 'busy';
  await courier.save();

  return apiResponse(res, { statusCode: 201, message: 'تم قبول الطلب بنجاح', data: dispatch });
});

const getPortalTasks = asyncHandler(async (req, res) => {
  const { courierId } = req.params;
  const courier = await Courier.findById(courierId);
  if (!courier || !courier.isActive) {
    return res.status(404).json({ success: false, message: 'المندوب غير موجود أو غير مفعل', data: null });
  }

  const dispatches = await DeliveryDispatch.find({
    courier: courier._id,
    status: { $nin: ['delivered', 'cancelled'] }
  })
    .populate('order', 'totalAmount paymentMethod paymentConfirmed')
    .sort({ createdAt: -1 });

  return apiResponse(res, { message: 'تم جلب المهام', data: dispatches });
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const { courierId, dispatchId } = req.params;
  const { status } = req.body;

  if (!['picked_up', 'delivered'].includes(status)) {
    return res.status(400).json({ success: false, message: 'حالة التحديث غير صالحة', data: null });
  }

  const dispatch = await DeliveryDispatch.findOne({ _id: dispatchId, courier: courierId });
  if (!dispatch) return res.status(404).json({ success: false, message: 'التوصيلة غير موجودة', data: null });

  dispatch.status = status;
  await dispatch.save();

  if (status === 'delivered') {
    const order = await Order.findById(dispatch.order);
    if (order && order.status !== 'delivered') {
      order.status = 'delivered';
      order.deliveredAt = new Date();
      await order.save();
    }

    const activeTasks = await DeliveryDispatch.countDocuments({ courier: courierId, status: { $in: ['assigned', 'picked_up'] } });
    if (activeTasks === 0) {
      await Courier.findByIdAndUpdate(courierId, { currentStatus: 'available' });
    }
  }

  return apiResponse(res, { message: 'تم تحديث حالة المهمة', data: dispatch });
});

module.exports = {
  listCouriers,
  createCourier,
  assignDispatch,
  listDispatches,
  sendToPool,
  getPortalAvailable,
  acceptFromPool,
  getPortalTasks,
  updateTaskStatus,
};
