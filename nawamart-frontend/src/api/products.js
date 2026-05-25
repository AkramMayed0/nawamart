import api from './axios'

export const createProduct       = (data) => api.post('/products', data)
export const getProductsByStore  = (storeId) => api.get(`/products/store/${storeId}`)
export const getProductById      = (id) => api.get(`/products/${id}`)
export const updateProduct       = (id, data) => api.put(`/products/${id}`, data)
export const deleteProduct       = (id) => api.delete(`/products/${id}`)
export const uploadProductImage  = (formData) =>
  api.post('/upload/product-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
