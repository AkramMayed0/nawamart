const KnowledgeService = require('../services/KnowledgeService');
const { asyncHandler, apiResponse, getPaginationParams, paginateResponse } = require('../utils/helpers');

const createArticle = asyncHandler(async (req, res) => {
  const { title, content, excerpt, category, tags, isPublished, isFeatured, order } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'عنوان المقال ومحتواه مطلوبان',
    });
  }

  const article = await KnowledgeService.createArticle({
    title,
    content,
    excerpt,
    category,
    tags,
    isPublished,
    isFeatured,
    order,
    author: req.user._id,
  });

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء المقال بنجاح',
    data: article,
  });
});

const getArticles = asyncHandler(async (req, res) => {
  const { query, category, tags, includeUnpublished } = req.query;

  const articles = await KnowledgeService.searchArticles(query, {
    category,
    tags: tags ? tags.split(',') : undefined,
    includeUnpublished: includeUnpublished === 'true',
  });

  return apiResponse(res, {
    message: 'تم جلب المقالات',
    data: articles,
  });
});

const getArticleBySlug = asyncHandler(async (req, res) => {
  const article = await KnowledgeService.getArticleBySlug(req.params.slug);
  if (!article) {
    return res.status(404).json({ success: false, data: null, message: 'المقال غير موجود' });
  }

  return apiResponse(res, {
    message: 'تم جلب المقال',
    data: article,
  });
});

const getArticleById = asyncHandler(async (req, res) => {
  const article = await KnowledgeService.getArticleById(req.params.id);
  if (!article) {
    return res.status(404).json({ success: false, data: null, message: 'المقال غير موجود' });
  }

  return apiResponse(res, {
    message: 'تم جلب المقال',
    data: article,
  });
});

const updateArticle = asyncHandler(async (req, res) => {
  const article = await KnowledgeService.updateArticle(req.params.id, req.body);
  if (!article) {
    return res.status(404).json({ success: false, data: null, message: 'المقال غير موجود' });
  }

  return apiResponse(res, {
    message: 'تم تحديث المقال',
    data: article,
  });
});

const deleteArticle = asyncHandler(async (req, res) => {
  const article = await KnowledgeService.deleteArticle(req.params.id);
  if (!article) {
    return res.status(404).json({ success: false, data: null, message: 'المقال غير موجود' });
  }

  return apiResponse(res, {
    message: 'تم حذف المقال',
    data: null,
  });
});

const rateArticle = asyncHandler(async (req, res) => {
  const { helpful } = req.body;

  const article = await KnowledgeService.rateArticle(req.params.id, helpful);
  if (!article) {
    return res.status(404).json({ success: false, data: null, message: 'المقال غير موجود' });
  }

  return apiResponse(res, {
    message: helpful ? 'تم تسجيل التقييم الإيجابي' : 'تم تسجيل التقييم السلبي',
    data: article,
  });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await KnowledgeService.getCategories();
  return apiResponse(res, {
    message: 'تم جلب التصنيفات',
    data: categories,
  });
});

module.exports = {
  createArticle,
  getArticles,
  getArticleBySlug,
  getArticleById,
  updateArticle,
  deleteArticle,
  rateArticle,
  getCategories,
};
