import api from './axios'

export const getWhatsAppSettings = (params = {}) => api.get('/whatsapp/settings', { params })
export const updateWhatsAppSettings = (data) => api.put('/whatsapp/settings', data)
