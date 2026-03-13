// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/auth'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Debug auth state
  useEffect(() => {
    console.log('🔐 Auth State:', {
      user,
      token: token ? '***' : null,
      isAuthenticated: !!user,
      role: user?.role,
      isAdmin: user?.role?.toLowerCase() === 'admin'
    })
  }, [user, token])

  // Load user when token changes
  useEffect(() => {
    if (token) {
      loadUser()
    } else {
      setUser(null)
      setLoading(false)
    }
  }, [token])

  const loadUser = async () => {
    try {
      setLoading(true)
      console.log('📥 Loading user profile...')
      
      const response = await authApi.getMe()
      console.log('📦 Raw API Response:', response)
      
      // Extract user data from different response structures
      let userData = null
      
      if (response?.data?.user) {
        // Structure: { data: { user: {...} } }
        userData = response.data.user
      } else if (response?.user) {
        // Structure: { user: {...} }
        userData = response.user
      } else if (response?.data) {
        // Structure: { data: {...} } - assume data is user
        userData = response.data
      } else if (response && typeof response === 'object') {
        // Structure: {...} - response itself is user
        userData = response
      }
      
      console.log('👤 Extracted user data:', userData)
      
      if (userData && Object.keys(userData).length > 0) {
        setUser(userData)
        // Store user in localStorage for quick access
        localStorage.setItem('user', JSON.stringify(userData))
      } else {
        console.error('❌ User data is empty or invalid')
        throw new Error('Invalid user data')
      }
    } catch (error) {
      console.error('❌ Failed to load user:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      console.log('🔑 Login attempt:', credentials.username)
      
      const response = await authApi.login(credentials)
      console.log('📦 Login response:', response)
      
      // Extract token and user from different response structures
      let token = null
      let userData = null
      
      if (response?.data?.token && response?.data?.user) {
        // Structure: { data: { token, user } }
        token = response.data.token
        userData = response.data.user
      } else if (response?.token && response?.user) {
        // Structure: { token, user }
        token = response.token
        userData = response.user
      } else if (response?.data?.token) {
        // Structure: { data: { token } } - user might be separate
        token = response.data.token
        userData = response.data.user || response.data
      }
      
      if (!token || !userData) {
        console.error('❌ Invalid login response structure:', response)
        throw new Error('Invalid server response')
      }
      
      // Store token and user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setToken(token)
      setUser(userData)
      
      toast.success('Đăng nhập thành công!')
      return { success: true }
    } catch (error) {
      console.error('❌ Login error:', error)
      const message = error.response?.data?.message || error.message || 'Đăng nhập thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      console.log('📝 Register attempt:', userData.username)
      
      const response = await authApi.register(userData)
      console.log('📦 Register response:', response)
      
      // Similar extraction logic as login
      let token = null
      let newUser = null
      
      if (response?.data?.token && response?.data?.user) {
        token = response.data.token
        newUser = response.data.user
      } else if (response?.token && response?.user) {
        token = response.token
        newUser = response.user
      }
      
      if (!token || !newUser) {
        throw new Error('Invalid server response')
      }
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(newUser))
      setToken(token)
      setUser(newUser)
      
      toast.success('Đăng ký thành công!')
      return { success: true }
    } catch (error) {
      console.error('❌ Register error:', error)
      const message = error.response?.data?.message || error.message || 'Đăng ký thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    toast.success('Đăng xuất thành công')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && Object.keys(user).length > 0,
    isAdmin: user?.role?.toLowerCase() === 'admin',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}