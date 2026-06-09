const Theme = require('../models/Theme');
const Store = require('../models/Store');
const ThemeSetting = require('../models/ThemeSetting');
const { asyncHandler, apiResponse, paginate } = require('../utils/helpers');

const getThemes = asyncHandler(async (req, res) => {
  const { category, type, search } = req.query;
  const query = { isActive: true };
  if (category) query.category = category;
  if (type) query.type = type;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  const result = await paginate(Theme, query, {
    page: req.query.page,
    limit: req.query.limit,
    sort: { isDefault: -1, installCount: -1, createdAt: -1 },
  });
  return apiResponse(res, {
    data: result,
    message: 'تم جلب القوائم بنجاح',
  });
});

const getThemeBySlug = asyncHandler(async (req, res) => {
  const theme = await Theme.findOne({ slug: req.params.slug, isActive: true });
  if (!theme) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'القالب غير موجود' });
  }
  return apiResponse(res, { data: theme, message: 'تم جلب القالب بنجاح' });
});

const installTheme = asyncHandler(async (req, res) => {
  const { themeId } = req.body;
  const storeId = req.params.storeId;

  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const theme = await Theme.findById(themeId);
  if (!theme || !theme.isActive) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'القالب غير موجود' });
  }

  store.activeTheme = themeId;
  await store.save();

  await Theme.findByIdAndUpdate(themeId, { $inc: { installCount: 1 } });

  let themeSetting = await ThemeSetting.findOne({ store: storeId });
  if (!themeSetting) {
    themeSetting = new ThemeSetting({
      store: storeId,
      theme: themeId,
      colors: { ...theme.settings.colors },
      fonts: { ...theme.settings.fonts },
      layout: { ...theme.settings.layout },
      spacing: { ...theme.settings.spacing },
    });
  } else {
    themeSetting.theme = themeId;
    themeSetting.colors = { ...theme.settings.colors };
    themeSetting.fonts = { ...theme.settings.fonts };
    themeSetting.layout = { ...theme.settings.layout };
    themeSetting.spacing = { ...theme.settings.spacing };
  }
  await themeSetting.save();

  return apiResponse(res, {
    statusCode: 200,
    data: { store, theme, themeSetting },
    message: `تم تثبيت القالب "${theme.name}" بنجاح`,
  });
});

const uninstallTheme = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;

  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const defaultTheme = await Theme.findOne({ isDefault: true });
  store.activeTheme = defaultTheme ? defaultTheme._id : null;
  await store.save();

  await ThemeSetting.findOneAndUpdate(
    { store: storeId },
    { $set: { theme: defaultTheme ? defaultTheme._id : null } }
  );

  return apiResponse(res, {
    message: 'تم إلغاء تثبيت القالب والعودة إلى القالب الافتراضي',
  });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Theme.distinct('category', { isActive: true });
  const labels = {
    fashion: 'أزياء',
    electronics: 'إلكترونيات',
    food: 'طعام',
    digital: 'رقمي',
    general: 'عام',
  };
  const result = categories.map((cat) => ({
    value: cat,
    label: labels[cat] || cat,
  }));
  return apiResponse(res, { data: result, message: 'تم جلب التصنيفات بنجاح' });
});

module.exports = {
  getThemes,
  getThemeBySlug,
  installTheme,
  uninstallTheme,
  getCategories,
};
