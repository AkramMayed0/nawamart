const HomepageSection = require('../models/HomepageSection');
const Store = require('../models/Store');
const { asyncHandler, apiResponse } = require('../utils/helpers');

const getSections = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const sections = await HomepageSection.find({ store: storeId }).sort({ order: 1 });
  return apiResponse(res, { data: sections, message: 'تم جلب أقسام الصفحة الرئيسية بنجاح' });
});

const getPublicSections = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const sections = await HomepageSection.find({ store: storeId, visible: true }).sort({ order: 1 });
  return apiResponse(res, { data: sections, message: 'تم جلب أقسام الصفحة الرئيسية بنجاح' });
});

const createSection = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const { type, settings } = req.body;

  const lastSection = await HomepageSection.findOne({ store: storeId }).sort({ order: -1 });
  const order = lastSection ? lastSection.order + 1 : 0;

  const section = await HomepageSection.create({
    store: storeId,
    type,
    order,
    settings: settings || {},
  });

  return apiResponse(res, { data: section, message: 'تم إنشاء القسم بنجاح' });
});

const updateSection = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const { sectionId } = req.params;

  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const section = await HomepageSection.findOneAndUpdate(
    { _id: sectionId, store: storeId },
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!section) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'القسم غير موجود' });
  }

  return apiResponse(res, { data: section, message: 'تم تحديث القسم بنجاح' });
});

const deleteSection = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const { sectionId } = req.params;

  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const section = await HomepageSection.findOneAndDelete({ _id: sectionId, store: storeId });
  if (!section) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'القسم غير موجود' });
  }

  await HomepageSection.updateMany(
    { store: storeId, order: { $gt: section.order } },
    { $inc: { order: -1 } }
  );

  return apiResponse(res, { message: 'تم حذف القسم بنجاح' });
});

const reorderSections = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const { orders } = req.body;

  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const ops = orders.map(({ id, order }) => ({
    updateOne: {
      filter: { _id: id, store: storeId },
      update: { $set: { order } },
    },
  }));

  await HomepageSection.bulkWrite(ops);

  return apiResponse(res, { message: 'تم إعادة ترتيب الأقسام بنجاح' });
});

const toggleSection = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const { sectionId } = req.params;

  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const section = await HomepageSection.findOne({ _id: sectionId, store: storeId });
  if (!section) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'القسم غير موجود' });
  }

  section.visible = !section.visible;
  await section.save();

  return apiResponse(res, { data: section, message: `تم ${section.visible ? 'إظهار' : 'إخفاء'} القسم بنجاح` });
});

module.exports = {
  getSections,
  getPublicSections,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  toggleSection,
};
