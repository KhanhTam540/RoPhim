import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { favoriteApi } from '../api/auth'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { motion } from 'framer-motion'
import { FaHeart } from 'react-icons/fa'

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [page])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      const response = await favoriteApi.getFavorites({ page, limit: 20 })
      const { movies, pagination } = response.data
      
      setFavorites(prev => page === 1 ? movies : [...prev, ...movies])
      setHasMore(page < pagination.pages)
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (movieId) => {
    try {
      await favoriteApi.removeFavorite(movieId)
      setFavorites(prev => prev.filter(m => m.id !== movieId))
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  return (
    <>
      <Helmet>
        <title>Phim yêu thích - RoPhim</title>
      </Helmet>

      <div className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-6 flex items-center">
            <FaHeart className="text-red-500 mr-2" />
            Phim yêu thích
          </h1>

          {loading && page === 1 ? (
            <Loading />
          ) : (
            <>
              {favorites.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {favorites.map(movie => (
                      <div key={movie.id} className="relative group">
                        <MovieCard movie={movie} />
                        <button
                          onClick={() => handleRemoveFavorite(movie.id)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaHeart size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {hasMore && (
                    <div className="text-center mt-8">
                      <button
                        onClick={() => setPage(p => p + 1)}
                        className="btn-secondary"
                        disabled={loading}
                      >
                        {loading ? 'Đang tải...' : 'Xem thêm'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-rophim-textSecondary mb-4">
                    Bạn chưa có phim yêu thích nào
                  </p>
                  <a href="/" className="btn-primary inline-block">
                    Khám phá phim ngay
                  </a>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </>
  )
}

export default FavoritesPage