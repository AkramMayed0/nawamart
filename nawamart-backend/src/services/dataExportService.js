const Merchant = require('../models/Merchant');
const Customer = require('../models/Customer');
const Store = require('../models/Store');
const Order = require('../models/Order');
const Product = require('../models/Product');
const DataRequest = require('../models/DataRequest');
const path = require('path');
const fs = require('fs');

const EXPORT_DIR = path.join(__dirname, '../../exports');

if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

async function collectMerchantData(merchantId) {
  const merchant = await Merchant.findById(merchantId).select('-password -mfaSecret -mfaBackupCodes');
  if (!merchant) return null;

  const stores = await Store.find({ merchant: merchantId }).lean();
  const storeIds = stores.map((s) => s._id);

  const products = await Product.find({ merchant: merchantId, isDeleted: { $ne: true } }).lean();
  const orders = await Order.find({ merchant: merchantId }).lean();

  return {
    exportedAt: new Date().toISOString(),
    account: {
      name: merchant.name,
      email: merchant.email,
      phone: merchant.phone,
      createdAt: merchant.createdAt,
      isVerified: merchant.isVerified,
      authProvider: merchant.authProvider,
    },
    stores: stores.map((s) => ({
      name: s.name,
      slug: s.slug,
      type: s.type,
      plan: s.plan,
      createdAt: s.createdAt,
      totalProducts: s.totalProducts,
      totalOrders: s.totalOrders,
    })),
    productCount: products.length,
    products: products.map((p) => ({
      name: p.name,
      price: p.price,
      salePrice: p.salePrice,
      category: p.category,
      stock: p.stock,
      createdAt: p.createdAt,
    })),
    orderCount: orders.length,
    orders: orders.map((o) => ({
      id: o._id,
      totalAmount: o.totalAmount,
      status: o.status,
      paymentMethod: o.paymentMethod,
      items: o.items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
      createdAt: o.createdAt,
    })),
    consentHistory: await getConsentHistory(null, merchantId),
  };
}

async function collectCustomerData(customerId, storeId) {
  const customer = await Customer.findById(customerId).select('-password');
  if (!customer) return null;

  const orders = await Order.find({ customer: customerId, ...(storeId ? { store: storeId } : {}) }).lean();

  return {
    exportedAt: new Date().toISOString(),
    account: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      createdAt: customer.createdAt,
      authProvider: customer.authProvider,
    },
    orderCount: orders.length,
    orders: orders.map((o) => ({
      id: o._id,
      totalAmount: o.totalAmount,
      status: o.status,
      items: o.items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
      createdAt: o.createdAt,
    })),
    consentHistory: await getConsentHistory(customerId),
  };
}

async function getConsentHistory(customerId, merchantId) {
  const Consent = require('../models/Consent');
  const query = {};
  if (customerId) query.user = customerId;
  if (merchantId) query.user = merchantId;

  const consents = await Consent.find(query).sort({ consentDate: -1 }).lean();
  return consents.map((c) => ({
    type: c.type,
    granted: c.granted,
    date: c.consentDate,
    version: c.version,
  }));
}

async function generateExport(requestId) {
  const request = await DataRequest.findById(requestId);
  if (!request) throw new Error('Request not found');

  request.status = 'processing';
  await request.save();

  try {
    let data = null;

    if (request.requestedBy === 'merchant' && request.merchant) {
      data = await collectMerchantData(request.merchant);
    } else if (request.customer) {
      data = await collectCustomerData(request.customer, request.store);
    }

    if (!data) {
      request.status = 'rejected';
      request.rejectionReason = 'لم يتم العثور على البيانات';
      await request.save();
      return null;
    }

    const filename = `export-${request._id}-${Date.now()}.json`;
    const filepath = path.join(EXPORT_DIR, filename);

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');

    request.status = 'completed';
    request.dataPayload = data;
    request.exportUrl = `/exports/${filename}`;
    request.completedAt = new Date();
    request.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await request.save();

    return { url: request.exportUrl, filename };
  } catch (err) {
    request.status = 'rejected';
    request.rejectionReason = err.message;
    await request.save();
    throw err;
  }
}

async function deleteMerchantData(merchantId) {
  const stores = await Store.find({ merchant: merchantId });
  const storeIds = stores.map((s) => s._id);

  await Product.updateMany(
    { merchant: merchantId },
    { $set: { isDeleted: true, isActive: false, deletedForCompliance: true, deletedAt: new Date() } }
  );

  await Order.updateMany(
    { merchant: merchantId },
    { $set: { anonymized: true, 'deliveryAddress.name': '[تم الحذف]', 'deliveryAddress.phone': '[تم الحذف]' } }
  );

  await Merchant.findByIdAndUpdate(merchantId, {
    $set: {
      name: '[تم حذف الحساب]',
      email: `deleted-${merchantId}@nawamart.com`,
      phone: '[تم الحذف]',
      isActive: false,
      isVerified: false,
      profileImage: null,
      googleId: null,
    },
  });

  return { storesAnonymized: storeIds.length };
}

async function deleteCustomerData(customerId, storeId) {
  const query = { customer: customerId };
  if (storeId) query.store = storeId;

  await Order.updateMany(query, {
    $set: {
      anonymized: true,
      customer: null,
      'deliveryAddress.name': '[تم الحذف]',
      'deliveryAddress.phone': '[تم الحذف]',
    },
  });

  if (!storeId) {
    await Customer.findByIdAndUpdate(customerId, {
      $set: {
        name: '[تم حذف الحساب]',
        email: `deleted-${customerId}@nawamart.com`,
        phone: '[تم الحذف]',
        isActive: false,
        address: { city: null, district: null, details: null },
        profileImage: null,
        googleId: null,
      },
    });
  }

  return true;
}

module.exports = { generateExport, collectMerchantData, collectCustomerData, deleteMerchantData, deleteCustomerData };
