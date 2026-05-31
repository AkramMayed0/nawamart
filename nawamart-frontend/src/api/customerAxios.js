import axios from 'axios'
import toast from 'react-hot-toast'
import { useCustomerAuthStore } from '@/store/customerAuthStore'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const customerApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

customerApi.interceptors.request.use(
  (config) => {
    const token = useCustomerAuthStore.getState().token

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

customerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('تعذر الاتصال بالخادم، تحقق من الإنترنت')
      return Promise.reject({ status: 0, message: 'تعذر الاتصال بالخادم' })
    }

    const status = error.response.status
    const message = error.response?.data?.message || 'حدث خطأ غير متوقع'

    if (status === 401) {
      useCustomerAuthStore.getState().logout()
      toast.error('انتهت الجلسة، يرجى تسجيل الدخول مجددا')
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

export default customerApi
