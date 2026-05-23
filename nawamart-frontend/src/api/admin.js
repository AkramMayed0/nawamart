import api from './axios'

// Helper to get stored admin token
function adminHeaders() {
  try {
    const raw = localStorage.getItem('nawamart-admin')
    const token = JSON.parse(raw)?.state?.token ?? ''
    return { Authorization: `Bearer ${token}` }
  } catch {
    return {}
  }
}

// ── Stats ──────────────────────────────────────────────────────────────────────
export const getAdminStats = () =>
  api.get('/admin/stats', { headers: adminHeaders() })

// ── Subscriptions ──────────────────────────────────────────────────────────────
export const getAdminSubscriptions = (status) =>
  api.get('/subscriptions', {
    params: status && status !== 'all' ? { status } : {},
    headers: adminHeaders(),
  })

export const approveSubscription = (id) =>
  api.put(`/subscriptions/${id}/approve`, {}, { headers: adminHeaders() })

export const rejectSubscription = (id, reason) =>
  api.put(`/subscriptions/${id}/reject`, { reason }, { headers: adminHeaders() })

// ── Merchants ──────────────────────────────────────────────────────────────────
export const getAdminMerchants = (params = {}) =>
  api.get('/admin/merchants', { params, headers: adminHeaders() })

export const getAdminMerchantById = (id) =>
  api.get(`/admin/merchants/${id}`, { headers: adminHeaders() })

export const toggleMerchantActive = (id) =>
  api.patch(`/admin/merchants/${id}/toggle-active`, {}, { headers: adminHeaders() })

// ── Stores ─────────────────────────────────────────────────────────────────────
export const getAdminStores = (params = {}) =>
  api.get('/admin/stores', { params, headers: adminHeaders() })

export const toggleStoreActive = (id) =>
  api.patch(`/admin/stores/${id}/toggle-active`, {}, { headers: adminHeaders() })

export const setStorePlan = (id, plan, days) =>
  api.patch(`/admin/stores/${id}/set-plan`, { plan, days }, { headers: adminHeaders() })

// ── Orders ─────────────────────────────────────────────────────────────────────
export const getAdminOrders = (params = {}) =>
  api.get('/admin/orders', { params, headers: adminHeaders() })

// ── Customers ──────────────────────────────────────────────────────────────────
export const getAdminCustomers = (params = {}) =>
  api.get('/admin/customers', { params, headers: adminHeaders() })

export const toggleCustomerActive = (id) =>
  api.patch(`/admin/customers/${id}/toggle-active`, {}, { headers: adminHeaders() })
