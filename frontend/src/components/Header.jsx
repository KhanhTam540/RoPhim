import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaSearch, FaUser, FaHeart, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaCog, FaFilm, FaBars, FaTimes } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { getAvatarUrl } from '../utils/imageUtils'

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const menuRef = useRef(null)
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/tim-kiem?keyword=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setIsMobileMenuOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    setIsMobileMenuOpen(false)
    navigate('/')
  }

  // Get avatar URL
  const avatarUrl = user?.avatar ? getAvatarUrl(user.avatar) : null

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-rophim-card/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <nav className="container-custom py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform">
              <FaFilm className="text-white text-lg" />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              RoPhim
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm phim, diễn viên, thể loại..."
                className="w-full bg-rophim-bg/80 backdrop-blur-sm border border-rophim-border rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label="Tìm kiếm"
              >
                <FaSearch size={18} />
              </button>
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-3 group focus:outline-none"
                  aria-label="Menu người dùng"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user?.fullName}
                      className="w-9 h-9 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition-all"
                      onError={(e) => {
                        e.target.src = 'https://picsum.photos/150/150?random=3'
                      }}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-transparent group-hover:border-white transition-all">
                      <span className="text-sm font-bold">
                        {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <span className="hidden lg:block text-sm font-medium group-hover:text-blue-500 transition-colors">
                    {user?.fullName?.split(' ').pop()}
                  </span>
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-rophim-card border border-rophim-border rounded-lg shadow-xl overflow-hidden"
                    >
                      <div className="p-3 border-b border-rophim-border bg-rophim-hover/50">
                        <p className="font-medium text-sm">{user?.fullName}</p>
                        <p className="text-xs text-rophim-textSecondary">@{user?.username}</p>
                      </div>
                      
                      <Link
                        to="/ho-so"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-rophim-hover transition-colors"
                      >
                        <FaUser size={14} className="text-blue-500" />
                        <span className="text-sm">Hồ sơ</span>
                      </Link>
                      
                      <Link
                        to="/yeu-thich"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-rophim-hover transition-colors"
                      >
                        <FaHeart size={14} className="text-red-500" />
                        <span className="text-sm">Phim yêu thích</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-rophim-hover transition-colors border-t border-rophim-border"
                        >
                          <FaCog size={14} className="text-purple-500" />
                          <span className="text-sm">Quản trị hệ thống</span>
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-rophim-hover transition-colors border-t border-rophim-border text-left"
                      >
                        <FaSignOutAlt size={14} className="text-red-500" />
                        <span className="text-sm">Đăng xuất</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/dang-nhap"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/dang-ky"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-sm font-medium rounded-lg transition-all transform hover:scale-105"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-2xl text-gray-300 hover:text-white transition-colors"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-4 pb-2 space-y-4">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="w-full bg-rophim-bg border border-rophim-border rounded-lg pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <FaSearch size={16} />
                  </button>
                </form>

                {/* Mobile Navigation Links */}
                <div className="space-y-2">
                  {isAuthenticated ? (
                    <>
                      {/* User Info */}
                      <div className="flex items-center space-x-3 p-3 bg-rophim-hover/50 rounded-lg">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={user?.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://picsum.photos/150/150?random=3'
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-sm font-bold">
                              {user?.fullName?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{user?.fullName}</p>
                          <p className="text-xs text-rophim-textSecondary">@{user?.username}</p>
                        </div>
                      </div>

                      {/* Mobile Menu Items */}
                      <Link
                        to="/ho-so"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-rophim-hover rounded-lg transition-colors"
                      >
                        <FaUser size={16} className="text-blue-500" />
                        <span>Hồ sơ</span>
                      </Link>
                      
                      <Link
                        to="/yeu-thich"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-rophim-hover rounded-lg transition-colors"
                      >
                        <FaHeart size={16} className="text-red-500" />
                        <span>Phim yêu thích</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-rophim-hover rounded-lg transition-colors"
                        >
                          <FaCog size={16} className="text-purple-500" />
                          <span>Quản trị hệ thống</span>
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-rophim-hover rounded-lg transition-colors text-left text-red-500"
                      >
                        <FaSignOutAlt size={16} />
                        <span>Đăng xuất</span>
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <Link
                        to="/dang-nhap"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-rophim-card hover:bg-rophim-hover rounded-lg transition-colors"
                      >
                        <FaSignInAlt size={16} />
                        <span>Đăng nhập</span>
                      </Link>
                      <Link
                        to="/dang-ky"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg transition-colors"
                      >
                        <FaUserPlus size={16} />
                        <span>Đăng ký</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Quick Links */}
                <div className="pt-4 border-t border-rophim-border">
                  <p className="text-xs text-rophim-textSecondary mb-2 px-2">Khám phá nhanh</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/phim-hot"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-sm text-center px-3 py-2 bg-rophim-card hover:bg-rophim-hover rounded-lg transition-colors"
                    >
                      🔥 Phim hot
                    </Link>
                    <Link
                      to="/phim-moi"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-sm text-center px-3 py-2 bg-rophim-card hover:bg-rophim-hover rounded-lg transition-colors"
                    >
                      ✨ Phim mới
                    </Link>
                    <Link
                      to="/phim-bo"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-sm text-center px-3 py-2 bg-rophim-card hover:bg-rophim-hover rounded-lg transition-colors"
                    >
                      📺 Phim bộ
                    </Link>
                    <Link
                      to="/phim-le"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-sm text-center px-3 py-2 bg-rophim-card hover:bg-rophim-hover rounded-lg transition-colors"
                    >
                      🎬 Phim lẻ
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}

export default Header