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

module.exports = {
  listCouriers,
  createCourier,
  assignDispatch,
  listDispatches,
};
