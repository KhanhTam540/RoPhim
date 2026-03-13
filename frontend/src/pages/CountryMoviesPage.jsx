// src/pages/CountryMoviesPage.jsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { movieApi, countryApi } from '../api/auth'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { motion } from 'framer-motion'
import { FaGlobe } from 'react-icons/fa'

const CountryMoviesPage = () => {
  const { slug } = useParams()
  const [country, setCountry] = useState(null)
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  })

  useEffect(() => {
    loadCountryAndMovies()
  }, [slug, pagination.page])

  const loadCountryAndMovies = async () => {
    try {
      setLoading(true)
      
      // Load thông tin quốc gia
      const countryResponse = await countryApi.getCountryBySlug(slug)
      setCountry(countryResponse.data?.country || null)

      // Load phim theo quốc gia
      const moviesResponse = await movieApi.getMovies({
        page: pagination.page,
        limit: pagination.limit,
        country: slug,
        sort: 'latest'
      })

      if (moviesResponse && moviesResponse.data) {
        setMovies(moviesResponse.data.movies || [])
        setPagination(moviesResponse.data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 1
        })
      }
    } catch (error) {
      console.error('Error loading country movies:', error)
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
      <Helmet>
        <title>Phim {country?.name || 'quốc gia'} - RoPhim</title>
        <meta name="description" content={`Xem phim ${country?.name} hay nhất, mới nhất`} />
      </Helmet>

      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <FaGlobe className="text-green-500" size={24} />
            <h1 className="text-3xl font-bold">Phim {country?.name}</h1>
          </div>
          {country?.description && (
            <p className="text-rophim-textSecondary">{country.description}</p>
          )}
        </motion.div>

        {/* Movies Grid */}
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

            {/* Load More Button */}
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
            <p className="text-rophim-textSecondary">Chưa có phim nào từ quốc gia này</p>
          </div>
        )}
      </div>
    </>
  )
}

export default CountryMoviesPage