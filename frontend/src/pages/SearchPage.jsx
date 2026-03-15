// src/pages/SearchPage.jsx
import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { searchApi } from '../api/auth'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { motion } from 'framer-motion'
import { FaFilm, FaUser, FaUsers, FaSort } from 'react-icons/fa'
import { getImageUrl } from '../utils/imageUtils'

const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const keyword = searchParams.get('keyword') || ''
  
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'movies', 'actors', 'directors'

  // Reset khi keyword thay đổi
  useEffect(() => {
    setResults(null)
    setPage(1)
    setTotal(0)
    setActiveTab('all')
  }, [keyword])

  // Load dữ liệu
  useEffect(() => {
    if (keyword) {
      performSearch()
    }
  }, [keyword, page])

  const performSearch = async () => {
    try {
      setLoading(true)
      console.log('🔍 Searching for:', keyword, 'page:', page)
      
      const response = await searchApi.search({ 
        keyword, 
        page, 
        limit: 20 
      })
      
      console.log('📦 Search response:', response)

      const { movies, actors, directors, pagination } = response.data
      
      if (page === 1) {
        setResults({ movies, actors, directors })
      } else {
        setResults(prev => ({
          movies: [...(prev?.movies || []), ...movies],
          actors: [...(prev?.actors || []), ...actors],
          directors: [...(prev?.directors || []), ...directors],
        }))
      }
      
      const totalCount = (movies?.length || 0) + (actors?.length || 0) + (directors?.length || 0)
      setTotal(pagination?.total || totalCount)
      setHasMore(page < (pagination?.pages || 1))

    } catch (error) {
      console.error('❌ Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    setPage(p => p + 1)
  }

  // Lọc kết quả theo tab
  const getFilteredResults = () => {
    if (!results) return { movies: [], actors: [], directors: [] }
    
    switch(activeTab) {
      case 'movies':
        return { movies: results.movies || [], actors: [], directors: [] }
      case 'actors':
        return { movies: [], actors: results.actors || [], directors: [] }
      case 'directors':
        return { movies: [], actors: [], directors: results.directors || [] }
      default:
        return results
    }
  }

  const filteredResults = getFilteredResults()
  const hasMovies = filteredResults.movies?.length > 0
  const hasActors = filteredResults.actors?.length > 0
  const hasDirectors = filteredResults.directors?.length > 0
  const hasAnyResults = hasMovies || hasActors || hasDirectors

  if (!keyword) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="bg-rophim-card rounded-lg border border-rophim-border p-12">
          <FaFilm className="mx-auto text-6xl text-rophim-textSecondary mb-4" />
          <h2 className="text-2xl font-bold mb-2">Nhập từ khóa tìm kiếm</h2>
          <p className="text-rophim-textSecondary">
            Tìm kiếm phim, diễn viên, đạo diễn theo tên
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Tìm kiếm: {keyword} - RoPhim</title>
        <meta name="description" content={`Kết quả tìm kiếm cho "${keyword}" trên RoPhim`} />
      </Helmet>

      <div className="container-custom py-8">
        <motion.div
          key={keyword}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Kết quả tìm kiếm
              </h1>
              <p className="text-rophim-textSecondary">
                Từ khóa: <span className="text-white font-medium">"{keyword}"</span>
                {total > 0 && (
                  <span className="ml-2">- Tìm thấy <span className="text-blue-500 font-bold">{total}</span> kết quả</span>
                )}
              </p>
            </div>
          </div>

          {/* Tabs */}
          {results && (
            <div className="flex space-x-1 mb-6 bg-rophim-card p-1 rounded-lg border border-rophim-border">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  activeTab === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-rophim-border text-rophim-textSecondary'
                }`}
              >
                Tất cả ({Object.values(results).flat().length})
              </button>
              <button
                onClick={() => setActiveTab('movies')}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  activeTab === 'movies' 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-rophim-border text-rophim-textSecondary'
                }`}
              >
                Phim ({results.movies?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('actors')}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  activeTab === 'actors' 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-rophim-border text-rophim-textSecondary'
                }`}
              >
                Diễn viên ({results.actors?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('directors')}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  activeTab === 'directors' 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-rophim-border text-rophim-textSecondary'
                }`}
              >
                Đạo diễn ({results.directors?.length || 0})
              </button>
            </div>
          )}

          {loading && page === 1 ? (
            <Loading />
          ) : (
            <>
              {/* Movies */}
              {hasMovies && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <FaFilm className="mr-2 text-blue-500" />
                    Phim
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {filteredResults.movies.map(movie => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                </section>
              )}

              {/* Actors */}
              {hasActors && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <FaUsers className="mr-2 text-green-500" />
                    Diễn viên
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredResults.actors.map(actor => (
                      <Link
                        key={actor.id}
                        to={`/actors/${actor.slug}`}
                        className="bg-rophim-card rounded-lg p-4 border border-rophim-border hover:border-blue-500 transition-colors group"
                      >
                        <div className="text-center">
                          {actor.avatar ? (
                            <img
                              src={getImageUrl(actor.avatar)}
                              alt={actor.name}
                              className="w-24 h-24 rounded-full mx-auto mb-3 object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 mx-auto mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <span className="text-3xl font-bold text-white">
                                {actor.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <h3 className="font-medium group-hover:text-blue-500 transition-colors">
                            {actor.name}
                          </h3>
                          {actor.nationality && (
                            <p className="text-sm text-rophim-textSecondary mt-1">
                              {actor.nationality}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Directors */}
              {hasDirectors && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <FaUsers className="mr-2 text-purple-500" />
                    Đạo diễn
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredResults.directors.map(director => (
                      <Link
                        key={director.id}
                        to={`/directors/${director.slug}`}
                        className="bg-rophim-card rounded-lg p-4 border border-rophim-border hover:border-blue-500 transition-colors group"
                      >
                        <div className="text-center">
                          {director.avatar ? (
                            <img
                              src={getImageUrl(director.avatar)}
                              alt={director.name}
                              className="w-24 h-24 rounded-full mx-auto mb-3 object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mx-auto mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <span className="text-3xl font-bold text-white">
                                {director.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <h3 className="font-medium group-hover:text-blue-500 transition-colors">
                            {director.name}
                          </h3>
                          {director.nationality && (
                            <p className="text-sm text-rophim-textSecondary mt-1">
                              {director.nationality}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* No results */}
              {!hasAnyResults && !loading && (
                <div className="text-center py-16 bg-rophim-card rounded-lg border border-rophim-border">
                  <FaFilm className="mx-auto text-6xl text-rophim-textSecondary mb-4" />
                  <p className="text-xl text-rophim-textSecondary mb-2">
                    Không tìm thấy kết quả nào cho "{keyword}"
                  </p>
                  <p className="text-sm text-rophim-textSecondary">
                    Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả
                  </p>
                </div>
              )}

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
                      <span>Xem thêm kết quả</span>
                    )}
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