import api from './axios'
export const globalSearch = (q, storeId) => api.get('/search', { params: { q, storeId } })
