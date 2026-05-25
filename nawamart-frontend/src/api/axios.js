import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token

    config.headers = config.headers ?? {}
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
      delete config.headers['content-type']
    }

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('تعذر الاتصال بالخادم، تحقق من الإنترنت')
      return Promise.reject({ status: 0, message: 'تعذر الاتصال بالخادم' })
    }

    const status = error.response.status
    const message = error.response?.data?.message || 'حدث خطأ غير متوقع'
    const isAdminRoute = window.location.pathname.startsWith('/admin')

    if (status === 401) {
      if (isAdminRoute && window.location.pathname !== '/admin/login') {
        useAdminStore.getState().logout()
        toast.error('انتهت جلسة المشرف، يرجى تسجيل الدخول مجددا')
        window.location.href = '/admin/login'
      } else if (!isAdminRoute) {
        useAuthStore.getState().logout()
        toast.error('انتهت الجلسة، يرجى تسجيل الدخول مجددا')
        window.location.href = '/merchant/login'
      }
    } else if (status === 403) {
      toast.error('ليس لديك صلاحية للقيام بهذا الإجراء')
    } else if (status >= 500) {
      toast.error('حدث خطأ، حاول مجددا')
    }

    return Promise.reject({
      status,
      message,
      data: error.response?.data,
      original: error,
    })
  },
)

export default api
