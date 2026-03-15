// src/pages/GenrePage.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { genreApi, movieApi } from '../api/auth'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { motion } from 'framer-motion'
import { 
  FaFilm, FaSort, FaFilter, FaTimes,
  FaCalendar, FaStar, FaGlobe, FaTv
} from 'react-icons/fa'

const GenrePage = () => {
  const { slug } = useParams()
  
  const [genre, setGenre] = useState(null)
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [sortBy, setSortBy] = useState('latest')
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [filters, setFilters] = useState({
    year: '',
    country: '',
    quality: '',
    type: ''
  })

  // Danh sách năm để lọc
  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)
  
  // Danh sách chất lượng
  const qualities = ['HD', 'Full HD', '4K UHD', 'CAM']
  
  // Danh sách loại phim
  const types = [
    { value: 'single', label: 'Phim lẻ' },
    { value: 'series', label: 'Phim bộ' }
  ]

  // Reset state khi slug thay đổi
  useEffect(() => {
    setGenre(null)
    setMovies([])
    setPage(1)
    setTotal(0)
    setFilters({
      year: '',
      country: '',
      quality: '',
      type: ''
    })
  }, [slug])

  // Load thông tin thể loại và phim
  useEffect(() => {
    loadGenreAndMovies()
  }, [slug, page, sortBy, filters])

  const loadGenreAndMovies = async () => {
    try {
      setLoading(true)
      
      // Luôn load thông tin thể loại mới
      console.log('📦 Đang tải thông tin thể loại:', slug)
      const genreResponse = await genreApi.getGenreBySlug(slug)
      console.log('📦 Genre response:', genreResponse)
      
      if (genreResponse?.data?.genre) {
        setGenre(genreResponse.data.genre)
        document.title = `${genreResponse.data.genre.name} - RoPhim`
      } else if (genreResponse?.genre) {
        setGenre(genreResponse.genre)
        document.title = `${genreResponse.genre.name} - RoPhim`
      }

      // Tạo params cho API movies
      const params = {
        page: page,
        limit: 20,
        genre: slug,
        sort: sortBy
      }

      // Thêm các filter nếu có
      if (filters.year) params.year = filters.year
      if (filters.country) params.country = filters.country
      if (filters.quality) params.quality = filters.quality
      if (filters.type) params.type = filters.type

      console.log('📦 Params gửi lên API:', params)

      // Load danh sách phim
      const moviesResponse = await movieApi.getMovies(params)
      console.log('📦 Movies response:', moviesResponse)

      if (moviesResponse?.data?.movies) {
        const newMovies = moviesResponse.data.movies
        const pagination = moviesResponse.data.pagination
        
        console.log(`🎬 Nhận được ${newMovies.length} phim`)
        
        if (page === 1) {
          setMovies(newMovies)
        } else {
          setMovies(prev => [...prev, ...newMovies])
        }
        
        setTotal(pagination?.total || newMovies.length)
        setHasMore(page < (pagination?.pages || 1))
      }

    } catch (error) {
      console.error('❌ Lỗi khi tải dữ liệu:', error)
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
    loadGenreAndMovies()
    setShowFilters(false)
  }

  const clearFilters = () => {
    setFilters({
      year: '',
      country: '',
      quality: '',
      type: ''
    })
    setPage(1)
    setMovies([])
  }

  // Icon cho từng thể loại
  const getGenreIcon = (name) => {
    const icons = {
      'Hành Động': '⚔️',
      'Tình Cảm': '❤️',
      'Hài Hước': '😂',
      'Kinh Dị': '👻',
      'Viễn Tưởng': '🚀',
      'Hoạt Hình': '🎨',
      'Cổ Trang': '🏮',
      'Tâm Lý': '🧠',
      'Hình Sự': '🔫',
      'Chiến Tranh': '💣',
      'Phiêu Lưu': '🗺️',
      'Võ Thuật': '🥋'
    }
    return icons[name] || '🎬'
  }

  if (loading && page === 1 && !movies.length) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{genre?.name || 'Thể loại'} - RoPhim</title>
        <meta name="description" content={genre?.description || `Xem phim thể loại ${genre?.name} chất lượng cao, cập nhật nhanh nhất`} />
      </Helmet>

      <div className="container-custom py-8">
        <motion.div
          key={slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header với thông tin thể loại */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">{genre ? getGenreIcon(genre.name) : '🎬'}</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  {genre?.name || 'Đang tải...'}
                </h1>
                {genre?.description && (
                  <p className="text-rophim-textSecondary mt-1 max-w-2xl">
                    {genre.description}
                  </p>
                )}
              </div>
            </div>

            {/* Sort dropdown */}
            <div className="flex items-center space-x-3 bg-rophim-card px-4 py-2 rounded-lg border border-rophim-border">
              <FaSort className="text-rophim-textSecondary" />
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="bg-transparent border-none text-sm focus:outline-none focus:ring-0 cursor-pointer"
              >
                <option value="latest">Mới nhất</option>
                <option value="popular">Xem nhiều nhất</option>
                <option value="rating">Đánh giá cao</option>
                <option value="year_desc">Năm mới nhất</option>
                <option value="title_asc">Tên A-Z</option>
              </select>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar filters - Desktop */}
            <div className="hidden md:block md:col-span-1">
              <div className="bg-rophim-card rounded-lg p-6 border border-rophim-border sticky top-24">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <FaFilter className="mr-2 text-blue-500" />
                  Bộ lọc
                </h3>

                {/* Filter by year */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Năm phát hành</label>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Tất cả năm</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by quality */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Chất lượng</label>
                  <select
                    value={filters.quality}
                    onChange={(e) => handleFilterChange('quality', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Tất cả</option>
                    {qualities.map(quality => (
                      <option key={quality} value={quality}>{quality}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Loại phim</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Tất cả</option>
                    {types.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Filter buttons */}
                <div className="flex space-x-2 mt-6">
                  <button
                    onClick={applyFilters}
                    className="btn-primary flex-1"
                  >
                    Áp dụng
                  </button>
                  <button
                    onClick={clearFilters}
                    className="btn-secondary px-4"
                    title="Xóa bộ lọc"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            </div>

            {/* Main content - Movies grid */}
            <div className="md:col-span-3">
              {/* Kết quả tìm thấy */}
              {total > 0 && (
                <div className="mb-6 p-4 bg-rophim-card rounded-lg border border-rophim-border">
                  <p className="text-rophim-textSecondary">
                    Tìm thấy <span className="text-white font-bold text-lg">{total}</span> phim
                    {Object.values(filters).some(v => v) && (
                      <span className="ml-2 text-blue-500">(đã lọc)</span>
                    )}
                  </p>
                </div>
              )}

              {/* Movies grid */}
              {movies.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
                        className="btn-secondary px-8 py-3 text-lg hover:scale-105 transition-transform"
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
                  <FaFilm className="mx-auto text-6xl text-rophim-textSecondary mb-4" />
                  <p className="text-xl text-rophim-textSecondary mb-2">
                    Không tìm thấy phim nào
                  </p>
                  <p className="text-sm text-rophim-textSecondary mb-6">
                    Thử điều chỉnh bộ lọc hoặc quay lại sau
                  </p>
                  <button
                    onClick={clearFilters}
                    className="btn-primary"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Filters Modal */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={() => setShowFilters(false)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'tween' }}
                className="absolute bottom-0 left-0 right-0 bg-rophim-card rounded-t-2xl p-6"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Bộ lọc</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <FaTimes />
                  </button>
                </div>

                {/* Filter by year */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Năm phát hành</label>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Tất cả năm</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by quality */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Chất lượng</label>
                  <select
                    value={filters.quality}
                    onChange={(e) => handleFilterChange('quality', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Tất cả</option>
                    {qualities.map(quality => (
                      <option key={quality} value={quality}>{quality}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Loại phim</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Tất cả</option>
                    {types.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-2 mt-6">
                  <button
                    onClick={applyFilters}
                    className="btn-primary flex-1"
                  >
                    Áp dụng
                  </button>
                  <button
                    onClick={clearFilters}
                    className="btn-secondary px-4"
                  >
                    <FaTimes />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  )
}

export default GenrePage