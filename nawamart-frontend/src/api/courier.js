import api from './axios'

export const listCouriers = (params = {}) => api.get('/courier/couriers', { params })
export const createCourier = (data) => api.post('/courier/couriers', data)
export const listDispatches = (params = {}) => api.get('/courier/dispatches', { params })
export const assignDispatch = (data) => api.post('/courier/dispatches', data)
export const sendToPool = (data) => api.post('/courier/pool', data)

// Unauthenticated / Courier App API endpoints
export const getCourierPortalAvailable = (courierId) => api.get(`/courier/portal/${courierId}/available`)
export const acceptCourierTask = (courierId, data) => api.post(`/courier/portal/${courierId}/accept`, data)
export const getCourierPortalTasks = (courierId) => api.get(`/courier/portal/${courierId}/tasks`)
export const updateCourierTaskStatus = (courierId, dispatchId, status) => api.put(`/courier/portal/${courierId}/tasks/${dispatchId}`, { status })
