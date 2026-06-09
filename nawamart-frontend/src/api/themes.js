import api from './axios'

export const getThemes = (params) => api.get('/themes', { params })
export const getThemeBySlug = (slug) => api.get(`/themes/${slug}`)
export const getThemeCategories = () => api.get('/themes/categories')
export const installTheme = (storeId, themeId) => api.post(`/themes/${storeId}/install`, { themeId })
export const uninstallTheme = (storeId) => api.post(`/themes/${storeId}/uninstall`)
