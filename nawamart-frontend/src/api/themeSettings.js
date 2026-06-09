import api from './axios'

export const getThemeSettings = (storeId) => api.get(`/theme-settings/${storeId}`)
export const getPublicThemeSettings = (storeId) => api.get(`/theme-settings/public/${storeId}`)
export const updateColors = (storeId, data) => api.put(`/theme-settings/${storeId}/colors`, data)
export const updateFonts = (storeId, data) => api.put(`/theme-settings/${storeId}/fonts`, data)
export const updateLayout = (storeId, data) => api.put(`/theme-settings/${storeId}/layout`, data)
export const updateSpacing = (storeId, data) => api.put(`/theme-settings/${storeId}/spacing`, data)
export const updateCustomCss = (storeId, css) => api.put(`/theme-settings/${storeId}/css`, { css })
export const updateCustomHtml = (storeId, data) => api.put(`/theme-settings/${storeId}/html`, data)
export const resetThemeSettings = (storeId) => api.post(`/theme-settings/${storeId}/reset`)
