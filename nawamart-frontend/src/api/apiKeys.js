import api from './axios'
export const listApiKeys = (storeId, params) => api.get(`/api-keys/${storeId}`, { params })
export const createApiKey = (storeId, data) => api.post(`/api-keys/${storeId}`, data)
export const updateApiKey = (id, data) => api.put(`/api-keys/${id}`, data)
export const deleteApiKey = (id) => api.delete(`/api-keys/${id}`)
export const rotateApiKey = (id) => api.post(`/api-keys/${id}/rotate`)
export const getApiKeyScopes = () => api.get('/api-keys/scopes')
