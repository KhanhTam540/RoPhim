import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBars, FaBell, FaUser, FaSearch } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'

const AdminHeader = ({ toggleSidebar }) => {
  const { user } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="bg-rophim-card border-b border-rophim-border h-16 fixed top-0 right-0 left-64 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <FaBars size={20} />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center bg-rophim-bg rounded-lg px-3 py-2">
            <FaSearch className="text-gray-400 mr-2" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="bg-transparent border-none focus:outline-none text-sm w-64"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-gray-400 hover:text-white relative"
            >
              <FaBell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-rophim-card border border-rophim-border rounded-lg shadow-lg">
                <div className="p-3 border-b border-rophim-border">
                  <h3 className="font-semibold">Thông báo</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 hover:bg-rophim-hover border-b border-rophim-border last:border-0">
                      <p className="text-sm">Có bình luận mới trong phim "Ký Sinh Trùng"</p>
                      <p className="text-xs text-rophim-textSecondary mt-1">5 phút trước</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3"
            >
              {user?.avatar ? (
                <img
                  src={`${import.meta.env.VITE_IMAGE_URL}/${user.avatar}`}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <FaUser size={14} />
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs text-rophim-textSecondary">Administrator</p>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-rophim-card border border-rophim-border rounded-lg shadow-lg">
                <Link
                  to="/admin/profile"
                  className="block px-4 py-2 hover:bg-rophim-hover text-sm"
                >
                  Thông tin cá nhân
                </Link>
                <Link
                  to="/admin/settings"
                  className="block px-4 py-2 hover:bg-rophim-hover text-sm"
                >
                  Cài đặt
                </Link>
                <hr className="border-rophim-border my-1" />
                <button
                  onClick={() => {}}
                  className="block w-full text-left px-4 py-2 hover:bg-rophim-hover text-sm text-red-500"
                >
                  Đăng xuất
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