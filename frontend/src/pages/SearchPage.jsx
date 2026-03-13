import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { searchApi } from '../api/auth'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { motion } from 'framer-motion'

const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const keyword = searchParams.get('keyword') || ''
  
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (keyword) {
      performSearch()
    }
  }, [keyword, page])

  const performSearch = async () => {
    try {
      setLoading(true)
      const response = await searchApi.search({ 
        keyword, 
        page, 
        limit: 20 
      })
      const { movies, actors, directors, pagination } = response.data
      
      setResults(prev => ({
        movies: page === 1 ? movies : [...(prev?.movies || []), ...movies],
        actors: page === 1 ? actors : [...(prev?.actors || []), ...actors],
        directors: page === 1 ? directors : [...(prev?.directors || []), ...directors],
      }))
      setHasMore(page < pagination.pages)
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!keyword) {
    return (
      <div className="container-custom py-12 text-center">
        <h2 className="text-2xl">Vui lòng nhập từ khóa tìm kiếm</h2>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Tìm kiếm: {keyword} - RoPhim</title>
      </Helmet>

      <div className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-6">
            Kết quả tìm kiếm cho "{keyword}"
          </h1>

          {loading && page === 1 ? (
            <Loading />
          ) : (
            <>
              {/* Movies */}
              {results?.movies?.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-4">Phim</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {results.movies.map(movie => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                </section>
              )}

              {/* Actors */}
              {results?.actors?.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-4">Diễn viên</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {results.actors.map(actor => (
                      <div key={actor.id} className="text-center">
                        {actor.avatar ? (
                          <img
                            src={`${import.meta.env.VITE_IMAGE_URL}/${actor.avatar}`}
                            alt={actor.name}
                            className="w-32 h-32 rounded-full mx-auto mb-2 object-cover"
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-blue-600 mx-auto mb-2 flex items-center justify-center">
                            <span className="text-3xl font-bold">
                              {actor.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <h3 className="font-medium">{actor.name}</h3>
                        {actor.nationality && (
                          <p className="text-sm text-rophim-textSecondary">
                            {actor.nationality}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Directors */}
              {results?.directors?.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-4">Đạo diễn</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {results.directors.map(director => (
                      <div key={director.id} className="text-center">
                        {director.avatar ? (
                          <img
                            src={`${import.meta.env.VITE_IMAGE_URL}/${director.avatar}`}
                            alt={director.name}
                            className="w-32 h-32 rounded-full mx-auto mb-2 object-cover"
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-blue-600 mx-auto mb-2 flex items-center justify-center">
                            <span className="text-3xl font-bold">
                              {director.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <h3 className="font-medium">{director.name}</h3>
                        {director.nationality && (
                          <p className="text-sm text-rophim-textSecondary">
                            {director.nationality}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {!results?.movies?.length && 
               !results?.actors?.length && 
               !results?.directors?.length && (
                <div className="text-center py-12">
                  <p className="text-rophim-textSecondary">
                    Không tìm thấy kết quả nào cho "{keyword}"
                  </p>
                </div>
              )}

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
          )}
        </motion.div>
      </div>
    </>
  )
}

export default SearchPage