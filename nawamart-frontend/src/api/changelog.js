import api from './axios'

export const getChangelog = (params = {}) => api.get('/changelog', { params })
export const getChangelogEntry = (id) => api.get(`/changelog/${id}`)
