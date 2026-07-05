import api from './axios'

export const getAssets = (storeId, params) => api.get(`/theme-assets/${storeId}`, { params })
export const getFolders = (storeId) => api.get(`/theme-assets/folders/${storeId}`)
export const uploadAsset = (storeId, formData) =>
  api.post(`/theme-assets/${storeId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const updateAsset = (storeId, assetId, data) => api.put(`/theme-assets/${storeId}/${assetId}`, data)
export const deleteAsset = (storeId, assetId) => api.delete(`/theme-assets/${storeId}/${assetId}`)
