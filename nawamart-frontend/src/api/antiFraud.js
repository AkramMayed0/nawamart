import api from './axios'

export const listReturnRisks = (params = {}) => api.get('/anti-fraud/returns', { params })
export const createReturnRisk = (data) => api.post('/anti-fraud/returns', data)
export const checkReturnRisk = (data) => api.post('/anti-fraud/check', data)
