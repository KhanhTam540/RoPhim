// src/pages/CountryPage.jsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { countryApi, movieApi } from '../api/auth'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { motion } from 'framer-motion'
import { 
  FaGlobe, FaFilm, FaFilter, FaTimes,
  FaCalendar, FaStar, FaTv, FaSortAmountDown,
  FaChevronDown, FaSearch
} from 'react-icons/fa'
import { getImageUrl } from '../utils/imageUtils'

const CountryPage = () => {
  const { slug } = useParams()
  
  const [country, setCountry] = useState(null)
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
    genre: '',
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
    setCountry(null)
    setMovies([])
    setPage(1)
    setTotal(0)
    setFilters({
      year: '',
      genre: '',
      quality: '',
      type: ''
    })
  }, [slug])

  // Load thông tin quốc gia và phim
  useEffect(() => {
    loadCountryAndMovies()
  }, [slug, page, sortBy, filters])

  const loadCountryAndMovies = async () => {
    try {
      setLoading(true)
      
      // Load country info
      console.log('📦 Đang tải thông tin quốc gia:', slug)
      const countryResponse = await countryApi.getCountryBySlug(slug)
      console.log('📦 Country response:', countryResponse)
      
      if (countryResponse?.data?.country) {
        setCountry(countryResponse.data.country)
        document.title = `Phim ${countryResponse.data.country.name} - RoPhim`
      } else if (countryResponse?.country) {
        setCountry(countryResponse.country)
        document.title = `Phim ${countryResponse.country.name} - RoPhim`
      }

      // Tạo params cho API movies
      const params = {
        page: page,
        limit: 20,
        country: slug,
        sort: sortBy
      }

      // Thêm các filter nếu có
      if (filters.year) params.year = filters.year
      if (filters.genre) params.genre = filters.genre
      if (filters.quality) params.quality = filters.quality
      if (filters.type) params.type = filters.type

      console.log('📦 Params gửi lên API:', params)

      // Load movies
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
    loadCountryAndMovies()
    setShowFilters(false)
  }

  const clearFilters = () => {
    setFilters({
      year: '',
      genre: '',
      quality: '',
      type: ''
    })
    setPage(1)
    setMovies([])
  }

  const flagUrl = country?.flag ? getImageUrl(country.flag) : null

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
        <title>Phim {country?.name || 'Quốc gia'} - RoPhim</title>
        <meta name="description" content={country ? `Xem phim từ ${country.name} chất lượng cao, cập nhật nhanh nhất` : 'Xem phim theo quốc gia'} />
      </Helmet>

      <div className="container-custom py-8">
        <motion.div
          key={slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header với thông tin quốc gia */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  {flagUrl ? (
                    <img src={flagUrl} alt={country?.name} className="w-10 h-8 object-cover rounded" />
                  ) : (
                    <FaGlobe className="text-3xl text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                    Phim {country?.name || 'Đang tải...'}
                    {total > 0 && (
                      <span className="text-sm bg-green-600 px-3 py-1 rounded-full">
                        {total} phim
                      </span>
                    )}
                  </h1>
                  {country && (
                    <p className="text-rophim-textSecondary mt-2 max-w-2xl">
                      Tuyển tập phim từ {country.name} hay nhất, cập nhật liên tục
                    </p>
                  )}
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
                <FaSortAmountDown className="text-green-500" />
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
                  <FaFilter className="mr-2 text-green-500" />
                  Bộ lọc
                </h3>

                {/* Filter by year */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-rophim-textSecondary">Năm phát hành</label>
                  <div className="relative">
                    <select
                      value={filters.year}
                      onChange={(e) => handleFilterChange('year', e.target.value)}
                      className="w-full bg-rophim-background border border-rophim-border rounded-lg px-4 py-2.5 text-white appearance-none cursor-pointer focus:border-green-500 focus:outline-none"
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
                      className="w-full bg-rophim-background border border-rophim-border rounded-lg px-4 py-2.5 text-white placeholder-rophim-textSecondary focus:border-green-500 focus:outline-none"
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
                      className="w-full bg-rophim-background border border-rophim-border rounded-lg px-4 py-2.5 text-white appearance-none cursor-pointer focus:border-green-500 focus:outline-none"
                    >
                      <option value="" className="bg-gray-800 text-white">Tất cả</option>
                      {qualities.map(quality => (
                        <option key={quality} value={quality} className="bg-gray-800 text-white">{quality}</option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-rophim-textSecondary pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Filter by type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-rophim-textSecondary">Loại phim</label>
                  <div className="relative">
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="w-full bg-rophim-background border border-rophim-border rounded-lg px-4 py-2.5 text-white appearance-none cursor-pointer focus:border-green-500 focus:outline-none"
                    >
                      <option value="" className="bg-gray-800 text-white">Tất cả</option>
                      {types.map(type => (
                        <option key={type.value} value={type.value} className="bg-gray-800 text-white">{type.label}</option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-rophim-textSecondary pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Filter buttons */}
                <div className="flex space-x-2 mt-6">
                  <button
                    onClick={applyFilters}
                    className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200"
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

            {/* Main content - Movies grid */}
            <div className="md:col-span-3">
              {/* Kết quả tìm thấy */}
              <div className="mb-6 p-4 bg-rophim-card rounded-lg border border-rophim-border">
                <p className="text-rophim-textSecondary">
                  Tìm thấy <span className="text-white font-bold text-lg">{total}</span> phim
                  {Object.values(filters).some(v => v) && (
                    <span className="ml-2 text-green-500">(đã lọc)</span>
                  )}
                </p>
              </div>

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
                        className="bg-rophim-card border border-rophim-border hover:border-green-500 text-white font-medium px-8 py-3 rounded-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200"
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

export default CountryPage