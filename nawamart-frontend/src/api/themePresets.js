import api from './axios'

export const getPresets = (storeId) => api.get(`/theme-presets/${storeId}`)
export const getPublicPresets = () => api.get('/theme-presets/public')
export const savePreset = (storeId, data) => api.post(`/theme-presets/${storeId}`, data)
export const applyPreset = (storeId, presetId) => api.post(`/theme-presets/${storeId}/apply`, { presetId })
export const togglePresetPublic = (storeId, presetId) => api.put(`/theme-presets/${storeId}/${presetId}/toggle`)
export const deletePreset = (storeId, presetId) => api.delete(`/theme-presets/${storeId}/${presetId}`)
