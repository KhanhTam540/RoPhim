// src/components/admin/AdminHeader.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBars, FaBell, FaUser, FaSearch, FaCog, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { getAvatarUrl } from '../../utils/imageUtils'

const AdminHeader = ({ toggleSidebar }) => {
  const { user, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = () => {
    logout()
    window.location.href = '/dang-nhap'
  }

  const avatarUrl = user?.avatar ? getAvatarUrl(user.avatar) : null

  return (
    <header className="bg-rophim-card border-b border-rophim-border h-16 fixed top-0 right-0 left-0 lg:left-64 z-20">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-400 hover:text-white"
            aria-label="Toggle sidebar"
          >
            <FaBars size={20} />
          </button>

          {/* Page title - có thể thay đổi dựa vào route */}
          <h2 className="text-lg font-semibold hidden md:block">Dashboard</h2>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="hidden md:flex items-center bg-rophim-bg rounded-lg px-3 py-2">
            <FaSearch className="text-gray-400 mr-2" size={14} />
            <input
              type="text"
              placeholder="Tìm kiếm nhanh..."
              className="bg-transparent border-none focus:outline-none text-sm w-48 lg:w-64"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-gray-400 hover:text-white relative p-2 rounded-full hover:bg-rophim-hover"
              aria-label="Notifications"
            >
              <FaBell size={18} />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-rophim-card border border-rophim-border rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-rophim-border">
                  <h3 className="font-semibold text-sm">Thông báo</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-3 hover:bg-rophim-hover border-b border-rophim-border">
                    <p className="text-sm">Có bình luận mới trong phim "Ký Sinh Trùng"</p>
                    <p className="text-xs text-rophim-textSecondary mt-1">5 phút trước</p>
                  </div>
                  <div className="p-3 hover:bg-rophim-hover border-b border-rophim-border">
                    <p className="text-sm">Người dùng mới đăng ký</p>
                    <p className="text-xs text-rophim-textSecondary mt-1">1 giờ trước</p>
                  </div>
                  <div className="p-3 hover:bg-rophim-hover">
                    <p className="text-sm">Cập nhật phim mới: "Dune 2"</p>
                    <p className="text-xs text-rophim-textSecondary mt-1">3 giờ trước</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 group focus:outline-none"
              aria-label="User menu"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.fullName}
                  className="w-8 h-8 rounded-full object-cover border-2 border-transparent group-hover:border-red-500 transition-all"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                  <FaUser size={14} className="text-white" />
                </div>
              )}
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium">{user?.fullName || 'Admin'}</p>
                <p className="text-xs text-rophim-textSecondary">Quản trị viên</p>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-rophim-card border border-rophim-border rounded-lg shadow-lg z-50">
                <Link
                  to="/admin/profile"
                  className="block px-4 py-2 hover:bg-rophim-hover text-sm"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <div className="flex items-center space-x-2">
                    <FaUser size={12} />
                    <span>Thông tin cá nhân</span>
                  </div>
                </Link>
                <Link
                  to="/admin/settings"
                  className="block px-4 py-2 hover:bg-rophim-hover text-sm"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <div className="flex items-center space-x-2">
                    <FaCog size={12} />
                    <span>Cài đặt</span>
                  </div>
                </Link>
                <hr className="border-rophim-border my-1" />
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-rophim-hover text-sm text-red-500"
                >
                  <div className="flex items-center space-x-2">
                    <FaSignOutAlt size={12} />
                    <span>Đăng xuất</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader