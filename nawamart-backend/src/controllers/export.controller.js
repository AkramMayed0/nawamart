const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Store = require('../models/Store');
const { apiResponse, asyncHandler } = require('../utils/helpers');
const { logActivity } = require('../services/audit');

function csvEscape(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function toCsv(rows, headers) {
  const lines = [headers.map(h => csvEscape(h.label)).join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => csvEscape(h.get(row))).join(','));
  }
  return lines.join('\r\n');
}

const exportProducts = asyncHandler(async (req, res) => {
  const { storeId } = req.query;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) return res.status(403).json({ success: false, message: 'المتجر غير موجود', data: null });

  const products = await Product.find({ store: storeId, isDeleted: false }).sort({ createdAt: -1 }).lean();

  const headers = [
    { label: 'الاسم', get: (p) => p.name },
    { label: 'السعر', get: (p) => p.price },
    { label: 'سعر الخصم', get: (p) => p.salePrice ?? '' },
    { label: 'المخزون', get: (p) => p.unlimitedStock ? 'غير محدود' : p.stock },
    { label: 'التصنيف', get: (p) => p.category ?? '' },
    { label: 'SKU', get: (p) => p.sku ?? '' },
    { label: 'العلامة التجارية', get: (p) => p.brand ?? '' },
    { label: 'الرمز الشريطي', get: (p) => p.barcode ?? '' },
    { label: 'الوزن', get: (p) => p.weight ?? '' },
    { label: 'مميز', get: (p) => p.isFeatured ? 'نعم' : 'لا' },
    { label: 'نشط', get: (p) => p.isActive ? 'نعم' : 'لا' },
    { label: 'تاريخ الإنشاء', get: (p) => new Date(p.createdAt).toISOString() },
  ];

  const csv = toCsv(products, headers);

  await logActivity(req, {
    action: 'export.products',
    resourceType: 'product',
    resourceId: storeId,
    resourceName: store.name,
    details: `تم تصدير ${products.length} منتج`,
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="products-${store.slug || store._id}.csv"`);
  res.send('\uFEFF' + csv);
});

const exportOrders = asyncHandler(async (req, res) => {
  const { status, storeId, date_from, date_to } = req.query;
  const query = { merchant: req.user._id };
  if (status) query.status = status;
  if (storeId) query.store = storeId;
  if (date_from || date_to) {
    query.createdAt = {};
    if (date_from) query.createdAt.$gte = new Date(date_from);
    if (date_to) query.createdAt.$lte = new Date(date_to);
  }

  const orders = await Order.find(query).populate('customer', 'name phone email').sort({ createdAt: -1 }).lean();

  const statusMap = {
    pending: 'بانتظار المراجعة', payment_under_review: 'الوصل قيد المراجعة',
    confirmed: 'مؤكد', shipped: 'تم الشحن', delivered: 'تم التسليم', rejected: 'مرفوض',
  };

  const headers = [
    { label: 'رقم الطلب', get: (o) => String(o._id).slice(-8).toUpperCase() },
    { label: 'اسم العميل', get: (o) => o.deliveryAddress?.name ?? o.customer?.name ?? '' },
    { label: 'رقم العميل', get: (o) => o.deliveryAddress?.phone ?? o.customer?.phone ?? '' },
    { label: 'المدينة', get: (o) => o.deliveryAddress?.city ?? '' },
    { label: 'المبلغ', get: (o) => o.totalAmount },
    { label: 'رسوم الشحن', get: (o) => o.shippingFee ?? 0 },
    { label: 'طريقة الدفع', get: (o) => o.paymentMethod === 'cash' ? 'كاش' : o.paymentMethod ?? '' },
    { label: 'الحالة', get: (o) => statusMap[o.status] || o.status },
    { label: 'تاريخ الطلب', get: (o) => new Date(o.createdAt).toISOString() },
    { label: 'تاريخ التأكيد', get: (o) => o.confirmedAt ? new Date(o.confirmedAt).toISOString() : '' },
    { label: 'تاريخ التسليم', get: (o) => o.deliveredAt ? new Date(o.deliveredAt).toISOString() : '' },
  ];

  const csv = toCsv(orders, headers);

  await logActivity(req, {
    action: 'export.orders',
    resourceType: 'order',
    resourceId: storeId || req.user._id,
    resourceName: 'طلبات',
    details: `تم تصدير ${orders.length} طلب`,
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="orders-${Date.now()}.csv"`);
  res.send('\uFEFF' + csv);
});

const exportCustomers = asyncHandler(async (req, res) => {
  const { storeId } = req.query;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) return res.status(403).json({ success: false, message: 'المتجر غير موجود', data: null });

  const customers = await Customer.find({ store: storeId }).sort({ createdAt: -1 }).lean();

  const headers = [
    { label: 'الاسم', get: (c) => c.name },
    { label: 'البريد الإلكتروني', get: (c) => c.email ?? '' },
    { label: 'رقم الهاتف', get: (c) => c.phone ?? '' },
    { label: 'المدينة', get: (c) => c.address?.city ?? '' },
    { label: 'تاريخ التسجيل', get: (c) => new Date(c.createdAt).toISOString() },
    { label: 'نشط', get: (c) => c.isActive ? 'نعم' : 'لا' },
  ];

  const csv = toCsv(customers, headers);

  await logActivity(req, {
    action: 'export.customers',
    resourceType: 'customer',
    resourceId: storeId,
    resourceName: store.name,
    details: `تم تصدير ${customers.length} عميل`,
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="customers-${store.slug || store._id}.csv"`);
  res.send('\uFEFF' + csv);
});

module.exports = { exportProducts, exportOrders, exportCustomers };
