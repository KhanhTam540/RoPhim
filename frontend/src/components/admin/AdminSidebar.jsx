// src/components/admin/AdminSidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  FaHome, FaFilm, FaList, FaGlobe, FaUser, 
  FaUsers, FaImage, FaCog, FaSignOutAlt,
  FaStar, FaVideo
} from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const AdminSidebar = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const menuItems = [
    { path: '/admin', icon: FaHome, label: 'Dashboard' },
    { path: '/admin/movies', icon: FaFilm, label: 'Phim' },
    { path: '/admin/genres', icon: FaList, label: 'Thể loại' },
    { path: '/admin/countries', icon: FaGlobe, label: 'Quốc gia' },
    { path: '/admin/actors', icon: FaStar, label: 'Diễn viên' },
    { path: '/admin/directors', icon: FaVideo, label: 'Đạo diễn' },
    { path: '/admin/users', icon: FaUsers, label: 'Người dùng' },
    { path: '/admin/sliders', icon: FaImage, label: 'Slider' },
    { path: '/admin/settings', icon: FaCog, label: 'Cài đặt' },
  ]

  const handleLogout = () => {
    logout()
    toast.success('Đã đăng xuất')
    navigate('/dang-nhap')
  }

  return (
    <div className="w-64 bg-rophim-card h-screen fixed left-0 top-0 overflow-y-auto border-r border-rophim-border">
      {/* Logo - Chỉ giữ một logo đơn giản */}
      <div className="p-4 border-b border-rophim-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">RoPhim</h1>
            <p className="text-xs text-rophim-textSecondary">Admin</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-red-600 text-white' 
                      : 'text-rophim-textSecondary hover:bg-rophim-hover hover:text-white'
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-rophim-border">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-rophim-textSecondary hover:bg-rophim-hover hover:text-white transition-colors"
        >
          <FaSignOutAlt size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}

export default AdminSidebar