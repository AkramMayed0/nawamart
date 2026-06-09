const Page = require('../models/Page');
const Store = require('../models/Store');
const crypto = require('crypto');
const { asyncHandler, apiResponse, paginate } = require('../utils/helpers');
const generateId = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9);

const getPages = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const result = await paginate(Page, { store: storeId }, {
    page: req.query.page,
    limit: req.query.limit,
    sort: { updatedAt: -1 },
  });

  return apiResponse(res, { data: result, message: 'تم جلب الصفحات بنجاح' });
});

const getPage = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const page = await Page.findOne({ _id: req.params.id, store: storeId });
  if (!page) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'الصفحة غير موجودة' });
  }

  return apiResponse(res, { data: page, message: 'تم جلب الصفحة بنجاح' });
});

const createPage = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const { title, slug, type, isHomePage, seo, sections } = req.body;

  if (isHomePage) {
    await Page.updateMany({ store: storeId, isHomePage: true }, { isHomePage: false });
  }

  const page = await Page.create({
    store: storeId,
    title,
    slug: slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF-]/g, ''),
    type: type || 'custom',
    isHomePage: isHomePage || false,
    seo,
    sections: sections || [],
  });

  return apiResponse(res, { statusCode: 201, data: page, message: 'تم إنشاء الصفحة بنجاح' });
});

const updatePage = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const { title, slug, isPublished, isHomePage, seo } = req.body;

  if (isHomePage) {
    await Page.updateMany({ store: storeId, isHomePage: true }, { isHomePage: false });
  }

  const update = {};
  if (title !== undefined) update.title = title;
  if (slug !== undefined) update.slug = slug;
  if (isPublished !== undefined) {
    update.isPublished = isPublished;
    if (isPublished) update.publishedAt = new Date();
  }
  if (isHomePage !== undefined) update.isHomePage = isHomePage;
  if (seo !== undefined) update.seo = seo;

  const page = await Page.findOneAndUpdate(
    { _id: req.params.id, store: storeId },
    { $set: update },
    { new: true, runValidators: true }
  );

  if (!page) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'الصفحة غير موجودة' });
  }

  return apiResponse(res, { data: page, message: 'تم تحديث الصفحة بنجاح' });
});

const deletePage = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const page = await Page.findOneAndDelete({ _id: req.params.id, store: storeId });
  if (!page) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'الصفحة غير موجودة' });
  }

  return apiResponse(res, { message: 'تم حذف الصفحة بنجاح' });
});

const addSection = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const page = await Page.findOne({ _id: req.params.id, store: storeId });
  if (!page) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'الصفحة غير موجودة' });
  }

  const { type, settings, blocks } = req.body;
  const section = {
    id: generateId(),
    type: type || 'custom',
    order: page.sections.length,
    label: req.body.label || null,
    settings: settings || {},
    blocks: blocks || [],
  };

  page.sections.push(section);
  await page.save();

  return apiResponse(res, { statusCode: 201, data: page, message: 'تم إضافة القسم بنجاح' });
});

const updateSection = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const page = await Page.findOne({ _id: req.params.id, store: storeId });
  if (!page) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'الصفحة غير موجودة' });
  }

  const section = page.sections.id(req.params.sectionId);
  if (!section) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'القسم غير موجود' });
  }

  const { type, label, settings, blocks, order } = req.body;
  if (type !== undefined) section.type = type;
  if (label !== undefined) section.label = label;
  if (settings !== undefined) section.settings = { ...section.settings, ...settings };
  if (blocks !== undefined) section.blocks = blocks;
  if (order !== undefined) section.order = order;

  await page.save();
  return apiResponse(res, { data: page, message: 'تم تحديث القسم بنجاح' });
});

const removeSection = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const page = await Page.findOne({ _id: req.params.id, store: storeId });
  if (!page) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'الصفحة غير موجودة' });
  }

  page.sections = page.sections.filter((s) => s.id !== req.params.sectionId);
  await page.save();
  return apiResponse(res, { data: page, message: 'تم حذف القسم بنجاح' });
});

const reorderSections = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const page = await Page.findOne({ _id: req.params.id, store: storeId });
  if (!page) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'الصفحة غير موجودة' });
  }

  const { order } = req.body;
  if (!Array.isArray(order)) {
    return apiResponse(res, { statusCode: 400, success: false, message: 'الترتيب يجب أن يكون مصفوفة' });
  }

  const sectionMap = {};
  page.sections.forEach((s) => { sectionMap[s.id] = s; });

  page.sections = order.map((id, index) => {
    if (sectionMap[id]) {
      sectionMap[id].order = index;
      return sectionMap[id];
    }
    return null;
  }).filter(Boolean);

  await page.save();
  return apiResponse(res, { data: page, message: 'تم إعادة ترتيب الأقسام بنجاح' });
});

const addBlock = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const page = await Page.findOne({ _id: req.params.id, store: storeId });
  if (!page) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'الصفحة غير موجودة' });
  }

  const section = page.sections.id(req.params.sectionId);
  if (!section) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'القسم غير موجود' });
  }

  const { type, content, settings } = req.body;
  const block = {
    id: generateId(),
    type: type || 'custom',
    order: section.blocks.length,
    content: content || {},
    settings: settings || {},
  };

  section.blocks.push(block);
  await page.save();

  return apiResponse(res, { statusCode: 201, data: page, message: 'تم إضافة المكون بنجاح' });
});

const updateBlock = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const page = await Page.findOne({ _id: req.params.id, store: storeId });
  if (!page) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'الصفحة غير موجودة' });
  }

  const section = page.sections.id(req.params.sectionId);
  if (!section) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'القسم غير موجود' });
  }

  const block = section.blocks.id(req.params.blockId);
  if (!block) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المكون غير موجود' });
  }

  const { type, content, settings, order } = req.body;
  if (type !== undefined) block.type = type;
  if (content !== undefined) block.content = { ...block.content, ...content };
  if (settings !== undefined) block.settings = { ...block.settings, ...settings };
  if (order !== undefined) block.order = order;

  await page.save();
  return apiResponse(res, { data: page, message: 'تم تحديث المكون بنجاح' });
});

const removeBlock = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const page = await Page.findOne({ _id: req.params.id, store: storeId });
  if (!page) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'الصفحة غير موجودة' });
  }

  const section = page.sections.id(req.params.sectionId);
  if (!section) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'القسم غير موجود' });
  }

  section.blocks = section.blocks.filter((b) => b.id !== req.params.blockId);
  await page.save();
  return apiResponse(res, { data: page, message: 'تم حذف المكون بنجاح' });
});

const getPublicPage = asyncHandler(async (req, res) => {
  const { slug, storeId } = req.params;
  const page = await Page.findOne({ store: storeId, slug, isPublished: true });
  if (!page) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'الصفحة غير موجودة' });
  }
  return apiResponse(res, { data: page, message: 'تم جلب الصفحة بنجاح' });
});

module.exports = {
  getPages,
  getPage,
  createPage,
  updatePage,
  deletePage,
  addSection,
  updateSection,
  removeSection,
  reorderSections,
  addBlock,
  updateBlock,
  removeBlock,
  getPublicPage,
};
