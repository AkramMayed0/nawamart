import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import { refreshAuthToken } from './auth'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

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
  async (error) => {
    if (!error.response) {
      toast.error('تعذر الاتصال بالخادم، تحقق من الإنترنت')
      return Promise.reject({ status: 0, message: 'تعذر الاتصال بالخادم' })
    }

    const status = error.response.status
    const message = error.response?.data?.message || 'حدث خطأ غير متوقع'

    if (status === 401) {
      const isAdminRoute = window.location.pathname.startsWith('/admin')
      const originalRequest = error.config

      if (isAdminRoute) {
        useAdminStore.getState().logout()
        toast.error('انتهت جلسة المشرف، يرجى تسجيل الدخول مجددا')
        return Promise.reject({ status, message, data: error.response?.data, original: error })
      }

      if (!originalRequest._retry && !originalRequest.url?.includes('/auth/refresh-token')) {
        const refreshToken = useAuthStore.getState().refreshToken
        if (refreshToken && !isRefreshing) {
          originalRequest._retry = true
          isRefreshing = true

          try {
            const res = await refreshAuthToken(refreshToken)
            const { token: newToken, refreshToken: newRefreshToken, user } = res.data.data
            useAuthStore.getState().login(newToken, user, newRefreshToken)
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            processQueue(null, newToken)
            return api(originalRequest)
          } catch (refreshError) {
            processQueue(refreshError)
            useAuthStore.getState().logout()
            toast.error('انتهت الجلسة، يرجى تسجيل الدخول مجددا')
            return Promise.reject({ status: 401, message: 'انتهت الجلسة', data: null, original: refreshError })
          } finally {
            isRefreshing = false
          }
        } else if (refreshToken && isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          }).catch((err) => {
            return Promise.reject(err)
          })
        } else {
          // No refresh token available
          useAuthStore.getState().logout()
          toast.error('انتهت الجلسة، يرجى تسجيل الدخول مجددا')
          return Promise.reject({ status, message, data: error.response?.data, original: error })
        }
      } else {
        // Already retried or it was the refresh-token endpoint itself
        useAuthStore.getState().logout()
        toast.error('انتهت الجلسة، يرجى تسجيل الدخول مجددا')
      }
    } else if (status === 403) {
      toast.error(error.response?.data?.message || 'ليس لديك صلاحية للقيام بهذا الإجراء')
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
