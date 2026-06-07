import api from './axios'

export const getMyFeatures = (params = {}) => api.get('/features/my', { params })
