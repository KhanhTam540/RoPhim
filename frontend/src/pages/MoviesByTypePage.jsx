// src/pages/MoviesByTypePage.jsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { movieApi } from '../api/auth'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { motion } from 'framer-motion'
import { FaFilm, FaTv, FaFire, FaClock, FaSort } from 'react-icons/fa'

const MoviesByTypePage = () => {
  const { type } = useParams()
  
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('latest')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  // Reset khi type thay đổi
  useEffect(() => {
    setMovies([])
    setPage(1)
    setTotal(0)
  }, [type, sortBy])

  // Load dữ liệu
  useEffect(() => {
    loadMovies()
  }, [type, page, sortBy])

  const loadMovies = async () => {
    try {
      setLoading(true)
      
      const params = {
        page: page,
        limit: 20
      }

      // Thêm filter dựa vào type
      switch(type) {
        case 'phim-le':
          params.type = 'single'
          document.title = 'Phim Lẻ - RoPhim'
          break
        case 'phim-bo':
          params.type = 'series'
          document.title = 'Phim Bộ - RoPhim'
          break
        case 'phim-hot':
          params.sort = 'popular'
          document.title = 'Phim Hot - RoPhim'
          break
        case 'phim-moi':
          params.sort = 'latest'
          document.title = 'Phim Mới Nhất - RoPhim'
          break
        default:
          document.title = 'Tất cả phim - RoPhim'
      }

      // Thêm sort nếu có
      if (sortBy) {
        params.sort = sortBy
      }

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

  // Xác định thông tin trang
  const getPageInfo = () => {
    switch(type) {
      case 'phim-le':
        return {
          title: 'Phim Lẻ',
          icon: FaFilm,
          description: 'Tuyển tập phim lẻ hay nhất, cập nhật liên tục.',
          color: 'from-blue-600 to-purple-600'
        }
      case 'phim-bo':
        return {
          title: 'Phim Bộ',
          icon: FaTv,
          description: 'Phim bộ đặc sắc từ nhiều quốc gia, cập nhật tập mới mỗi ngày.',
          color: 'from-green-600 to-teal-600'
        }
      case 'phim-hot':
        return {
          title: 'Phim Hot',
          icon: FaFire,
          description: 'Những bộ phim được xem nhiều nhất hiện nay.',
          color: 'from-red-600 to-orange-600'
        }
      case 'phim-moi':
        return {
          title: 'Phim Mới Nhất',
          icon: FaClock,
          description: 'Cập nhật những bộ phim mới nhất, vừa được thêm vào hệ thống.',
          color: 'from-purple-600 to-pink-600'
        }
      default:
        return {
          title: 'Tất cả phim',
          icon: FaFilm,
          description: 'Tất cả các bộ phim trong kho dữ liệu của chúng tôi.',
          color: 'from-blue-600 to-purple-600'
        }
    }
  }

  const pageInfo = getPageInfo()

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
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${pageInfo.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                <pageInfo.icon className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">{pageInfo.title}</h1>
                <p className="text-rophim-textSecondary mt-1 max-w-2xl">
                  {pageInfo.description}
                </p>
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
                Tìm thấy <span className="text-white font-bold text-lg">{total}</span> phim
                {type === 'phim-le' && <span className="ml-2 text-blue-500">(Phim lẻ)</span>}
                {type === 'phim-bo' && <span className="ml-2 text-green-500">(Phim bộ)</span>}
              </p>
            </div>
          )}

          {/* Movies grid */}
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
              <pageInfo.icon className="mx-auto text-6xl text-rophim-textSecondary mb-4" />
              <p className="text-xl text-rophim-textSecondary mb-2">
                Không tìm thấy phim nào
              </p>
              <p className="text-sm text-rophim-textSecondary">
                Thử tìm kiếm với bộ lọc khác hoặc quay lại sau
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}

export default MoviesByTypePage