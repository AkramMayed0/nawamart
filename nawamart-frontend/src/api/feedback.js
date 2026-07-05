import api from './axios'
import { useAdminStore } from '@/store/adminStore'

function withAdminAuth(config = {}) {
  const token = useAdminStore.getState().token
  if (!token) return config
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    },
  }
}

export const submitFeedback = (data) =>
  api.post('/support/feedback', data, withAdminAuth())

export const getAllFeedback = (params = {}) =>
  api.get('/support/feedback', withAdminAuth({ params }))

export const getFeatureRequests = (params = {}) =>
  api.get('/support/feedback/feature-requests', { params })

export const voteFeatureRequest = (id) =>
  api.post(`/support/feedback/feature-requests/${id}/vote`, {}, withAdminAuth())

export const unvoteFeatureRequest = (id) =>
  api.delete(`/support/feedback/feature-requests/${id}/vote`, withAdminAuth())

export const updateFeatureRequestStatus = (id, status, adminResponse) =>
  api.patch(`/support/feedback/feature-requests/${id}/status`, { status, adminResponse }, withAdminAuth())

export const getNPSReport = () =>
  api.get('/support/feedback/nps-report', withAdminAuth())

export const getRecentFeedback = (limit = 20) =>
  api.get('/support/feedback/recent', withAdminAuth({ params: { limit } }))

export const getFeedbackStats = () =>
  api.get('/support/feedback/stats', withAdminAuth())
