const ThemeSetting = require('../models/ThemeSetting');
const Store = require('../models/Store');
const Theme = require('../models/Theme');
const { asyncHandler, apiResponse } = require('../utils/helpers');

const SECTION_PATHS = {
  colors: 'colors',
  typography: 'typography',
  layout: 'layout',
  header: 'header',
  footer: 'footer',
  buttons: 'buttons',
  badges: 'badges',
  icons: 'icons',
  images: 'images',
  productPage: 'productPage',
  collectionPage: 'collectionPage',
  cart: 'cart',
  checkout: 'checkout',
  mobile: 'mobile',
  spacing: 'spacing',
};

const getThemeSettings = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  let settings = await ThemeSetting.findOne({ store: storeId }).populate('theme');
  if (!settings) {
    const defaultTheme = await Theme.findOne({ isDefault: true });
    settings = await ThemeSetting.create({
      store: storeId,
      theme: defaultTheme ? defaultTheme._id : null,
    });
    settings = await ThemeSetting.findById(settings._id).populate('theme');
  }

  return apiResponse(res, { data: settings, message: 'تم جلب إعدادات القالب بنجاح' });
});

const getPublicThemeSettings = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const settings = await ThemeSetting.findOne({ store: storeId, isActive: true }).populate('theme', 'name slug');
  if (!settings) {
    return apiResponse(res, { data: null, message: 'لا توجد إعدادات قالب' });
  }
  return apiResponse(res, { data: settings, message: 'تم جلب إعدادات القالب بنجاح' });
});

const updateSection = (section) =>
  asyncHandler(async (req, res) => {
    const storeId = req.params.storeId;
    const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
    if (!store) {
      return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
    }

    const path = SECTION_PATHS[section];
    if (!path) {
      return apiResponse(res, { statusCode: 400, success: false, message: 'قسم غير صالح' });
    }

    const update = {};
    const buildUpdate = (obj, prefix) => {
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined && typeof value === 'object' && !Array.isArray(value) && value !== null) {
          buildUpdate(value, `${prefix}.${key}`);
        } else {
          update[`${prefix}.${key}`] = value;
        }
      }
    };
    buildUpdate(req.body, path);

    const settings = await ThemeSetting.findOneAndUpdate(
      { store: storeId },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );

    return apiResponse(res, { data: settings, message: `تم تحديث ${section} بنجاح` });
  });

const updateColors = updateSection('colors');
const updateTypography = updateSection('typography');
const updateLayout = updateSection('layout');
const updateHeader = updateSection('header');
const updateFooter = updateSection('footer');
const updateButtons = updateSection('buttons');
const updateBadges = updateSection('badges');
const updateIcons = updateSection('icons');
const updateImages = updateSection('images');
const updateProductPage = updateSection('productPage');
const updateCollectionPage = updateSection('collectionPage');
const updateCart = updateSection('cart');
const updateCheckout = updateSection('checkout');
const updateMobile = updateSection('mobile');
const updateSpacing = updateSection('spacing');

const updateCustomCss = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const settings = await ThemeSetting.findOneAndUpdate(
    { store: storeId },
    { $set: { customCss: req.body.css, 'customCode.css.code': req.body.css } },
    { new: true, upsert: true, runValidators: true }
  );

  return apiResponse(res, { data: settings, message: 'تم تحديث CSS المخصص بنجاح' });
});

const updateCustomHtml = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const update = {};
  if (req.body.header !== undefined) {
    update['customHtml.header'] = req.body.header;
    update['customCode.js.head'] = req.body.header;
  }
  if (req.body.footer !== undefined) {
    update['customHtml.footer'] = req.body.footer;
    update['customCode.js.footer'] = req.body.footer;
  }

  const settings = await ThemeSetting.findOneAndUpdate(
    { store: storeId },
    { $set: update },
    { new: true, upsert: true, runValidators: true }
  );

  return apiResponse(res, { data: settings, message: 'تم تحديث HTML المخصص بنجاح' });
});

const updateBulk = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const update = {};
  const flatten = (obj, prefix = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        flatten(value, path);
      } else {
        update[path] = value;
      }
    }
  };
  flatten(req.body);

  const settings = await ThemeSetting.findOneAndUpdate(
    { store: storeId },
    { $set: update },
    { new: true, upsert: true, runValidators: true }
  );

  return apiResponse(res, { data: settings, message: 'تم تحديث جميع الإعدادات بنجاح' });
});

const resetThemeSettings = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const settings = await ThemeSetting.findOne({ store: storeId });
  if (!settings) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'لا توجد إعدادات قالب' });
  }

  settings.colors = undefined;
  settings.typography = undefined;
  settings.layout = undefined;
  settings.header = undefined;
  settings.footer = undefined;
  settings.buttons = undefined;
  settings.badges = undefined;
  settings.icons = undefined;
  settings.images = undefined;
  settings.productPage = undefined;
  settings.collectionPage = undefined;
  settings.cart = undefined;
  settings.checkout = undefined;
  settings.mobile = undefined;
  settings.customCode = undefined;
  settings.customCss = null;
  settings.customHtml = { header: null, footer: null };
  settings.spacing = undefined;
  await settings.save();

  return apiResponse(res, { data: settings, message: 'تم إعادة تعيين إعدادات القالب إلى الوضع الافتراضي' });
});

module.exports = {
  getThemeSettings,
  getPublicThemeSettings,
  updateColors,
  updateTypography,
  updateLayout,
  updateHeader,
  updateFooter,
  updateButtons,
  updateBadges,
  updateIcons,
  updateImages,
  updateProductPage,
  updateCollectionPage,
  updateCart,
  updateCheckout,
  updateMobile,
  updateSpacing,
  updateCustomCss,
  updateCustomHtml,
  updateBulk,
  resetThemeSettings,
};
