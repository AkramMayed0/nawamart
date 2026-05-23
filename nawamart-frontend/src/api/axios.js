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
    // Network / timeout — no response object at all
    if (!error.response) {
      toast.error('تعذر الاتصال بالخادم، تحقق من الإنترنت')
      return Promise.reject({ status: 0, message: 'تعذر الاتصال بالخادم' })
    }

    const status  = error.response.status
    const message = error.response?.data?.message || 'حدث خطأ غير متوقع'

    if (status === 401) {
      // Only auto-logout + redirect for merchant/customer sessions
      // Admin login failures must NOT redirect — admin has its own flow
      const isAdminRoute = window.location.pathname.startsWith('/admin')
      if (!isAdminRoute) {
        useAuthStore.getState().logout()
        toast.error('انتهت الجلسة، يرجى تسجيل الدخول مجدداً')
        window.location.href = '/merchant/login'
      }
    } else if (status === 403) {
      toast.error('ليس لديك صلاحية للقيام بهذا الإجراء')
    } else if (status === 404) {
      // Caller handles 404 — we just normalize the error shape
    } else if (status >= 500) {
      toast.error('حدث خطأ، حاول مجدداً')
    }

    return Promise.reject({
      status,
      message,
      data: error.response?.data,
      original: error,
    })
  }
)

export default api
