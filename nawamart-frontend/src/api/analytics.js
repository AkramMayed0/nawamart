import api from './axios'
import { useAdminStore } from '@/store/adminStore'

function withAdminAuth(config = {}) {
  const token = useAdminStore.getState().token
  return {
    ...config,
    headers: {
      ...config.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
}

export const getPlatformMetrics = (type = 'daily', limit = 30) =>
  api.get('/analytics/platform/metrics', withAdminAuth({ params: { type, limit } }))

export const getPlatformOverview = () =>
  api.get('/analytics/platform/overview', withAdminAuth())

export const refreshMetrics = (type = 'daily') =>
  api.post('/analytics/platform/refresh', { type }, withAdminAuth())

export const getRevenueAnalytics = (params = {}) =>
  api.get('/analytics/revenue', withAdminAuth({ params }))

export const getHealthScores = (params = {}) =>
  api.get('/analytics/health', withAdminAuth({ params }))

export const getHealthOverview = () =>
  api.get('/analytics/health/overview', withAdminAuth())

export const getMerchantHealth = (id) =>
  api.get(`/analytics/health/${id}`, withAdminAuth())

export const getUsageMetrics = () =>
  api.get('/analytics/usage', withAdminAuth())

export const getFeatureAdoption = () =>
  api.get('/analytics/features', withAdminAuth())

export const getMetricHistory = (params = {}) =>
  api.get('/analytics/history', withAdminAuth({ params }))
