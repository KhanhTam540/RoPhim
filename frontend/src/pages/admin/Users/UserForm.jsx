// src/pages/admin/Users/UserForm.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FaSave, FaTimes, FaUserPlus } from 'react-icons/fa'
import { adminUserApi } from '../../../api/admin'
import toast from 'react-hot-toast'

const UserForm = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'user',
    isActive: true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username không được để trống'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username phải có ít nhất 3 ký tự'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username chỉ được chứa chữ, số và dấu gạch dưới'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }
    
    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Vui lòng kiểm tra lại thông tin')
      return
    }

    setSaving(true)

    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...submitData } = formData
      
      console.log('📦 Creating user with data:', submitData)
      
      await adminUserApi.createUser(submitData)
      toast.success('Thêm người dùng thành công')
      navigate('/admin/users')
    } catch (error) {
      console.error('Error creating user:', error)
      
      let errorMessage = 'Không thể thêm người dùng'
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage
        
        // Handle validation errors from server
        if (error.response.data?.errors) {
          setErrors(error.response.data.errors)
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Thêm người dùng mới - RoPhim Admin</title>
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <FaUserPlus className="text-2xl text-blue-500" />
          <h1 className="text-2xl font-bold">Thêm người dùng mới</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-rophim-card rounded-lg p-6 space-y-4 border border-rophim-border">
            <h2 className="text-lg font-semibold">Thông tin cá nhân</h2>

            <div>
              <label className="block text-sm font-medium mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`input-field ${errors.fullName ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="Nguyễn Văn A"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`input-field ${errors.username ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="username"
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
                <p className="text-xs text-rophim-textSecondary mt-1">
                  Ít nhất 6 ký tự
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Vai trò
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-rophim-border bg-rophim-bg text-blue-600"
                  />
                  <span>Kích hoạt tài khoản</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="btn-secondary flex items-center space-x-2 px-6 py-2"
            >
              <FaTimes size={14} />
              <span>Hủy</span>
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center space-x-2 px-6 py-2"
            >
              <FaSave size={14} />
              <span>{saving ? 'Đang lưu...' : 'Lưu'}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default UserForm