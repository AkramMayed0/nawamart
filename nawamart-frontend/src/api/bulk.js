import api from './axios'
export const bulkArchive     = (data) => api.post('/bulk/archive', data)
export const bulkDelete      = (data) => api.post('/bulk/delete', data)
export const bulkUpdatePrice = (data) => api.post('/bulk/update-price', data)
export const bulkUpdateStock = (data) => api.post('/bulk/update-stock', data)
