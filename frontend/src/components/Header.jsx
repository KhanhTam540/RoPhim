// src/components/Header.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  FaSearch, FaUser, FaHeart, FaSignOutAlt, 
  FaCog, FaBars, FaTimes, FaChevronDown, FaGlobe, FaFilm,
  FaFire, FaClock, FaPlayCircle, FaHistory, FaStar
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { getAvatarUrl, getImageUrl } from '../utils/imageUtils'
import { genreApi, countryApi, searchApi } from '../api/auth'
import { useDebounce } from '../hooks/useDebounce'

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [genres, setGenres] = useState([])
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  
  const searchRef = useRef(null)
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 400)

  // Lấy dữ liệu thể loại và quốc gia
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [genresRes, countriesRes] = await Promise.all([
          genreApi.getGenres(),
          countryApi.getCountries()
        ])
        
        if (genresRes?.data?.genres) setGenres(genresRes.data.genres)
        else if (genresRes?.genres) setGenres(genresRes.genres)
        else if (Array.isArray(genresRes)) setGenres(genresRes)
        
        if (countriesRes?.data?.countries) setCountries(countriesRes.data.countries)
        else if (countriesRes?.countries) setCountries(countriesRes.countries)
        else if (Array.isArray(countriesRes)) setCountries(countriesRes)
        
      } catch (error) {
        console.error('❌ Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Search API call
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearch.length < 2) {
        setSearchResults(null)
        return
      }

      setSearchLoading(true)
      try {
        const response = await searchApi.search({ 
          keyword: debouncedSearch, 
          limit: 5 
        })
        setSearchResults(response.data)
      } catch (error) {
        console.error('❌ Search error:', error)
      } finally {
        setSearchLoading(false)
      }
    }

    performSearch()
  }, [debouncedSearch])

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Hiệu ứng scroll header
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Đóng mobile menu khi chuyển trang
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsSearchFocused(false)
  }, [location])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/tim-kiem?keyword=${encodeURIComponent(searchQuery)}`)
      setIsSearchFocused(false)
      setSearchQuery('')
    }
  }

  const handleSearchItemClick = (path) => {
    navigate(path)
    setIsSearchFocused(false)
    setSearchQuery('')
  }

  const navLinks = [
    { path: '/phim-le', label: 'Phim lẻ' },
    { path: '/phim-bo', label: 'Phim bộ' },
    { path: '/phim-chieu-rap', label: 'Chiếu rạp' },
    { path: '/phim-hot', label: 'Hot', icon: <FaFire /> },
  ]

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled 
          ? 'bg-[#0a0a0a]/95 backdrop-blur-xl py-3 border-b border-white/5 shadow-2xl' 
          : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between gap-6">
          
          {/* --- 1. LOGO --- */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="relative">
              <FaPlayCircle className="text-3xl text-red-600 group-hover:scale-110 transition-transform duration-300 shadow-red-500/50" />
              <div className="absolute inset-0 bg-red-600 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">
              RO<span className="text-red-600">PHIM</span>
            </span>
          </Link>

          {/* --- 2. DESKTOP NAV --- */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  px-4 py-2 text-[15px] font-bold flex items-center gap-2 transition-all hover:text-white
                  ${isActive ? 'text-red-500' : 'text-gray-300/90'}
                `}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}

            <DesktopDropdown label="Thể loại" items={genres} type="the-loai" columns="grid-cols-4 w-[600px]" loading={loading} />
            <DesktopDropdown label="Quốc gia" items={countries} type="quoc-gia" columns="grid-cols-3 w-[450px]" loading={loading} />
          </nav>

          {/* --- 3. RIGHT SECTION --- */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            
            {/* Search Box with Dropdown */}
            <div className="relative hidden md:block" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Tìm phim, diễn viên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className={`bg-white/10 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all duration-300 ${
                    isSearchFocused ? 'w-80 bg-white/15' : 'w-56'
                  }`}
                />
                <FaSearch className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-colors ${
                  isSearchFocused ? 'text-red-500' : 'text-gray-400'
                }`} />
              </form>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {isSearchFocused && searchQuery.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#141414] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[150]"
                  >
                    {searchLoading ? (
                      <div className="p-6 text-center">
                        <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      </div>
                    ) : searchResults ? (
                      <div className="max-h-96 overflow-y-auto">
                        {/* Movies */}
                        {searchResults.movies?.length > 0 && (
                          <div className="p-2">
                            <h3 className="text-xs font-bold text-red-500 px-3 py-2 uppercase tracking-wider">Phim</h3>
                            {searchResults.movies.map(movie => (
                              <button
                                key={movie.id}
                                onClick={() => handleSearchItemClick(`/movies/${movie.slug}`)}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-left"
                              >
                                {movie.poster ? (
                                  <img src={getImageUrl(movie.poster)} alt={movie.title} className="w-10 h-14 object-cover rounded" />
                                ) : (
                                  <div className="w-10 h-14 bg-gradient-to-br from-red-600/20 to-red-600/5 rounded flex items-center justify-center">
                                    <FaFilm className="text-red-500/50" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                                  <p className="text-xs text-gray-400">{movie.releaseYear || 'N/A'} • {movie.quality || 'HD'}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Actors */}
                        {searchResults.actors?.length > 0 && (
                          <div className="p-2 border-t border-white/5">
                            <h3 className="text-xs font-bold text-red-500 px-3 py-2 uppercase tracking-wider">Diễn viên</h3>
                            <div className="grid grid-cols-2 gap-1">
                              {searchResults.actors.map(actor => (
                                <button
                                  key={actor.id}
                                  onClick={() => handleSearchItemClick(`/dien-vien/${actor.slug}`)}
                                  className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                  {actor.avatar ? (
                                    <img src={getImageUrl(actor.avatar)} alt={actor.name} className="w-8 h-8 rounded-full object-cover" />
                                  ) : (
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center">
                                      <FaUser className="text-white text-xs" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{actor.name}</p>
                                    {actor.nationality && (
                                      <p className="text-xs text-gray-400 truncate">{actor.nationality}</p>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* View all link */}
                        <div className="p-2 border-t border-white/5">
                          <button
                            onClick={() => handleSearchItemClick(`/tim-kiem?keyword=${encodeURIComponent(searchQuery)}`)}
                            className="w-full text-center py-2 text-sm text-red-500 hover:text-red-400 transition-colors"
                          >
                            Xem tất cả kết quả cho "{searchQuery}"
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        Không tìm thấy kết quả cho "{searchQuery}"
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Auth/User */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                  <img 
                    src={user?.avatar ? getAvatarUrl(user.avatar) : `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=E11D48&color=fff&size=100`} 
                    className="w-8 h-8 rounded-full object-cover border border-white/20" 
                    alt="avatar" 
                  />
                  <FaChevronDown className="text-[10px] text-gray-400 group-hover:rotate-180 transition-transform" />
                </button>
                
                {/* User Dropdown Menu */}
                <div className="absolute top-full right-0 mt-2 w-56 bg-[#141414] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-2 z-[110]">
                  <div className="px-4 py-3 border-b border-white/5 mb-2">
                    <p className="text-sm font-bold text-white truncate">{user?.fullName}</p>
                    <p className="text-[10px] text-red-500 font-bold tracking-widest uppercase">Thành viên</p>
                  </div>
                  
                  {/* SỬA QUAN TRỌNG: Đường dẫn "/profile" thay vì "/profile" sai */}
                  <UserMenuItem to="/profile" icon={<FaUser className="text-blue-400" />} text="Cá nhân" />
                  <UserMenuItem to="/favorites" icon={<FaHeart className="text-red-400" />} text="Yêu thích" />
                  <UserMenuItem to="/history" icon={<FaHistory className="text-green-400" />} text="Lịch sử" />
                  
                  {isAdmin && (
                    <UserMenuItem to="/admin" icon={<FaCog className="text-yellow-400" />} text="Admin Panel" />
                  )}
                  
                  <div className="h-[1px] bg-white/5 my-1" />
                  
                  <button 
                    onClick={logout} 
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-red-600/10 transition-all"
                  >
                    <FaSignOutAlt /> Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/dang-nhap" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-red-600/30 active:scale-95">
                Đăng nhập
              </Link>
            )}

            {/* Mobile Toggle */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-white p-2 hover:bg-white/10 rounded-full">
              <FaBars size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE SIDEBAR --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[320px] bg-[#0f0f0f] z-[210] p-6 shadow-2xl overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-black italic text-red-600">ROPHIM</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:rotate-90 transition-transform">
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-6 relative">
                <input
                  type="text"
                  placeholder="Tìm phim..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-red-600"
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </form>

              {/* Mobile Navigation */}
              <div className="space-y-1">
                {navLinks.map(link => (
                  <Link 
                    key={link.path} 
                    to={link.path} 
                    className="flex items-center gap-3 py-3 text-lg font-medium text-gray-300 hover:text-red-500 border-b border-white/5"
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile Genres */}
              <div className="mt-6">
                <h3 className="text-sm font-bold text-red-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <FaFilm /> Thể loại
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {genres.slice(0, 8).map(g => (
                    <Link key={g.id} to={`/the-loai/${g.slug}`} className="text-gray-400 hover:text-red-500 text-sm">
                      {g.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Countries */}
              <div className="mt-6">
                <h3 className="text-sm font-bold text-red-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <FaGlobe /> Quốc gia
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {countries.slice(0, 8).map(c => (
                    <Link key={c.id} to={`/quoc-gia/${c.slug}`} className="text-gray-400 hover:text-red-500 text-sm">
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Auth */}
              {!isAuthenticated ? (
                <div className="mt-8">
                  <Link to="/dang-nhap" className="block w-full bg-red-600 text-white text-center py-3 rounded-xl font-bold">
                    Đăng nhập
                  </Link>
                </div>
              ) : (
                <div className="mt-8 space-y-2">
                  <Link to="/profile" className="block w-full bg-red-600 text-white text-center py-3 rounded-xl font-bold">
                    Cá nhân
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

// --- SUB-COMPONENTS ---

const DesktopDropdown = ({ label, items, type, columns, loading }) => (
  <div className="relative group">
    <button className="px-4 py-2 text-[15px] font-bold text-gray-300/90 group-hover:text-white flex items-center gap-1.5 transition-all">
      {label}
      <FaChevronDown className="text-[10px] opacity-50 group-hover:rotate-180 group-hover:opacity-100 transition-all" />
    </button>
    <div className={`absolute top-full left-0 mt-2 p-6 bg-[#141414]/98 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[120] ${columns}`}>
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length > 0 ? (
        <div className={`grid gap-x-6 gap-y-3 ${columns.split(' ')[0]}`}>
          {items.map(item => (
            <Link 
              key={item.id} 
              to={`/${type}/${item.slug}`}
              className="text-[14px] text-gray-400 hover:text-red-500 transition-colors whitespace-nowrap"
            >
              {item.name}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">Không có dữ liệu</p>
      )}
    </div>
  </div>
)

// Component UserMenuItem - ĐÃ SỬA ĐƯỜNG DẪN
const UserMenuItem = ({ to, icon, text }) => (
  <Link 
    to={to} 
    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all group"
  >
    <span className="transition-transform group-hover:scale-110">{icon}</span>
    {text}
  </Link>
)

export default Header