import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// ── Request interceptor: attach JWT ──
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: normalize errors ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const message = error?.response?.data?.message || 'حدث خطأ غير متوقع'

    if (status === 401) {
      // Token expired / invalid → logout
      useAuthStore.getState().logout()
      toast.error('انتهت الجلسة، يرجى تسجيل الدخول مجدداً')
      window.location.href = '/merchant/login'
    } else if (status === 403) {
      toast.error('ليس لديك صلاحية للقيام بهذا الإجراء')
    } else if (status === 404) {
      // Let caller handle 404s
    } else if (status >= 500) {
      toast.error('خطأ في الخادم، يرجى المحاولة لاحقاً')
    }

    return Promise.reject({
      status,
      message,
      data: error?.response?.data,
      original: error,
    })
  }
)

export default api
