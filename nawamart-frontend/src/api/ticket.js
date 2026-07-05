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

export const createTicket = (data) =>
  api.post('/support/tickets', data, withAdminAuth())

export const getTickets = (params = {}) =>
  api.get('/support/tickets', withAdminAuth({ params }))

export const getTicketById = (id) =>
  api.get(`/support/tickets/${id}`, withAdminAuth())

export const addTicketMessage = (id, data) =>
  api.post(`/support/tickets/${id}/messages`, data, withAdminAuth())

export const changeTicketStatus = (id, status) =>
  api.patch(`/support/tickets/${id}/status`, { status }, withAdminAuth())

export const assignTicket = (id, adminId) =>
  api.patch(`/support/tickets/${id}/assign`, { adminId }, withAdminAuth())

export const addInternalNote = (id, content) =>
  api.post(`/support/tickets/${id}/notes`, { content }, withAdminAuth())

export const rateTicketSatisfaction = (id, score, comment) =>
  api.post(`/support/tickets/${id}/rate`, { score, comment }, withAdminAuth())

export const getTicketStats = () =>
  api.get('/support/tickets/stats', withAdminAuth())
