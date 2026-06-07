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
  return apiResponse(res, { message: 'Couriers loaded', data: couriers });
});

const createCourier = asyncHandler(async (req, res) => {
  const store = req.featureStore;
  const { name, phone, vehicleType, notes } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, data: null, message: 'name and phone are required' });
  }

  const courier = await Courier.create({
    store: store._id,
    merchant: req.user._id,
    name,
    phone,
    vehicleType: vehicleType || 'motorbike',
    notes: notes || null,
  });

  return apiResponse(res, { statusCode: 201, message: 'Courier created', data: courier });
});

const assignDispatch = asyncHandler(async (req, res) => {
  const store = req.featureStore;
  const { orderId, courierId, pickup, dropoff, notes } = req.body;

  if (!orderId || !courierId) {
    return res.status(400).json({ success: false, data: null, message: 'orderId and courierId are required' });
  }

  const [order, courier] = await Promise.all([
    Order.findOne({ _id: orderId, store: store._id, merchant: req.user._id }),
    Courier.findOne({ _id: courierId, store: store._id, merchant: req.user._id, isActive: true }),
  ]);

  if (!order || !courier) {
    return res.status(404).json({ success: false, data: null, message: 'Order or courier not found' });
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

  return apiResponse(res, { statusCode: 201, message: 'Dispatch assigned', data: dispatch });
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
    message: 'Dispatches loaded',
    data: items,
    pagination: paginateResponse(total, page, limit),
  });
});

// ─── Courier Pool (Merchant side) ──────────────────────────────────────────

const sendToPool = asyncHandler(async (req, res) => {
  const store = req.featureStore;
  const { orderId } = req.body;

  if (!orderId) return res.status(400).json({ success: false, message: 'orderId is required', data: null });

  const order = await Order.findOne({ _id: orderId, store: store._id, merchant: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found', data: null });

  if (order.inCourierPool) {
    return res.status(400).json({ success: false, message: 'Order is already in the pool', data: null });
  }

  // Check if it's already dispatched
  const existingDispatch = await DeliveryDispatch.findOne({ order: order._id, status: { $ne: 'cancelled' } });
  if (existingDispatch) {
    return res.status(400).json({ success: false, message: 'Order is already dispatched', data: null });
  }

  order.inCourierPool = true;
  await order.save();

  return apiResponse(res, { message: 'Order added to courier pool', data: order });
});

// ─── Courier Portal (Courier side - Unauthenticated / Magic Link) ──────────

const getPortalAvailable = asyncHandler(async (req, res) => {
  const { courierId } = req.params;
  const courier = await Courier.findById(courierId);
  if (!courier || !courier.isActive) {
    return res.status(404).json({ success: false, message: 'Courier not found or inactive', data: null });
  }

  const orders = await Order.find({ store: courier.store, inCourierPool: true, status: { $in: ['confirmed', 'shipped'] } })
    .select('deliveryAddress totalAmount paymentMethod createdAt status');

  return apiResponse(res, { message: 'Available requests loaded', data: orders });
});

const acceptFromPool = asyncHandler(async (req, res) => {
  const { courierId } = req.params;
  const { orderId } = req.body;

  const courier = await Courier.findById(courierId);
  if (!courier || !courier.isActive) {
    return res.status(404).json({ success: false, message: 'Courier not found or inactive', data: null });
  }

  const order = await Order.findOne({ _id: orderId, store: courier.store, inCourierPool: true });
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order no longer available in the pool', data: null });
  }

  // Assign to courier
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
    notes: 'Accepted from pool',
  });

  courier.currentStatus = 'busy';
  await courier.save();

  return apiResponse(res, { statusCode: 201, message: 'Order accepted successfully', data: dispatch });
});

const getPortalTasks = asyncHandler(async (req, res) => {
  const { courierId } = req.params;
  const courier = await Courier.findById(courierId);
  if (!courier || !courier.isActive) {
    return res.status(404).json({ success: false, message: 'Courier not found or inactive', data: null });
  }

  const dispatches = await DeliveryDispatch.find({ courier: courier._id })
    .populate('order', 'totalAmount paymentMethod paymentConfirmed')
    .sort({ createdAt: -1 });

  return apiResponse(res, { message: 'Tasks loaded', data: dispatches });
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const { courierId, dispatchId } = req.params;
  const { status } = req.body;

  if (!['picked_up', 'delivered'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status update', data: null });
  }

  const dispatch = await DeliveryDispatch.findOne({ _id: dispatchId, courier: courierId });
  if (!dispatch) return res.status(404).json({ success: false, message: 'Dispatch not found', data: null });

  dispatch.status = status;
  await dispatch.save();

  // If delivered, mark order as delivered too
  if (status === 'delivered') {
    const order = await Order.findById(dispatch.order);
    if (order && order.status !== 'delivered') {
      order.status = 'delivered';
      order.deliveredAt = new Date();
      await order.save();
    }
    
    // Free up courier if no other active tasks
    const activeTasks = await DeliveryDispatch.countDocuments({ courier: courierId, status: { $in: ['assigned', 'picked_up'] } });
    if (activeTasks === 0) {
      await Courier.findByIdAndUpdate(courierId, { currentStatus: 'available' });
    }
  }

  return apiResponse(res, { message: 'Task status updated', data: dispatch });
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
