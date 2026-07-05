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

export const createReport = (data) =>
  api.post('/reports', data, withAdminAuth())

export const getReports = (params = {}) =>
  api.get('/reports', withAdminAuth({ params }))

export const getReportById = (id) =>
  api.get(`/reports/${id}`, withAdminAuth())

export const updateReport = (id, data) =>
  api.put(`/reports/${id}`, data, withAdminAuth())

export const deleteReport = (id) =>
  api.delete(`/reports/${id}`, withAdminAuth())

export const generateReport = (id) =>
  api.get(`/reports/${id}/generate`, withAdminAuth())

export const sendReportNow = (id) =>
  api.post(`/reports/${id}/send`, {}, withAdminAuth())

export const toggleReportSchedule = (id) =>
  api.patch(`/reports/${id}/toggle-schedule`, {}, withAdminAuth())
