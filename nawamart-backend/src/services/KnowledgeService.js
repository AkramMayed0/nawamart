const KnowledgeArticle = require('../models/KnowledgeArticle');

class KnowledgeService {
  async createArticle(data) {
    const article = await KnowledgeArticle.create({
      title: data.title,
      content: data.content,
      excerpt: data.excerpt || null,
      category: data.category || 'general',
      tags: data.tags || [],
      isPublished: data.isPublished || false,
      publishedAt: data.isPublished ? new Date() : null,
      author: data.author || null,
      order: data.order || 0,
      isFeatured: data.isFeatured || false,
    });
    return article;
  }

  async searchArticles(query, filters = {}) {
    const searchFilter = {};

    if (query) {
      searchFilter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ];
    }

    if (!filters.includeUnpublished) {
      searchFilter.isPublished = true;
    }
    if (filters.category) {
      searchFilter.category = filters.category;
    }
    if (filters.tags) {
      searchFilter.tags = { $in: Array.isArray(filters.tags) ? filters.tags : [filters.tags] };
    }

    const articles = await KnowledgeArticle.find(searchFilter)
      .sort({ isFeatured: -1, order: 1, createdAt: -1 })
      .populate('author', 'name email')
      .lean();

    return articles;
  }

  async getArticleBySlug(slug) {
    const article = await KnowledgeArticle.findOneAndUpdate(
      { slug },
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate('author', 'name email').lean();
    return article;
  }

  async getArticleById(id) {
    const article = await KnowledgeArticle.findById(id)
      .populate('author', 'name email')
      .lean();
    return article;
  }

  async updateArticle(id, data) {
    const update = {};
    if (data.title !== undefined) update.title = data.title;
    if (data.content !== undefined) update.content = data.content;
    if (data.excerpt !== undefined) update.excerpt = data.excerpt;
    if (data.category !== undefined) update.category = data.category;
    if (data.tags !== undefined) update.tags = data.tags;
    if (data.order !== undefined) update.order = data.order;
    if (data.isFeatured !== undefined) update.isFeatured = data.isFeatured;
    if (data.isPublished !== undefined) {
      update.isPublished = data.isPublished;
      update.publishedAt = data.isPublished ? new Date() : null;
    }

    const article = await KnowledgeArticle.findByIdAndUpdate(id, update, { new: true });
    return article;
  }

  async deleteArticle(id) {
    return KnowledgeArticle.findByIdAndDelete(id);
  }

  async rateArticle(id, helpful) {
    const update = helpful
      ? { $inc: { helpfulCount: 1 } }
      : { $inc: { notHelpfulCount: 1 } };

    return KnowledgeArticle.findByIdAndUpdate(id, update, { new: true });
  }

  async getCategories() {
    const cats = await KnowledgeArticle.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const labelMap = {
      getting_started: 'بداية الاستخدام',
      account: 'الحساب',
      store_setup: 'إعداد المتجر',
      products: 'المنتجات',
      orders: 'الطلبات',
      payments: 'المدفوعات',
      shipping: 'الشحن',
      digital_delivery: 'التسليم الرقمي',
      subscription: 'الاشتراكات',
      billing: 'الفواتير',
      troubleshooting: 'حل المشكلات',
      integrations: 'التكاملات',
      api: 'API',
      security: 'الأمان',
      general: 'عام',
    };

    return cats.map((c) => ({
      id: c._id,
      label: labelMap[c._id] || c._id,
      count: c.count,
    }));
  }
}

module.exports = new KnowledgeService();
