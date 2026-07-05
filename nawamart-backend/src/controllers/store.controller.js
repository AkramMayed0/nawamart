const Store = require('../models/Store');
const Merchant = require('../models/Merchant');
const Product = require('../models/Product');
const { apiResponse, asyncHandler } = require('../utils/helpers');
const { getEffectivePlan } = require('../middleware/planLimits');
const { logActivity } = require('../services/audit');
const { getMaxStores } = require('../services/PlanService');

function parseJSON(value) {
  if (value == null) return undefined;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch (e) { return undefined; }
  }
  return value;
}

function normalizePaymentAccounts(existing = {}, incoming) {
  const parsed = parseJSON(incoming);
  if (parsed === undefined) return undefined;
  return {
    kuraimi: parsed.kuraimi ?? existing.kuraimi ?? null,
    oneCash: parsed.oneCash ?? existing.oneCash ?? null,
    jaib: parsed.jaib ?? existing.jaib ?? null,
  };
}

function normalizeShippingFees(incoming) {
  const parsed = parseJSON(incoming);
  if (!Array.isArray(parsed)) return undefined;
  return parsed
    .filter((item) => item && item.city && typeof item.city === 'string' && item.city.trim())
    .map((item) => ({
      city: item.city.trim(),
      fee: Math.max(0, Number(item.fee) || 0),
    }));
}

function normalizeObjectField(incoming, fallback) {
  if (incoming === undefined || incoming === null) return undefined;
  if (typeof incoming === 'object' && !Array.isArray(incoming)) return incoming;
  if (typeof incoming === 'string') {
    try { const v = JSON.parse(incoming); if (v && typeof v === 'object' && !Array.isArray(v)) return v; } catch (e) { /* ignore */ }
  }
  return fallback;
}

function normalizeStringArray(incoming) {
  if (incoming === undefined || incoming === null) return undefined;
  if (Array.isArray(incoming)) return incoming.filter(Boolean).map(s => String(s).trim()).filter(Boolean);
  if (typeof incoming === 'string') {
    try { const v = JSON.parse(incoming); if (Array.isArray(v)) return v.filter(Boolean).map(s => String(s).trim()).filter(Boolean); } catch (e) { /* ignore */ }
    return incoming.split(',').map(s => s.trim()).filter(Boolean);
  }
  return undefined;
}

/**
 * POST /api/stores
 * Create a new store for the logged-in merchant
 * Multi-store is plan-dependent: starter=1, pro=3, business=unlimited
 */
const createStore = asyncHandler(async (req, res) => {
  const { name, type, description, category, contactPhone, paymentAccounts, shippingFees, customDomain, locale, currency, language, legalBusinessName, contactEmail, timezone, subdomain } = req.body;

  const existingStores = await Store.find({ merchant: req.user._id }).sort({ planExpiresAt: -1 });
  const storeCount = existingStores.length;

  let bestPlan = 'starter';
  for (const s of existingStores) {
    const effective = getEffectivePlan(s);
    if (effective === 'business') { bestPlan = 'business'; break; }
    if (effective === 'pro') bestPlan = 'pro';
  }

  const maxStores = getMaxStores(bestPlan);
  if (storeCount >= maxStores) {
    const planLabel = { starter: 'البداية', pro: 'الاحترافية', business: 'الأعمال' };
    return res.status(400).json({
      success: false,
      message: `لقد وصلت للحد الأقصى من المتاجر في خطتك الحالية (${maxStores === Infinity ? 'غير محدود' : maxStores}). خطتك الحالية: ${planLabel[bestPlan]}. قم بالترقية لإنشاء المزيد من المتاجر.`,
      data: null,
    });
  }

  let logo = null;
  let banner = null;

  if (req.files) {
    if (req.files.logo) logo = req.files.logo[0].path;
    if (req.files.banner) banner = req.files.banner[0].path;
  }

  const parsedPaymentAccounts = normalizePaymentAccounts({}, paymentAccounts);
  const parsedShippingFees = normalizeShippingFees(shippingFees);

  const store = await Store.create({
    merchant: req.user._id,
    name,
    type: type || 'physical',
    description,
    category,
    contactPhone: contactPhone?.trim() || null,
    legalBusinessName: legalBusinessName?.trim() || null,
    contactEmail: contactEmail?.trim() || null,
    paymentAccounts: parsedPaymentAccounts ?? undefined,
    shippingFees: parsedShippingFees ?? [],
    logo,
    banner,
    subdomain: subdomain?.trim() || null,
    customDomain: customDomain?.trim() || null,
    locale: locale || 'ar-YE',
    currency: currency || 'YER',
    language: language || 'ar',
    timezone: timezone || 'Asia/Aden',
    planExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  });

  await Merchant.findByIdAndUpdate(req.user._id, {
    $push: { stores: store._id },
  });

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء المتجر بنجاح',
    data: store,
  });
});

/**
 * GET /api/stores/my
 * Get all stores for the logged-in merchant
 */
