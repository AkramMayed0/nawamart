import api from './axios'

export const getWalletBalance = () => api.get('/wallet/balance')

export const getWalletLedger = () => api.get('/wallet/ledger')
