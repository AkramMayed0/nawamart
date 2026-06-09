import api from './axios'

export const getPages = (storeId, params) => api.get(`/pages/${storeId}`, { params })
export const getPage = (storeId, id) => api.get(`/pages/${storeId}/${id}`)
export const createPage = (storeId, data) => api.post(`/pages/${storeId}`, data)
export const updatePage = (storeId, id, data) => api.put(`/pages/${storeId}/${id}`, data)
export const deletePage = (storeId, id) => api.delete(`/pages/${storeId}/${id}`)

export const addSection = (storeId, pageId, data) => api.post(`/pages/${storeId}/${pageId}/sections`, data)
export const updateSection = (storeId, pageId, sectionId, data) => api.put(`/pages/${storeId}/${pageId}/sections/${sectionId}`, data)
export const removeSection = (storeId, pageId, sectionId) => api.delete(`/pages/${storeId}/${pageId}/sections/${sectionId}`)
export const reorderSections = (storeId, pageId, order) => api.put(`/pages/${storeId}/${pageId}/sections/reorder`, { order })

export const addBlock = (storeId, pageId, sectionId, data) => api.post(`/pages/${storeId}/${pageId}/sections/${sectionId}/blocks`, data)
export const updateBlock = (storeId, pageId, sectionId, blockId, data) => api.put(`/pages/${storeId}/${pageId}/sections/${sectionId}/blocks/${blockId}`, data)
export const removeBlock = (storeId, pageId, sectionId, blockId) => api.delete(`/pages/${storeId}/${pageId}/sections/${sectionId}/blocks/${blockId}`)

export const getPublicPage = (storeId, slug) => api.get(`/pages/public/${storeId}/${slug}`)