const getMyStores = asyncHandler(async (req, res) => {
  const stores = await Store.find({ merchant: req.user._id }).sort({ createdAt: -1 });

  return apiResponse(res, {
    message: 'تم جلب المتاجر بنجاح',
    data: stores,
  });
});

/**
 * GET /api/stores/:slug
 * Get a store by its slug (Public)
 */
const getStoreBySlug = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ slug: req.params.slug, storeStatus: { $in: ['live', 'under_construction'] } });

  if (!store) {
    return res.status(404).json({
      success: false,
      message: 'المتجر غير موجود أو غير مفعل',
      data: null,
    });
  }

  return apiResponse(res, {
    message: 'تم جلب بيانات المتجر',
    data: store,
  });
});

/**
 * PUT /api/stores/:id
 * Update a store (Merchant only)
 */
const updateStore = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  let store = await Store.findOne({ _id: id, merchant: req.user._id });

  if (!store) {
    return res.status(404).json({
      success: false,
      message: 'المتجر غير موجود أو لا تملك صلاحية تعديله',
      data: null,
    });
  }

  const {
    name, description, category, contactPhone, paymentAccounts,
    legalBusinessName, contactEmail, physicalAddress,
    storeStatus, constructionPassword,
    shippingFees,
    subdomain, customDomain, domainVerified,
    locale, currency, language, timezone, dateFormat, numberFormat,
    tenantType,
    staffPasswordPolicy, ipAllowlist,
    featureToggles,
    integrations,
  } = req.body;

  let logo = store.logo;
  let banner = store.banner;

  if (req.files) {
    if (req.files.logo) logo = req.files.logo[0].path;
    if (req.files.banner) banner = req.files.banner[0].path;
  }

  const parsedPaymentAccounts = normalizePaymentAccounts(store.paymentAccounts, paymentAccounts);

  store.name = name || store.name;
  if (description !== undefined) store.description = description;
  if (category !== undefined) store.category = category;
  if (contactPhone !== undefined) store.contactPhone = contactPhone?.trim() || null;
  if (legalBusinessName !== undefined) store.legalBusinessName = legalBusinessName?.trim() || null;
  if (contactEmail !== undefined) store.contactEmail = contactEmail?.trim() || null;
  if (parsedPaymentAccounts !== undefined) store.paymentAccounts = parsedPaymentAccounts;

  // Physical address
  if (physicalAddress !== undefined) {
    const addr = normalizeObjectField(physicalAddress, store.physicalAddress);
    if (addr) {
      store.physicalAddress = {
        street:  addr.street  ?? store.physicalAddress?.street  ?? null,
        city:    addr.city    ?? store.physicalAddress?.city    ?? null,
        state:   addr.state   ?? store.physicalAddress?.state   ?? null,
        zip:     addr.zip     ?? store.physicalAddress?.zip     ?? null,
        country: addr.country ?? store.physicalAddress?.country ?? 'YE',
      };
    }
  }

  // Store status
  const VALID_STATUSES = ['live', 'under_construction', 'paused', 'closed'];
  if (storeStatus !== undefined && VALID_STATUSES.includes(storeStatus)) {
    store.storeStatus = storeStatus;
    store.isActive = storeStatus === 'live' || storeStatus === 'under_construction';
  }
  if (constructionPassword !== undefined) {
    store.constructionPassword = constructionPassword?.trim() || null;
  }

  // Domain settings
  if (subdomain !== undefined) store.subdomain = subdomain?.trim().toLowerCase() || null;
  if (customDomain !== undefined) store.customDomain = customDomain?.trim() || null;
  if (domainVerified !== undefined) store.domainVerified = Boolean(domainVerified);

  // Localization
  if (locale !== undefined) store.locale = locale;
  if (currency !== undefined) store.currency = currency;
  if (language !== undefined) store.language = language;
  if (timezone !== undefined) store.timezone = timezone;
  if (dateFormat !== undefined) store.dateFormat = dateFormat;
  if (numberFormat !== undefined) store.numberFormat = numberFormat;

  // Hosting
  if (tenantType !== undefined) store.tenantType = tenantType;

  // Security
  if (staffPasswordPolicy !== undefined) {
    const policy = normalizeObjectField(staffPasswordPolicy, store.staffPasswordPolicy);
    if (policy) {
      store.staffPasswordPolicy = {
        minLength:        Math.max(4, Math.min(128, Number(policy.minLength) || 8)),
        requireUppercase: policy.requireUppercase !== undefined ? Boolean(policy.requireUppercase) : store.staffPasswordPolicy.requireUppercase,
        requireLowercase: policy.requireLowercase !== undefined ? Boolean(policy.requireLowercase) : store.staffPasswordPolicy.requireLowercase,
        requireNumber:    policy.requireNumber    !== undefined ? Boolean(policy.requireNumber)    : store.staffPasswordPolicy.requireNumber,
        requireSpecial:   policy.requireSpecial   !== undefined ? Boolean(policy.requireSpecial)   : store.staffPasswordPolicy.requireSpecial,
      };
    }
  }
  if (ipAllowlist !== undefined) {
    const ips = normalizeStringArray(ipAllowlist);
    if (ips !== undefined) store.ipAllowlist = ips;
  }

  // Feature toggles
  if (featureToggles !== undefined) {
    const toggles = normalizeObjectField(featureToggles, store.featureToggles);
    if (toggles) {
      for (const key of ['blog', 'reviews', 'wishlists', 'multiLanguage', 'dropshipping']) {
        if (toggles[key] !== undefined) {
          store.featureToggles[key] = Boolean(toggles[key]);
        }
      }
    }
  }

  // Integrations
  if (integrations !== undefined) {
    const ings = normalizeObjectField(integrations, store.integrations);
    if (ings) {
      const listKeys = ['paymentGateways', 'shippingCarriers', 'marketingTools', 'accounting'];
      for (const key of listKeys) {
        if (ings[key] !== undefined) {
          const arr = normalizeStringArray(ings[key]);
          store.integrations[key] = arr ?? store.integrations[key];
        }
      }
    }
  }

  // Shipping fees
  if (shippingFees !== undefined && store.type === 'physical') {
    const parsedShipping = normalizeShippingFees(shippingFees);
    if (parsedShipping !== undefined) {
      store.shippingFees = parsedShipping;
    }
  }
  store.logo = logo;
  store.banner = banner;

  await store.save();

  await logActivity(req, {
    action: 'store.update',
    resourceType: 'store',
    resourceId: store._id,
    resourceName: store.name,
    details: `تم تحديث إعدادات المتجر ${store.name}`,
  });

  return apiResponse(res, {
    message: 'تم تحديث المتجر بنجاح',
    data: store,
  });
});

