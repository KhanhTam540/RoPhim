// src/pages/MoviesByTypePage.jsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { movieApi } from '../api/auth'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { motion } from 'framer-motion'
import { 
  FaFilm, FaTv, FaFire, FaClock, 
  FaFilter, FaTimes, FaSortAmountDown,
  FaChevronDown, FaSearch
} from 'react-icons/fa'

const MoviesByTypePage = () => {
  const { type } = useParams()
  
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('latest')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [filters, setFilters] = useState({
    year: '',
    genre: '',
    country: '',
    quality: ''
  })

  // Danh sách năm để lọc
  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)
  
  // Danh sách chất lượng
  const qualities = ['HD', 'Full HD', '4K UHD', 'CAM']

  // Xác định tiêu đề và màu sắc dựa vào type
  const getPageInfo = () => {
    switch(type) {
      case 'phim-le':
        return {
          title: 'Phim Lẻ',
          icon: FaFilm,
          apiType: 'single',
          description: 'Tuyển tập phim lẻ hay nhất, cập nhật liên tục.',
          color: 'from-blue-600 to-cyan-600',
          badgeColor: 'bg-blue-600',
          filterColor: 'text-blue-500',
          borderHover: 'hover:border-blue-500'
        }
      case 'phim-bo':
        return {
          title: 'Phim Bộ',
          icon: FaTv,
          apiType: 'series',
          description: 'Phim bộ đặc sắc từ nhiều quốc gia, cập nhật tập mới mỗi ngày.',
          color: 'from-orange-600 to-red-600',
          badgeColor: 'bg-orange-600',
          filterColor: 'text-orange-500',
          borderHover: 'hover:border-orange-500'
        }
      case 'phim-hot':
        return {
          title: 'Phim Hot',
          icon: FaFire,
          apiType: 'popular',
          description: 'Những bộ phim được xem nhiều nhất hiện nay.',
          color: 'from-red-600 to-pink-600',
          badgeColor: 'bg-red-600',
          filterColor: 'text-red-500',
          borderHover: 'hover:border-red-500'
        }
      case 'phim-moi':
        return {
          title: 'Phim Mới Nhất',
          icon: FaClock,
          apiType: 'latest',
          description: 'Cập nhật những bộ phim mới nhất, vừa được thêm vào hệ thống.',
          color: 'from-green-600 to-emerald-600',
          badgeColor: 'bg-green-600',
          filterColor: 'text-green-500',
          borderHover: 'hover:border-green-500'
        }
      default:
        return {
          title: 'Tất cả phim',
          icon: FaFilm,
          apiType: 'all',
          description: 'Tất cả các bộ phim trong kho dữ liệu của chúng tôi.',
          color: 'from-purple-600 to-pink-600',
          badgeColor: 'bg-purple-600',
          filterColor: 'text-purple-500',
          borderHover: 'hover:border-purple-500'
        }
    }
  }

  const pageInfo = getPageInfo()

  // Reset khi type thay đổi
  useEffect(() => {
    setMovies([])
    setPage(1)
    setTotal(0)
    setFilters({
      year: '',
      genre: '',
      country: '',
      quality: ''
    })
  }, [type])

  // Load movies
  useEffect(() => {
    loadMovies()
  }, [type, page, sortBy, filters])

  const loadMovies = async () => {
    try {
      setLoading(true)
      
      const params = {
        page: page,
        limit: 20
      }

      // Thêm filter dựa vào type
      if (type === 'phim-le') {
        params.type = 'single'
      } else if (type === 'phim-bo') {
        params.type = 'series'
      }

      // Thêm sort
      if (sortBy) {
        params.sort = sortBy
      }

      // Thêm các filter
      if (filters.year) params.year = filters.year
      if (filters.genre) params.genre = filters.genre
      if (filters.country) params.country = filters.country
      if (filters.quality) params.quality = filters.quality

      console.log('📦 Params:', params)

      const response = await movieApi.getMovies(params)
      console.log('📦 Response:', response)

      if (response?.data?.movies) {
        const newMovies = response.data.movies
        const pagination = response.data.pagination
        
        if (page === 1) {
          setMovies(newMovies)
        } else {
          setMovies(prev => [...prev, ...newMovies])
        }
        
        setTotal(pagination?.total || newMovies.length)
        setHasMore(page < (pagination?.pages || 1))
      }

    } catch (error) {
      console.error('❌ Lỗi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
    setPage(1)
    setMovies([])
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const applyFilters = () => {
    setPage(1)
    setMovies([])
    loadMovies()
    setShowFilters(false)
  }

  const clearFilters = () => {
    setFilters({
      year: '',
      genre: '',
      country: '',
      quality: ''
    })
    setPage(1)
    setMovies([])
  }

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{pageInfo.title} - RoPhim</title>
        <meta name="description" content={pageInfo.description} />
      </Helmet>

      <div className="container-custom py-8">
        <motion.div
          key={type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${pageInfo.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <pageInfo.icon className="text-3xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                    {pageInfo.title}
                    {total > 0 && (
                      <span className={`text-sm ${pageInfo.badgeColor} px-3 py-1 rounded-full`}>
                        {total} phim
                      </span>
                    )}
                  </h1>
                  <p className="text-rophim-textSecondary mt-2 max-w-2xl">
                    {pageInfo.description}
                  </p>
                </div>
              </div>

              {/* Nút mở filters trên mobile */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden btn-secondary flex items-center space-x-2"
              >
                <FaFilter />
                <span>Lọc</span>
              </button>
            </div>

            {/* Sort và filter status */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              {/* Sort dropdown - FIXED */}
              <div className="bg-rophim-card px-4 py-2 rounded-lg border border-rophim-border flex items-center space-x-2">
                <FaSortAmountDown className={pageInfo.filterColor} />
                <span className="text-rophim-textSecondary">Sắp xếp:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="appearance-none bg-transparent text-white pr-8 py-1 focus:outline-none cursor-pointer"
                    style={{ color: 'white' }}
                  >
                    <option value="latest" className="bg-gray-800 text-white">Mới nhất</option>
                    <option value="popular" className="bg-gray-800 text-white">Xem nhiều</option>
                    <option value="rating" className="bg-gray-800 text-white">Đánh giá cao</option>
                    <option value="year_desc" className="bg-gray-800 text-white">Năm mới nhất</option>
                    <option value="title_asc" className="bg-gray-800 text-white">Tên A-Z</option>
                  </select>
                  <FaChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-rophim-textSecondary pointer-events-none" size={12} />
                </div>
              </div>

              {Object.values(filters).some(v => v) && (
                <button
                  onClick={clearFilters}
                  className="text-red-500 hover:text-red-400 text-sm flex items-center gap-1 bg-rophim-card px-3 py-2 rounded-lg border border-rophim-border"
                >
                  <FaTimes size={12} /> Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar filters - Desktop */}
            <div className="hidden md:block md:col-span-1">
              <div className="bg-rophim-card rounded-lg p-6 border border-rophim-border sticky top-24">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <FaFilter className={`mr-2 ${pageInfo.filterColor}`} />
                  Bộ lọc
                </h3>

                {/* Filter by year */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-rophim-textSecondary">Năm phát hành</label>
                  <div className="relative">
                    <select
                      value={filters.year}
                      onChange={(e) => handleFilterChange('year', e.target.value)}
                      className="w-full bg-rophim-background border border-rophim-border rounded-lg px-4 py-2.5 text-white appearance-none cursor-pointer focus:outline-none"
                      style={{ borderColor: filters.year ? pageInfo.filterColor.replace('text-', '') : '' }}
                    >
                      <option value="" className="bg-gray-800 text-white">Tất cả năm</option>
                      {years.map(year => (
                        <option key={year} value={year} className="bg-gray-800 text-white">{year}</option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-rophim-textSecondary pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Filter by genre */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-rophim-textSecondary">Thể loại</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Nhập thể loại..."
                      value={filters.genre}
                      onChange={(e) => handleFilterChange('genre', e.target.value)}
                      className="w-full bg-rophim-background border border-rophim-border rounded-lg px-4 py-2.5 text-white placeholder-rophim-textSecondary focus:outline-none"
                      style={{ borderColor: filters.genre ? pageInfo.filterColor.replace('text-', '') : '' }}
                    />
                    <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-rophim-textSecondary" size={14} />
                  </div>
                </div>

                {/* Filter by country */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-rophim-textSecondary">Quốc gia</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Nhập quốc gia..."
                      value={filters.country}
                      onChange={(e) => handleFilterChange('country', e.target.value)}
                      className="w-full bg-rophim-background border border-rophim-border rounded-lg px-4 py-2.5 text-white placeholder-rophim-textSecondary focus:outline-none"
                      style={{ borderColor: filters.country ? pageInfo.filterColor.replace('text-', '') : '' }}
                    />
                    <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-rophim-textSecondary" size={14} />
                  </div>
                </div>

                {/* Filter by quality */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-rophim-textSecondary">Chất lượng</label>
                  <div className="relative">
                    <select
                      value={filters.quality}
                      onChange={(e) => handleFilterChange('quality', e.target.value)}
                      className="w-full bg-rophim-background border border-rophim-border rounded-lg px-4 py-2.5 text-white appearance-none cursor-pointer focus:outline-none"
                      style={{ borderColor: filters.quality ? pageInfo.filterColor.replace('text-', '') : '' }}
                    >
                      <option value="" className="bg-gray-800 text-white">Tất cả</option>
                      {qualities.map(quality => (
                        <option key={quality} value={quality} className="bg-gray-800 text-white">{quality}</option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-rophim-textSecondary pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Filter buttons */}
                <div className="flex space-x-2 mt-6">
                  <button
                    onClick={applyFilters}
                    className={`flex-1 bg-gradient-to-r ${pageInfo.color} hover:opacity-90 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200`}
                  >
                    Áp dụng
                  </button>
                  <button
                    onClick={clearFilters}
                    className="bg-rophim-background border border-rophim-border hover:border-red-500 text-rophim-textSecondary hover:text-red-500 px-4 py-2.5 rounded-lg transition-all duration-200"
                    title="Xóa bộ lọc"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="md:col-span-3">
              {/* Kết quả tìm thấy */}
              <div className="mb-6 p-4 bg-rophim-card rounded-lg border border-rophim-border">
                <p className="text-rophim-textSecondary">
                  Tìm thấy <span className="text-white font-bold text-lg">{total}</span> kết quả
                  {Object.values(filters).some(v => v) && (
                    <span className={`ml-2 ${pageInfo.filterColor}`}>(đã lọc)</span>
                  )}
                </p>
              </div>

              {/* Movies grid */}
              {movies.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {movies.map(movie => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>

                  {/* Load more button */}
                  {hasMore && (
                    <div className="text-center mt-10">
                      <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className={`bg-rophim-card border border-rophim-border ${pageInfo.borderHover} text-white font-medium px-8 py-3 rounded-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {loading ? (
                          <span className="flex items-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Đang tải...</span>
                          </span>
                        ) : (
                          <span>Xem thêm</span>
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 bg-rophim-card rounded-lg border border-rophim-border">
                  <pageInfo.icon className="mx-auto text-6xl text-rophim-textSecondary mb-4" />
                  <p className="text-xl text-rophim-textSecondary mb-2">
                    Không tìm thấy phim nào
                  </p>
                  <p className="text-sm text-rophim-textSecondary mb-6">
                    Thử điều chỉnh bộ lọc hoặc quay lại sau
                  </p>
                  <button
                    onClick={clearFilters}
                    className={`bg-gradient-to-r ${pageInfo.color} hover:opacity-90 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200`}
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default MoviesByTypePage