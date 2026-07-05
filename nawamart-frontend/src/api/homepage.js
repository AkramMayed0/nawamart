import api from './axios'

export const getSections = (storeId) => api.get(`/homepage/${storeId}`)
export const getPublicSections = (storeId) => api.get(`/homepage/public/${storeId}`)
export const createSection = (storeId, data) => api.post(`/homepage/${storeId}`, data)
export const updateSection = (storeId, sectionId, data) => api.put(`/homepage/${storeId}/${sectionId}`, data)
export const reorderSections = (storeId, orders) => api.put(`/homepage/${storeId}/reorder`, { orders })
export const toggleSection = (storeId, sectionId) => api.put(`/homepage/${storeId}/${sectionId}/toggle`)
export const deleteSection = (storeId, sectionId) => api.delete(`/homepage/${storeId}/${sectionId}`)
