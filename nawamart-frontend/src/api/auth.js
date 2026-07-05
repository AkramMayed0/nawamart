import api from './axios'

// ── Merchant Auth ──
export const merchantRegister = (data) =>
  api.post('/auth/merchant/register', data)

export const merchantLogin = (data) =>
  api.post('/auth/merchant/login', data)

export const merchantMfaVerify = (data) =>
  api.post('/auth/merchant/mfa-verify', data)

// ── Customer Auth ──
export const customerRegister = (data) =>
  api.post('/auth/customer/register', data)

export const customerLogin = (data) =>
  api.post('/auth/customer/login', data)

// ── Admin Auth ──
export const adminLogin = (data) =>
  api.post('/admin/login', data)

// ── Google Auth ──
export const merchantLoginGoogle = (data) =>
  api.post('/auth/merchant/google', data)

export const customerLoginGoogle = (data) =>
  api.post('/auth/customer/google', data)

// ── Password Reset ──
export const forgotPassword = (role, email) =>
  api.post(`/auth/${role}/forgot-password`, { email })

export const resetPassword = (role, token, password) =>
  api.post(`/auth/${role}/reset-password/${token}`, { password })

// ── Admin Password Reset ──
export const adminForgotPassword = (email) =>
  api.post('/admin/forgot-password', { email })

export const adminResetPassword = (token, password) =>
  api.post(`/admin/reset-password/${token}`, { password })

// ── Profile ──
export const getProfile = () =>
  api.get('/auth/me')

export const updateProfile = (data) =>
  api.put('/auth/me', data)

// ── Session / Token ──
export const refreshAuthToken = (refreshToken) =>
  api.post('/auth/refresh-token', { refreshToken })

export const listSessions = () =>
  api.get('/auth/sessions')

export const revokeSession = (sessionId) =>
  api.delete(`/auth/sessions/${sessionId}`)

// ── MFA ──
export const getMfaStatus = () =>
  api.get('/mfa/status')

export const generateMfaSecret = () =>
  api.post('/mfa/generate')

export const verifyAndEnableMfa = (code) =>
  api.post('/mfa/verify-enable', { code })

export const disableMfa = (code) =>
  api.post('/mfa/disable', { code })

export const regenerateBackupCodes = () =>
  api.post('/mfa/regenerate-backup-codes')

// ── Staff (RBAC) ──
export const getStaffList = (storeId) =>
  api.get(`/staff/${storeId}`)

export const addStaff = (storeId, data) =>
  api.post(`/staff/${storeId}`, data)

export const updateStaff = (storeId, staffId, data) =>
  api.patch(`/staff/${storeId}/${staffId}`, data)

export const removeStaff = (storeId, staffId) =>
  api.delete(`/staff/${storeId}/${staffId}`)

export const getMyStaffStores = () =>
  api.get('/staff/my-stores')

// ── Activity Log ──
export const listActivity = (storeId, action = '') =>
  api.get(`/activity/${storeId}${action ? `?action=${action}` : ''}`)
