import api from './axios'
import { useAdminStore } from '@/store/adminStore'

function withAdminAuth(config = {}) {
  const token = useAdminStore.getState().token
  return {
    ...config,
    headers: {
      ...config.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
}

export const getArticles = (params = {}) =>
  api.get('/support/knowledge', { params })

export const getArticleBySlug = (slug) =>
  api.get(`/support/knowledge/slug/${slug}`)

export const getArticleById = (id) =>
  api.get(`/support/knowledge/${id}`)

export const createArticle = (data) =>
  api.post('/support/knowledge', data, withAdminAuth())

export const updateArticle = (id, data) =>
  api.put(`/support/knowledge/${id}`, data, withAdminAuth())

export const deleteArticle = (id) =>
  api.delete(`/support/knowledge/${id}`, withAdminAuth())

export const rateArticle = (id, helpful) =>
  api.post(`/support/knowledge/${id}/rate`, { helpful })

export const getCategories = () =>
  api.get('/support/knowledge/categories')
