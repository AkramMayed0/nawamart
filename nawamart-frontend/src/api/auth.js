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

// ── Profile ──
export const getProfile = () =>
  api.get('/auth/me')

export const updateProfile = (data) =>
  api.put('/auth/me', data)