/**
 * POST /api/stores/switch
 * Switch the active store context for multi-store dashboards.
 * Validates that the merchant (or staff) has access to the store.
 */
const switchStore = asyncHandler(async (req, res) => {
  const { storeId } = req.body;
  if (!storeId) {
    return res.status(400).json({
      success: false,
      message: 'معرّف المتجر مطلوب',
      data: null,
    });
  }

  // Check merchant owns the store OR is staff with access
  let store = await Store.findOne({ _id: storeId, merchant: req.user._id });

  if (!store) {
    const StoreStaff = require('../models/StoreStaff');
    const staffEntry = await StoreStaff.findOne({
      store: storeId,
      user: req.user._id,
      isActive: true,
    }).populate('store');
    if (!staffEntry || !staffEntry.store) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول إلى هذا المتجر',
        data: null,
      });
    }
    store = staffEntry.store;
  }

  return apiResponse(res, {
    message: 'تم التبديل إلى المتجر بنجاح',
    data: store,
  });
});

/**
 * POST /api/stores/:id/duplicate
 * Duplicate a store with all its active products (for backup/testing)
 */
const duplicateStore = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const source = await Store.findById(id);
  if (!source) {
    return res.status(404).json({
      success: false,
      message: 'المتجر غير موجود',
      data: null,
    });
  }

  if (source.merchant.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'لا تملك صلاحية نسخ هذا المتجر',
      data: null,
    });
  }

  const merchant = await Merchant.findById(req.user._id);
  const maxStores = getMaxStores(merchant?.plan || 'starter');
  const storeCount = await Store.countDocuments({ merchant: req.user._id, storeStatus: { $ne: 'closed' } });
  if (storeCount >= maxStores) {
    return res.status(403).json({
      success: false,
      message: `لقد وصلت إلى الحد الأقصى لعدد المتاجر المسموح به (${maxStores})`,
      data: null,
    });
  }

  const storeData = source.toObject();
  delete storeData._id;
  delete storeData.__v;
  delete storeData.createdAt;
  delete storeData.updatedAt;
  delete storeData.slug;
  delete storeData.subdomain;
  delete storeData.customDomain;
  delete storeData.domainVerified;
  delete storeData.totalProducts;
  delete storeData.totalOrders;

  storeData.name = `${storeData.name} (نسخة)`;
  storeData.storeStatus = 'under_construction';
  storeData.constructionPassword = null;

  const duplicate = await Store.create(storeData);

  const products = await Product.find({ store: id, isDeleted: false }).lean();
  let copiedCount = 0;
  for (const p of products) {
    delete p._id;
    delete p.__v;
    delete p.createdAt;
    delete p.updatedAt;
    p.store = duplicate._id;
    p.merchant = req.user._id;
    p.createdBy = req.user._id;
    p.updatedBy = req.user._id;
    await Product.create(p);
    copiedCount++;
  }

  await Store.findByIdAndUpdate(duplicate._id, { totalProducts: copiedCount });

  await logActivity(req, {
    action: 'store.duplicate',
    resourceType: 'store',
    resourceId: duplicate._id,
    resourceName: duplicate.name,
    details: `تم نسخ المتجر ${source.name} مع ${copiedCount} منتج`,
  });

  return apiResponse(res, {
    statusCode: 201,
    message: `تم نسخ المتجر بنجاح مع ${copiedCount} منتج`,
    data: duplicate,
  });
});

module.exports = {
  createStore,
  getMyStores,
  getStoreBySlug,
  updateStore,
  switchStore,
  duplicateStore,
};
