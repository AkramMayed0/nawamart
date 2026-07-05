const express = require('express');
const router = express.Router();
const {
  createArticle,
  getArticles,
  getArticleBySlug,
  getArticleById,
  updateArticle,
  deleteArticle,
  rateArticle,
  getCategories,
} = require('../controllers/knowledge.controller');
const { verifyAdmin } = require('../middleware/verifyAdmin');

router.get('/categories', getCategories);
router.get('/slug/:slug', getArticleBySlug);
router.get('/', getArticles);
router.get('/:id', getArticleById);

router.post('/', verifyAdmin, createArticle);
router.put('/:id', verifyAdmin, updateArticle);
router.delete('/:id', verifyAdmin, deleteArticle);
router.post('/:id/rate', rateArticle);

module.exports = router;
