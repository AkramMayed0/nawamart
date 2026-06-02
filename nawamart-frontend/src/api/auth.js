import api from './axios'

// ── Merchant Auth ──
export const merchantRegister = (data) =>
  api.post('/auth/merchant/register', data)

export const merchantLogin = (data) =>
  api.post('/auth/merchant/login', data)

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

