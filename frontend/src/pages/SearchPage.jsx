// src/pages/SearchPage.jsx
import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { searchApi } from '../api/auth'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { motion } from 'framer-motion'
import { 
  FaFilm, FaUser, FaVideo, FaSearch, 
  FaTimes, FaChevronDown, FaSortAmountDown
} from 'react-icons/fa'
import { getImageUrl } from '../utils/imageUtils'

const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const keyword = searchParams.get('keyword') || ''
  
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [sortBy, setSortBy] = useState('latest')
  const [activeTab, setActiveTab] = useState('all') // 'all', 'movies', 'actors', 'directors'

  // Danh sách sort options
  const sortOptions = [
    { value: 'latest', label: 'Mới nhất' },
    { value: 'popular', label: 'Xem nhiều' },
    { value: 'rating', label: 'Đánh giá cao' },
    { value: 'year_desc', label: 'Năm mới nhất' },
    { value: 'title_asc', label: 'Tên A-Z' }
  ]

  // Reset khi keyword thay đổi
  useEffect(() => {
    setResults(null)
    setPage(1)
    setTotal(0)
    setActiveTab('all')
  }, [keyword])

  useEffect(() => {
    if (keyword) {
      performSearch()
    }
  }, [keyword, page, sortBy])

  const performSearch = async () => {
    try {
      setLoading(true)
      const response = await searchApi.search({ 
        keyword, 
        page, 
        limit: 20,
        sort: sortBy
      })
      
      console.log('📦 Search response:', response)

      const { movies, actors, directors, pagination } = response.data
      
      setResults(prev => ({
        movies: page === 1 ? movies : [...(prev?.movies || []), ...movies],
        actors: page === 1 ? actors : [...(prev?.actors || []), ...actors],
        directors: page === 1 ? directors : [...(prev?.directors || []), ...directors],
      }))
      
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
    setPage(prev => prev + 1)
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
    setPage(1)
  }

  const getActiveCount = () => {
    if (!results) return 0
    switch(activeTab) {
      case 'movies': return results.movies?.length || 0
      case 'actors': return results.actors?.length || 0
      case 'directors': return results.directors?.length || 0
      default: 
        return (results.movies?.length || 0) + 
               (results.actors?.length || 0) + 
               (results.directors?.length || 0)
    }
  }

  if (!keyword) {
    return (
      <div className="container-custom py-16 text-center">
        <div className="max-w-md mx-auto">
          <FaSearch className="mx-auto text-6xl text-rophim-textSecondary mb-4" />
          <h2 className="text-2xl font-bold mb-2">Nhập từ khóa tìm kiếm</h2>
          <p className="text-rophim-textSecondary">
            Tìm kiếm phim, diễn viên, đạo diễn yêu thích của bạn
          </p>
        </div>
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
          key={keyword}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FaSearch className="text-3xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    Kết quả tìm kiếm
                  </h1>
                  <p className="text-rophim-textSecondary mt-2">
                    Từ khóa: <span className="text-white font-medium">"{keyword}"</span>
                  </p>
                </div>
              </div>

              {/* Sort dropdown - FIXED */}
              <div className="hidden md:flex bg-rophim-card px-4 py-2 rounded-lg border border-rophim-border items-center space-x-2">
                <FaSortAmountDown className="text-blue-500" />
                <span className="text-rophim-textSecondary">Sắp xếp:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="appearance-none bg-transparent text-white pr-8 py-1 focus:outline-none cursor-pointer"
                    style={{ color: 'white' }}
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-rophim-textSecondary pointer-events-none" size={12} />
                </div>
              </div>
            </div>

            {/* Kết quả tìm thấy */}
            <div className="mb-6 p-4 bg-rophim-card rounded-lg border border-rophim-border">
              <p className="text-rophim-textSecondary">
                Tìm thấy <span className="text-white font-bold text-lg">{total}</span> kết quả
              </p>
            </div>

            {/* Sort trên mobile */}
            <div className="md:hidden mb-4">
              <div className="bg-rophim-card px-4 py-2 rounded-lg border border-rophim-border flex items-center space-x-2 w-full">
                <FaSortAmountDown className="text-blue-500" />
                <span className="text-rophim-textSecondary">Sắp xếp:</span>
                <div className="relative flex-1">
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="appearance-none bg-transparent text-white w-full pr-8 py-1 focus:outline-none cursor-pointer"
                    style={{ color: 'white' }}
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-rophim-textSecondary pointer-events-none" size={12} />
                </div>
              </div>
            </div>

            {/* Tabs */}
            {results && (
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-rophim-card text-rophim-textSecondary hover:text-white border border-rophim-border'
                  }`}
                >
                  Tất cả ({total})
                </button>
                <button
                  onClick={() => setActiveTab('movies')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'movies' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-rophim-card text-rophim-textSecondary hover:text-white border border-rophim-border'
                  }`}
                >
                  Phim ({results.movies?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('actors')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'actors' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-rophim-card text-rophim-textSecondary hover:text-white border border-rophim-border'
                  }`}
                >
                  Diễn viên ({results.actors?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('directors')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'directors' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-rophim-card text-rophim-textSecondary hover:text-white border border-rophim-border'
                  }`}
                >
                  Đạo diễn ({results.directors?.length || 0})
                </button>
              </div>
            )}
          </div>

          {loading && page === 1 ? (
            <Loading />
          ) : (
            <>
              {/* Movies */}
              {(!results || activeTab === 'all' || activeTab === 'movies') && 
               results?.movies?.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FaFilm className="text-blue-500" />
                    Phim ({results.movies.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {results.movies.map(movie => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                </section>
              )}

              {/* Actors */}
              {(!results || activeTab === 'all' || activeTab === 'actors') && 
               results?.actors?.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FaUser className="text-green-500" />
                    Diễn viên ({results.actors.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {results.actors.map(actor => (
                      <Link
                        key={actor.id}
                        to={`/actors/${actor.slug}`}
                        className="group"
                      >
                        <div className="text-center">
                          <div className="relative w-32 h-32 mx-auto mb-3">
                            {actor.avatar ? (
                              <img
                                src={getImageUrl(actor.avatar)}
                                alt={actor.name}
                                className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full rounded-full bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
                                <span className="text-4xl font-bold text-white">
                                  {actor.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <h3 className="font-medium group-hover:text-blue-500 transition-colors">
                            {actor.name}
                          </h3>
                          {actor.nationality && (
                            <p className="text-sm text-rophim-textSecondary">
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
              {(!results || activeTab === 'all' || activeTab === 'directors') && 
               results?.directors?.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FaVideo className="text-purple-500" />
                    Đạo diễn ({results.directors.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {results.directors.map(director => (
                      <Link
                        key={director.id}
                        to={`/directors/${director.slug}`}
                        className="group"
                      >
                        <div className="text-center">
                          <div className="relative w-32 h-32 mx-auto mb-3">
                            {director.avatar ? (
                              <img
                                src={getImageUrl(director.avatar)}
                                alt={director.name}
                                className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                <span className="text-4xl font-bold text-white">
                                  {director.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <h3 className="font-medium group-hover:text-blue-500 transition-colors">
                            {director.name}
                          </h3>
                          {director.nationality && (
                            <p className="text-sm text-rophim-textSecondary">
                              {director.nationality}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {(!results || 
                (activeTab === 'all' && 
                 !results?.movies?.length && 
                 !results?.actors?.length && 
                 !results?.directors?.length) ||
                (activeTab === 'movies' && !results?.movies?.length) ||
                (activeTab === 'actors' && !results?.actors?.length) ||
                (activeTab === 'directors' && !results?.directors?.length)) && (
                <div className="text-center py-16 bg-rophim-card rounded-lg border border-rophim-border">
                  <FaSearch className="mx-auto text-6xl text-rophim-textSecondary mb-4" />
                  <p className="text-xl text-rophim-textSecondary mb-2">
                    Không tìm thấy kết quả nào
                  </p>
                  <p className="text-sm text-rophim-textSecondary">
                    Thử tìm kiếm với từ khóa khác
                  </p>
                </div>
              )}

              {hasMore && getActiveCount() > 0 && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="bg-rophim-card border border-rophim-border hover:border-blue-500 text-white font-medium px-8 py-3 rounded-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
          )}
        </motion.div>
      </div>
    </>
  )
}

export default SearchPage