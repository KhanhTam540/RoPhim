import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import { userApi } from '../api/auth'
import { motion } from 'framer-motion'
import { FaUser, FaEnvelope, FaLock, FaCamera } from 'react-icons/fa'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    })
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await userApi.updateProfile(formData)
      toast.success('Cập nhật thông tin thành công')
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }

    setLoading(true)

    try {
      await userApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      toast.success('Đổi mật khẩu thành công')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      console.error('Error changing password:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được quá 5MB')
      return
    }

    setAvatarLoading(true)

    try {
      const response = await userApi.uploadAvatar(file)
      toast.success('Cập nhật ảnh đại diện thành công')
      // Refresh user data
      window.location.reload()
    } catch (error) {
      console.error('Error uploading avatar:', error)
    } finally {
      setAvatarLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Hồ sơ - RoPhim</title>
      </Helmet>

      <div className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-2xl font-bold mb-6">Hồ sơ của tôi</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Avatar section */}
            <div className="md:col-span-1">
              <div className="bg-rophim-card rounded-lg p-6 text-center">
                <div className="relative inline-block">
                  {user?.avatar ? (
                    <img
                      src={`${import.meta.env.VITE_IMAGE_URL}/${user.avatar}`}
                      alt={user.fullName}
                      className="w-32 h-32 rounded-full object-cover border-4 border-rophim-border"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-blue-600 mx-auto flex items-center justify-center text-4xl font-bold border-4 border-rophim-border">
                      {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-rophim-card hover:bg-rophim-hover p-2 rounded-full cursor-pointer border border-rophim-border"
                  >
                    <FaCamera />
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={avatarLoading}
                    />
                  </label>
                </div>

                {avatarLoading && (
                  <p className="text-sm text-rophim-textSecondary mt-2">
                    Đang tải lên...
                  </p>
                )}

                <h2 className="text-xl font-bold mt-4">{user?.fullName}</h2>
                <p className="text-rophim-textSecondary">@{user?.username}</p>
                
                <button
                  onClick={logout}
                  className="btn-secondary w-full mt-4"
                >
                  Đăng xuất
                </button>
              </div>
            </div>

            {/* Info section */}
            <div className="md:col-span-2 space-y-6">
              {/* Profile form */}
              <div className="bg-rophim-card rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <FaUser className="mr-2" /> Thông tin cá nhân
                </h2>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email}
                      className="input-field bg-rophim-hover"
                      disabled
                    />
                    <p className="text-xs text-rophim-textSecondary mt-1">
                      Email không thể thay đổi
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Đang xử lý...' : 'Cập nhật thông tin'}
                  </button>
                </form>
              </div>

              {/* Change password form */}
              <div className="bg-rophim-card rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <FaLock className="mr-2" /> Đổi mật khẩu
                </h2>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mật khẩu hiện tại
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="input-field"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default ProfilePage