import api from './axios'
export const listDiscounts       = (storeId, params) => api.get(`/discounts/${storeId}`, { params })
export const createDiscount      = (storeId, data) => api.post(`/discounts/${storeId}`, data)
export const updateDiscount      = (id, data) => api.put(`/discounts/${id}`, data)
export const deleteDiscount      = (id) => api.delete(`/discounts/${id}`)
export const validateDiscount    = (storeId, data) => api.post(`/discounts/${storeId}/validate`, data)
