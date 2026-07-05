const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Discount = require('../models/Discount');
const { apiResponse, asyncHandler } = require('../utils/helpers');

const globalSearch = asyncHandler(async (req, res) => {
  const { q, storeId } = req.query;
  if (!q || q.length < 2) {
    return res.status(400).json({ success: false, message: 'يرجى إدخال حرفين على الأقل للبحث', data: null });
  }

  const searchRegex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const storeQuery = { store: storeId, merchant: req.user._id };

  const [products, orders, customers, discounts] = await Promise.all([
    Product.find({ ...storeQuery, isDeleted: false })
      .or([{ name: searchRegex }, { sku: searchRegex }, { barcode: searchRegex }])
      .limit(8)
      .select('name price stock images isActive'),
    Order.find({ merchant: req.user._id })
      .or([
        { _id: mongoose.Types.ObjectId.isValid(q) ? q : undefined },
        { 'deliveryAddress.name': searchRegex },
        { 'deliveryAddress.phone': searchRegex },
      ].filter(Boolean))
      .limit(8)
      .select('status totalAmount createdAt deliveryAddress'),
    Customer.find({ store: storeId })
      .or([{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }])
      .limit(8)
      .select('name email phone'),
    Discount.find({ store: storeId })
      .or([{ code: searchRegex }])
      .limit(8)
      .select('code type value isActive expiresAt usedCount usageLimit'),
  ]);

  return apiResponse(res, {
    data: { products, orders, customers, discounts },
    message: 'نتائج البحث',
  });
});

module.exports = { globalSearch };
