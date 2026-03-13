import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { genreApi, movieApi } from '../api/auth'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { motion } from 'framer-motion'

const GenrePage = () => {
  const { slug } = useParams()
  const [genre, setGenre] = useState(null)
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    loadGenreAndMovies()
  }, [slug, page])

  const loadGenreAndMovies = async () => {
    try {
      setLoading(true)
      
      // Load genre info
      const genreResponse = await genreApi.getGenreBySlug(slug)
      setGenre(genreResponse.data.genre)

      // Load movies of this genre
      const moviesResponse = await movieApi.getMovies({ 
        genre: slug,
        page,
        limit: 20 
      })
      const { movies: newMovies, pagination } = moviesResponse.data
      
      setMovies(prev => page === 1 ? newMovies : [...prev, ...newMovies])
      setHasMore(page < pagination.pages)
    } catch (error) {
      console.error('Error loading genre:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && page === 1) {
    return <Loading />
  }

  return (
    <>
      <Helmet>
        <title>{genre?.name || 'Thể loại'} - RoPhim</title>
        {genre?.description && (
          <meta name="description" content={genre.description} />
        )}
      </Helmet>

      <div className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Genre info */}
          {genre && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">{genre.name}</h1>
              {genre.description && (
                <p className="text-rophim-textSecondary">{genre.description}</p>
              )}
            </div>
          )}

          {/* Movies grid */}
          {movies.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {movies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
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
              <p className="text-rophim-textSecondary">
                Chưa có phim nào trong thể loại này
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}

export default GenrePage