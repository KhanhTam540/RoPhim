// src/pages/CountryPage.jsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { countryApi, movieApi } from '../api/auth'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { motion } from 'framer-motion'
import { FaGlobe, FaFilm, FaSort } from 'react-icons/fa'
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

  // Reset khi slug thay đổi
  useEffect(() => {
    setCountry(null)
    setMovies([])
    setPage(1)
    setTotal(0)
  }, [slug])

  // Load dữ liệu
  useEffect(() => {
    loadCountryAndMovies()
  }, [slug, page, sortBy])

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

      // Load movies
      const params = {
        country: slug,
        page,
        limit: 20,
        sort: sortBy
      }

      console.log('📦 Params:', params)
      const moviesResponse = await movieApi.getMovies(params)
      console.log('📦 Movies response:', moviesResponse)

      if (moviesResponse?.data?.movies) {
        const newMovies = moviesResponse.data.movies
        const pagination = moviesResponse.data.pagination
        
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
    setPage(p => p + 1)
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
    setPage(1)
    setMovies([])
  }

  if (loading && page === 1 && !movies.length) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading />
      </div>
    )
  }

  const flagUrl = country?.flag ? getImageUrl(country.flag) : null

  return (
    <>
      <Helmet>
        <title>Phim {country?.name || 'Quốc gia'} - RoPhim</title>
        <meta name="description" content={`Xem phim từ ${country?.name} hay nhất, cập nhật liên tục.`} />
      </Helmet>

      <div className="container-custom py-8">
        <motion.div
          key={slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                {flagUrl ? (
                  <img src={flagUrl} alt={country?.name} className="w-10 h-8 object-cover rounded" />
                ) : (
                  <FaGlobe className="text-3xl text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Phim {country?.name || 'Đang tải...'}
                </h1>
                {country && (
                  <p className="text-rophim-textSecondary mt-1 max-w-2xl">
                    Tuyển tập phim từ {country.name} hay nhất, cập nhật liên tục.
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
          </div>

          {/* Kết quả tìm thấy */}
          {total > 0 && (
            <div className="mb-6 p-4 bg-rophim-card rounded-lg border border-rophim-border">
              <p className="text-rophim-textSecondary">
                Tìm thấy <span className="text-white font-bold text-lg">{total}</span> phim từ {country?.name}
              </p>
            </div>
          )}

          {/* Movies Grid */}
          {movies.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
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
                Chưa có phim nào từ {country?.name}
              </p>
              <p className="text-sm text-rophim-textSecondary">
                Thử tìm kiếm với quốc gia khác hoặc quay lại sau
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}

export default CountryPage