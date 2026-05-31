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

// ── Profile ──
export const getProfile = () =>
  api.get('/auth/me')

export const updateProfile = (data) =>
  api.put('/auth/me', data)

