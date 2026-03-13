// src/pages/SeriesPage.jsx
import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { movieApi } from '../api/auth'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { motion } from 'framer-motion'
import { FaTv } from 'react-icons/fa'

const SeriesPage = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  })

  useEffect(() => {
    loadSeries()
  }, [pagination.page])

  const loadSeries = async () => {
    try {
      setLoading(true)
      const response = await movieApi.getMovies({
        page: pagination.page,
        limit: pagination.limit,
        type: 'series',
        sort: 'latest'
      })

      if (response && response.data) {
        setMovies(response.data.movies || [])
        setPagination(response.data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 1
        })
      }
    } catch (error) {
      console.error('Error loading series:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (pagination.page < pagination.pages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }))
    }
  }

  if (loading && pagination.page === 1) {
    return <Loading />
  }

  return (
    <>

      <div className="container-custom py-8">
        <div className="flex items-center space-x-4 mb-8">
          <FaTv className="text-3xl text-purple-500" />
          <h1 className="text-3xl font-bold">Phim Bộ</h1>
        </div>

        {movies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {movies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MovieCard movie={movie} />
                </motion.div>
              ))}
            </div>

            {pagination.page < pagination.pages && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="btn-secondary px-8 py-3"
                >
                  {loading ? 'Đang tải...' : 'Xem thêm'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-rophim-textSecondary">Chưa có phim bộ nào</p>
          </div>
        )}
      </div>
    </>
  )
}

export default SeriesPage