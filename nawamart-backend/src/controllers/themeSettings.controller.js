const ThemeSetting = require('../models/ThemeSetting');
const Store = require('../models/Store');
const Theme = require('../models/Theme');
const { asyncHandler, apiResponse } = require('../utils/helpers');

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

const updateColors = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const allowed = [
    'primary', 'secondary', 'accent', 'background', 'surface',
    'text', 'textMuted', 'header', 'footer', 'button', 'buttonText',
    'success', 'danger', 'warning',
  ];

  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      update[`colors.${key}`] = req.body[key];
    }
  }

  const settings = await ThemeSetting.findOneAndUpdate(
    { store: storeId },
    { $set: update },
    { new: true, upsert: true, runValidators: true }
  );

  return apiResponse(res, { data: settings, message: 'تم تحديث الألوان بنجاح' });
});

const updateFonts = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const allowed = ['heading', 'body', 'headingUrl', 'bodyUrl'];
  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      update[`fonts.${key}`] = req.body[key];
    }
  }

  const settings = await ThemeSetting.findOneAndUpdate(
    { store: storeId },
    { $set: update },
    { new: true, upsert: true, runValidators: true }
  );

  return apiResponse(res, { data: settings, message: 'تم تحديث الخطوط بنجاح' });
});

const updateLayout = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const allowed = ['headerStyle', 'footerStyle', 'productCardStyle', 'sidebarPosition', 'containerWidth', 'borderRadius', 'animationEnabled'];
  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      update[`layout.${key}`] = req.body[key];
    }
  }

  const settings = await ThemeSetting.findOneAndUpdate(
    { store: storeId },
    { $set: update },
    { new: true, upsert: true, runValidators: true }
  );

  return apiResponse(res, { data: settings, message: 'تم تحديث التخطيط بنجاح' });
});

const updateSpacing = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const allowed = ['sectionPadding', 'elementGap', 'contentPadding'];
  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      update[`spacing.${key}`] = req.body[key];
    }
  }

  const settings = await ThemeSetting.findOneAndUpdate(
    { store: storeId },
    { $set: update },
    { new: true, upsert: true, runValidators: true }
  );

  return apiResponse(res, { data: settings, message: 'تم تحديث المسافات بنجاح' });
});

const updateCustomCss = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const settings = await ThemeSetting.findOneAndUpdate(
    { store: storeId },
    { $set: { customCss: req.body.css } },
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
  if (req.body.header !== undefined) update['customHtml.header'] = req.body.header;
  if (req.body.footer !== undefined) update['customHtml.footer'] = req.body.footer;

  const settings = await ThemeSetting.findOneAndUpdate(
    { store: storeId },
    { $set: update },
    { new: true, upsert: true, runValidators: true }
  );

  return apiResponse(res, { data: settings, message: 'تم تحديث HTML المخصص بنجاح' });
});

const resetThemeSettings = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  let settings = await ThemeSetting.findOne({ store: storeId });
  if (!settings) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'لا توجد إعدادات قالب' });
  }

  settings.colors = { ...settings.theme?.settings?.colors } || ThemeSetting.schema.path('colors').default();
  settings.fonts = ThemeSetting.schema.path('fonts').default();
  settings.layout = ThemeSetting.schema.path('layout').default();
  settings.spacing = ThemeSetting.schema.path('spacing').default();
  settings.customCss = null;
  settings.customHtml = { header: null, footer: null };
  await settings.save();

  return apiResponse(res, { data: settings, message: 'تم إعادة تعيين إعدادات القالب إلى الوضع الافتراضي' });
});

const getPublicThemeSettings = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const settings = await ThemeSetting.findOne({ store: storeId, isActive: true }).populate('theme', 'name slug');
  if (!settings) {
    return apiResponse(res, { data: null, message: 'لا توجد إعدادات قالب' });
  }
  return apiResponse(res, { data: settings, message: 'تم جلب إعدادات القالب بنجاح' });
});

module.exports = {
  getThemeSettings,
  updateColors,
  updateFonts,
  updateLayout,
  updateSpacing,
  updateCustomCss,
  updateCustomHtml,
  resetThemeSettings,
  getPublicThemeSettings,
};
