import api from './axios'
import customerApi from './customerAxios'
import { useAuthStore } from '@/store/authStore'
import { useCustomerAuthStore } from '@/store/customerAuthStore'

// ── Customer Operations (uses customer token) ──
export const createOrder     = (data) => customerApi.post('/orders', data)

// Upload wasl before order is created (returns { url, publicId })
export const uploadWaslFile  = (formData) =>
  customerApi.post('/upload/wasl', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// ── Customer Operations — Listing ──
export const getCustomerOrders = (params = {}) => customerApi.get('/orders/customer', { params })

// ── Merchant Operations (uses merchant token) ──
export const getMerchantOrders = (params = {}) => api.get('/orders/merchant', { params })
export const exportOrdersCsv = (params) => api.get('/export/orders', { params, responseType: 'blob' })
export const exportProductsCsv = (params) => api.get('/export/products', { params, responseType: 'blob' })
export const exportCustomersCsv = (params) => api.get('/export/customers', { params, responseType: 'blob' })
export const confirmOrder    = (id) => api.put(`/orders/${id}/confirm`)
export const rejectOrder     = (id, reason) => api.put(`/orders/${id}/reject`, { reason })
export const shipOrder       = (id, tracking) => api.put(`/orders/${id}/ship`, { tracking })
export const deliverOrder    = (id) => api.put(`/orders/${id}/deliver`)
export const processOrder    = (id) => api.put(`/orders/${id}/process`)
export const cancelOrder     = (id, reason) => api.post(`/orders/${id}/cancel`, { reason })
export const returnOrder     = (id, reason) => api.post(`/orders/${id}/return`, { reason })
export const fulfillOrder    = (id, data) => api.post(`/orders/${id}/fulfill`, data)
export const getFulfillments = (id) => api.get(`/orders/${id}/fulfillments`)
export const capturePayment  = (id) => api.post(`/orders/${id}/capture-payment`)
export const refundOrder     = (id, data) => api.post(`/orders/${id}/refund`, data)
export const addOrderNote    = (id, data) => api.post(`/orders/${id}/notes`, data)
export const getOrderNotes   = (id, params) => api.get(`/orders/${id}/notes`, { params })
export const editOrder       = (id, data) => api.put(`/orders/${id}/edit`, data)
export const generatePackingSlip = (id) => api.post(`/orders/${id}/packing-slip`)
export const bulkOrders      = (data) => api.post('/orders/bulk', data)
export const exportOrdersApi = (params) => api.get('/orders/export', { params })
export const getMerchantChats = () => api.get('/chats')

// ── Shared / Public (uses default merchant token by convention) ──
export const getOrderById    = (id) => {
  const customerToken = useCustomerAuthStore.getState().token
  const merchantToken = useAuthStore.getState().token
  const token = customerToken || merchantToken
  return api.get(`/orders/${id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
}
export const getChatMessages = (chatId) => api.get(`/chats/${chatId}`)
export const sendMessage     = (chatId, data) => api.post(`/chats/${chatId}/message`, data)
