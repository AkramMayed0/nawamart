import api from './axios'

export const createOrder     = (data) => api.post('/orders', data)
export const getMerchantOrders = () => api.get('/orders/merchant')
export const getOrderById    = (id) => api.get(`/orders/${id}`)
export const confirmOrder    = (id) => api.put(`/orders/${id}/confirm`)
export const rejectOrder     = (id, reason) => api.put(`/orders/${id}/reject`, { reason })
export const shipOrder       = (id, tracking) => api.put(`/orders/${id}/ship`, { tracking })
export const deliverOrder    = (id) => api.put(`/orders/${id}/deliver`)
export const uploadWasl      = (orderId, formData) =>
  api.post(`/upload/wasl/${orderId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// Upload wasl before order is created (returns { url, publicId })
export const uploadWaslFile  = (formData) =>
  api.post('/upload/wasl', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// ── Chat ──
export const getChatMessages = (chatId) => api.get(`/chats/${chatId}`)
export const sendMessage     = (chatId, data) => api.post(`/chats/${chatId}/message`, data)
export const getMerchantChats = () => api.get('/chats')
