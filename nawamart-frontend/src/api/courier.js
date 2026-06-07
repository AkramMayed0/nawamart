import api from './axios'

export const listCouriers = (params = {}) => api.get('/courier/couriers', { params })
export const createCourier = (data) => api.post('/courier/couriers', data)
export const listDispatches = (params = {}) => api.get('/courier/dispatches', { params })
export const assignDispatch = (data) => api.post('/courier/dispatches', data)
