import api from './axios'

export const createStore   = (data) => api.post('/stores', data)
export const getMyStore    = ()     => api.get('/stores/my')
export const getStoreBySlug= (slug) => api.get(`/stores/${slug}`)
export const updateStore   = (id, data) => api.put(`/stores/${id}`, data)
