// src/api/api.js
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params)
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ Response: ${response.config.url}`, response.data)
    }
    
    // Handle different response structures
    if (response.data && response.data.success === false) {
      return Promise.reject(new Error(response.data.message || 'Request failed'))
    }
    
    // If response has data property, return that
    if (response.data && response.data.data !== undefined) {
      return response.data
    }
    
    // Otherwise return the whole response data
    return response.data
  },
  (error) => {
    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      toast.error('Kết nối quá thời gian. Vui lòng thử lại.')
      return Promise.reject(error)
    }
    
    // Handle network errors
    if (!error.response) {
      toast.error('Không thể kết nối đến server')
      return Promise.reject(error)
    }
    
    // Handle HTTP errors
    const status = error.response.status
    const message = error.response.data?.message || 'Có lỗi xảy ra'
    
    // Log error
    console.error(`❌ API Error ${status}:`, error.response.data)
    
    // Handle 401 Unauthorized
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.includes('/dang-nhap')) {
        toast.error('Phiên đăng nhập hết hạn')
        window.location.href = '/dang-nhap'
      }
      return Promise.reject(error)
    }
    
    // Handle 403 Forbidden
    if (status === 403) {
      toast.error('Bạn không có quyền thực hiện hành động này')
      return Promise.reject(error)
    }
    
    // Handle 404 Not Found
    if (status === 404) {
      toast.error('Không tìm thấy tài nguyên')
      return Promise.reject(error)
    }
    
    // Handle 500 Internal Server Error
    if (status >= 500) {
      toast.error('Lỗi server. Vui lòng thử lại sau')
      return Promise.reject(error)
    }
    
    // Show error message
    toast.error(message)
    
    return Promise.reject(error)
  }
)

export default api