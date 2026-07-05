const ThemePreset = require('../models/ThemePreset');
const ThemeSetting = require('../models/ThemeSetting');
const Store = require('../models/Store');
const { asyncHandler, apiResponse } = require('../utils/helpers');

const getPresets = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const presets = await ThemePreset.find({ store: storeId }).sort({ createdAt: -1 });
  return apiResponse(res, { data: presets, message: 'تم جلب الإعدادات المسبقة بنجاح' });
});

const getPublicPresets = asyncHandler(async (req, res) => {
  const presets = await ThemePreset.find({ isPublic: true })
    .populate('store', 'name slug')
    .sort({ createdAt: -1 });
  return apiResponse(res, { data: presets, message: 'تم جلب الإعدادات المسبقة العامة بنجاح' });
});

const savePreset = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const { name, screenshot, isPublic } = req.body;

  const themeSettings = await ThemeSetting.findOne({ store: storeId });
  if (!themeSettings) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'لا توجد إعدادات قالب' });
  }

  const settings = {
    colors: themeSettings.colors,
    typography: themeSettings.typography,
    layout: themeSettings.layout,
    header: themeSettings.header,
    footer: themeSettings.footer,
    buttons: themeSettings.buttons,
    badges: themeSettings.badges,
    icons: themeSettings.icons,
    images: themeSettings.images,
    productPage: themeSettings.productPage,
    collectionPage: themeSettings.collectionPage,
    cart: themeSettings.cart,
    checkout: themeSettings.checkout,
    mobile: themeSettings.mobile,
  };

  const preset = await ThemePreset.create({
    store: storeId,
    name,
    settings,
    screenshot: screenshot || null,
    isPublic: isPublic || false,
  });

  return apiResponse(res, { data: preset, message: 'تم حفظ الإعداد المسبق بنجاح' });
});

const applyPreset = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const { presetId } = req.body;

  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const preset = await ThemePreset.findById(presetId);
  if (!preset) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'الإعداد المسبق غير موجود' });
  }

  if (preset.store.toString() !== storeId && !preset.isPublic) {
    return apiResponse(res, { statusCode: 403, success: false, message: 'ليس لديك صلاحية لتطبيق هذا الإعداد' });
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
  flatten(preset.settings);

  await ThemeSetting.findOneAndUpdate(
    { store: storeId },
    { $set: update },
    { new: true, upsert: true }
  );

  return apiResponse(res, { message: 'تم تطبيق الإعداد المسبق بنجاح' });
});

const deletePreset = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const { presetId } = req.params;

  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const preset = await ThemePreset.findOneAndDelete({ _id: presetId, store: storeId });
  if (!preset) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'الإعداد المسبق غير موجود' });
  }

  return apiResponse(res, { message: 'تم حذف الإعداد المسبق بنجاح' });
});

const togglePublic = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const { presetId } = req.params;

  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const preset = await ThemePreset.findOne({ _id: presetId, store: storeId });
  if (!preset) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'الإعداد المسبق غير موجود' });
  }

  preset.isPublic = !preset.isPublic;
  await preset.save();

  return apiResponse(res, { data: preset, message: `تم ${preset.isPublic ? 'نشر' : 'إلغاء نشر'} الإعداد المسبق بنجاح` });
});

module.exports = {
  getPresets,
  getPublicPresets,
  savePreset,
  applyPreset,
  deletePreset,
  togglePublic,
};
