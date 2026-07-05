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

export const getAdminStats = () =>
  api.get('/admin/stats', withAdminAuth())

export const getAdminSession = () =>
  api.get('/admin/me', withAdminAuth())

export const getAdminSubscriptions = (status) =>
  api.get('/subscriptions', withAdminAuth({
    params: status && status !== 'all' ? { status } : {},
  }))

export const approveSubscription = (id) =>
  api.put(`/subscriptions/${id}/approve`, {}, withAdminAuth())

export const rejectSubscription = (id, reason) =>
  api.put(`/subscriptions/${id}/reject`, { reason }, withAdminAuth())

export const getAdminMerchants = (params = {}) =>
  api.get('/admin/merchants', withAdminAuth({ params }))

export const getAdminMerchantById = (id) =>
  api.get(`/admin/merchants/${id}`, withAdminAuth())

export const toggleMerchantActive = (id, days) =>
  api.patch(`/admin/merchants/${id}/toggle-active`, days ? { days } : {}, withAdminAuth())

export const getAdminStores = (params = {}) =>
  api.get('/admin/stores', withAdminAuth({ params }))

export const toggleStoreActive = (id, days) =>
  api.patch(`/admin/stores/${id}/toggle-active`, days ? { days } : {}, withAdminAuth())

export const setStorePlan = (id, plan, days) =>
  api.patch(`/admin/stores/${id}/set-plan`, { plan, days }, withAdminAuth())

export const getAdminOrders = (params = {}) =>
  api.get('/admin/orders', withAdminAuth({ params }))

export const getAdminCustomers = (params = {}) =>
  api.get('/admin/customers', withAdminAuth({ params }))

export const toggleCustomerActive = (id, days) =>
  api.patch(`/admin/customers/${id}/toggle-active`, days ? { days } : {}, withAdminAuth())

export const getFeatureFlags = () =>
  api.get('/admin/features', withAdminAuth())

export const createFeatureFlag = (data) =>
  api.post('/admin/features', data, withAdminAuth())

export const updateFeatureFlag = (id, data) =>
  api.put(`/admin/features/${id}`, data, withAdminAuth())

export const deleteFeatureFlag = (id) =>
  api.delete(`/admin/features/${id}`, withAdminAuth())

export const getChangelogEntries = () =>
  api.get('/admin/changelog', withAdminAuth())

export const createChangelogEntry = (data) =>
  api.post('/admin/changelog', data, withAdminAuth())

export const updateChangelogEntry = (id, data) =>
  api.put(`/admin/changelog/${id}`, data, withAdminAuth())

export const deleteChangelogEntry = (id) =>
  api.delete(`/admin/changelog/${id}`, withAdminAuth())
