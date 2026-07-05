import api from './axios'

export const createProduct       = (data) => api.post('/products', data)
export const getProductsByStore  = (storeId, params) => api.get(`/products/store/${storeId}`, { params })
export const getMerchantProducts = (params) => api.get('/products/merchant', { params })
export const getProductById      = (id) => api.get(`/products/${id}`)
export const updateProduct       = (id, data) => api.put(`/products/${id}`, data)
export const deleteProduct       = (id) => api.delete(`/products/${id}`)

