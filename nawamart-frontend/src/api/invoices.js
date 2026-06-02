import api from './axios'

export const getMyInvoices = () => api.get('/invoices/my')
