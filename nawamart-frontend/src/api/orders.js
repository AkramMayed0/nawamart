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

export const uploadWasl      = (orderId, formData) =>
  customerApi.post(`/upload/wasl/${orderId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// ── Customer Operations — Listing ──
export const getCustomerOrders = (params = {}) => customerApi.get('/orders/customer', { params })

// ── Merchant Operations (uses merchant token) ──
export const getMerchantOrders = (params = {}) => api.get('/orders/merchant', { params })
export const confirmOrder    = (id) => api.put(`/orders/${id}/confirm`)
export const rejectOrder     = (id, reason) => api.put(`/orders/${id}/reject`, { reason })
export const shipOrder       = (id, tracking) => api.put(`/orders/${id}/ship`, { tracking })
export const deliverOrder    = (id) => api.put(`/orders/${id}/deliver`)
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
