// src/pages/MovieDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { movieApi, ratingApi, favoriteApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import { useHistory } from '../hooks/useHistory'
import { useDebounce } from '../hooks/useDebounce'
import CommentSection from '../components/CommentSection'
import MovieRow from '../components/MovieRow'
import Loading from '../components/Loading'
import MoviePlayer from '../components/MoviePlayer'
import { 
  FaPlay, 
  FaStar, 
  FaCalendar, 
  FaClock, 
  FaHeart, 
  FaRegHeart,
  FaShare, 
  FaDownload, 
  FaLanguage, 
  FaClosedCaptioning,
  FaEye,
  FaFilm,
  FaUser,
  FaUsers,
  FaInfoCircle,
  FaTheaterMasks,
  FaGlobe
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

// ==================== UTILITY FUNCTIONS ====================
const formatRating = (rating) => {
  if (rating === null || rating === undefined) return '0.0'
  const num = typeof rating === 'number' ? rating : parseFloat(rating)
  return isNaN(num) ? '0.0' : num.toFixed(1)
}

const formatNumber = (num) => {
  if (num === null || num === undefined) return 0
  const n = typeof num === 'number' ? num : parseInt(num)
  return isNaN(n) ? 0 : n
}

const formatDuration = (minutes) => {
  if (!minutes) return 'N/A'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins} phút`
}

const formatViews = (views) => {
  const num = formatNumber(views)
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// ==================== MAIN COMPONENT ====================
const MovieDetail = () => {
  const { slug } = useParams()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRating, setUserRating] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedEpisode, setSelectedEpisode] = useState(null)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [imageErrors, setImageErrors] = useState({})
  const [trailerModal, setTrailerModal] = useState(false)
  
  // History states
  const [progress, setProgress] = useState(0)
  const [lastSavedProgress, setLastSavedProgress] = useState(0)
  const progressDebounced = useDebounce(progress, 2000) // Debounce 2 giây
  
  const { user, isAuthenticated } = useAuth()
  const { toggleFavorite } = useFavorites()
  const { addToHistory } = useHistory()

  // Load movie details khi slug thay đổi
  useEffect(() => {
    loadMovieDetail()
    window.scrollTo(0, 0)
  }, [slug])

  // Kiểm tra favorite và rating khi có user và movie
  useEffect(() => {
    const loadUserData = async () => {
      if (user && movie?.id) {
        try {
          await Promise.all([
            checkFavorite(movie.id),
            getUserRating(movie.id)
          ])
        } catch (error) {
          console.error('❌ Error loading user data:', error)
        }
      }
    }
    
    loadUserData()
  }, [user, movie?.id])

  // Effect để lưu progress khi debounced thay đổi
  useEffect(() => {
    if (isAuthenticated && movie?.id && progressDebounced > 0) {
      // Chỉ lưu khi tiến độ thay đổi > 5% so với lần lưu cuối
      if (Math.abs(progressDebounced - lastSavedProgress) >= 5) {
        console.log('💾 Saving progress:', progressDebounced)
        
        addToHistory({
          movieId: movie.id,
          episodeId: selectedEpisode?.id,
          progress: Math.round(progressDebounced),
          completed: progressDebounced >= 95
        })
        
        setLastSavedProgress(Math.round(progressDebounced))
      }
    }
  }, [progressDebounced, movie?.id, selectedEpisode?.id, isAuthenticated, addToHistory, lastSavedProgress])

  // ==================== API CALLS ====================
  const loadMovieDetail = async () => {
    try {
      setLoading(true)
      const response = await movieApi.getMovieBySlug(slug)
      
      // Log để debug
      console.log('📦 Movie data received:', response.data)
      
      setMovie(response.data)
      
      // Set episode mặc định nếu là phim bộ
      if (response.data?.type === 'series' && response.data?.episodes?.length > 0) {
        setSelectedEpisode(response.data.episodes[0])
      }
    } catch (error) {
      console.error('❌ Error loading movie:', error)
      toast.error('Không thể tải thông tin phim')
    } finally {
      setLoading(false)
    }
  }

  const checkFavorite = async (movieId) => {
    if (!movieId || !isAuthenticated) return
    
    try {
      const response = await favoriteApi.checkFavorite(movieId)
      setIsFavorite(response.data?.isFavorite || false)
    } catch (error) {
      console.error('❌ Error checking favorite:', error)
    }
  }

  const getUserRating = async (movieId) => {
    if (!movieId || !isAuthenticated) return
    
    try {
      const response = await ratingApi.getUserRating(movieId)
      setUserRating(response.data?.score || null)
    } catch (error) {
      console.error('❌ Error getting user rating:', error)
    }
  }

  // ==================== HANDLERS ====================
  const handleRate = async (score) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đánh giá')
      return
    }

    if (!movie?.id) return

    try {
      await ratingApi.rateMovie(movie.id, score)
      setUserRating(score)
      toast.success('Đã đánh giá phim')
      
      // Cập nhật rating trung bình
      const updatedMovie = await movieApi.getMovieBySlug(slug)
      setMovie(updatedMovie.data)
    } catch (error) {
      console.error('❌ Error rating movie:', error)
      toast.error('Không thể đánh giá phim')
    }
  }

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập')
      return
    }

    if (!movie?.id) return

    try {
      await toggleFavorite(movie.id)
      setIsFavorite(!isFavorite)
      
      toast.success(!isFavorite ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích')
    } catch (error) {
      console.error('❌ Error toggling favorite:', error)
      toast.error('Không thể thực hiện')
    }
  }

  const handleStartWatching = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để xem phim')
      return
    }

    if (!movie?.id) {
      console.error('❌ No movie ID')
      return
    }

    console.log('🎬 Started watching:', { 
      movieId: movie.id, 
      title: movie.title 
    })
    
    addToHistory({
      movieId: movie.id,
      episodeId: selectedEpisode?.id,
      progress: 0,
      completed: false
    })
    
    setProgress(0)
    setLastSavedProgress(0)
  }

  const handleProgress = (progressValue) => {
    setProgress(progressValue) // Cập nhật state để debounce xử lý
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie?.title || 'RoPhim',
        text: movie?.description || 'Xem phim hay tại RoPhim',
        url: window.location.href,
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Đã copy link vào clipboard')
    }
    setShowShareMenu(false)
  }

  const handleImageError = (type) => {
    setImageErrors(prev => ({ ...prev, [type]: true }))
  }

  const handleWatchTrailer = () => {
    if (movie?.trailerUrl) {
      setTrailerModal(true)
    } else {
      toast.error('Phim chưa có trailer')
    }
  }

  // ==================== RENDER LOADING ====================
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading />
      </div>
    )
  }

  // ==================== RENDER NOT FOUND ====================
  if (!movie) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-rophim-textSecondary mb-8">
          Phim bạn đang tìm không tồn tại hoặc đã bị xóa
        </p>
        <Link to="/" className="btn-primary">
          Về trang chủ
        </Link>
      </div>
    )
  }

  // ==================== PREPARE DATA ====================
  const baseImageUrl = import.meta.env.VITE_IMAGE_URL || 'http://localhost:5000'
  
  const backdropUrl = !imageErrors.backdrop && movie.backdrop
    ? `${baseImageUrl}/${movie.backdrop}`
    : (movie.poster && !imageErrors.poster
        ? `${baseImageUrl}/${movie.poster}`
        : 'https://via.placeholder.com/1920x1080?text=No+Image')

  const posterUrl = !imageErrors.poster && movie.poster
    ? `${baseImageUrl}/${movie.poster}`
    : null

  // Safe values
  const safeRating = formatRating(movie.ratingAverage)
  const safeRatingCount = formatNumber(movie.ratingCount)
  const safeViewCount = formatNumber(movie.viewCount)
  const safeDuration = formatDuration(movie.duration)

  // ==================== RENDER ====================
  return (
    <>
      <Helmet>
        <title>{movie.title || 'Phim'} - RoPhim</title>
        <meta name="description" content={movie.description?.substring(0, 160) || 'Xem phim online chất lượng cao'} />
        <meta property="og:title" content={movie.title} />
        <meta property="og:description" content={movie.description?.substring(0, 160)} />
        {movie.poster && (
          <meta property="og:image" content={`${baseImageUrl}/${movie.poster}`} />
        )}
      </Helmet>

      {/* Hero Section với Backdrop */}
      <section className="relative min-h-[70vh] flex items-end pb-12">
        {/* Backdrop Image */}
        <div className="absolute inset-0">
          <img
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={() => handleImageError('backdrop')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-rophim-bg via-rophim-bg/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="w-48 md:w-64 flex-shrink-0 hidden md:block"
            >
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="w-full rounded-2xl shadow-2xl border-4 border-white/10 hover:border-red-500 transition-all"
                  onError={() => handleImageError('poster')}
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-rophim-card rounded-2xl flex items-center justify-center">
                  <FaFilm className="text-6xl text-gray-600" />
                </div>
              )}
            </motion.div>

            {/* Movie Info */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1"
            >
              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-bold mb-2">{movie.title}</h1>
              
              {movie.originalTitle && (
                <p className="text-lg text-rophim-textSecondary mb-4">
                  {movie.originalTitle}
                </p>
              )}

              {/* Movie Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {movie.releaseYear && (
                  <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                    <FaCalendar className="text-red-500" />
                    <span>{movie.releaseYear}</span>
                  </div>
                )}
                
                {movie.duration > 0 && (
                  <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                    <FaClock className="text-red-500" />
                    <span>{safeDuration}</span>
                  </div>
                )}
                
                {safeRating !== '0.0' && (
                  <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                    <FaStar className="text-yellow-500" />
                    <span className="font-bold">{safeRating}</span>
                    <span className="text-rophim-textSecondary">
                      ({safeRatingCount})
                    </span>
                  </div>
                )}

                {safeViewCount > 0 && (
                  <div className="flex items-center gap-1 bg-blue-500/20 px-3 py-1 rounded-full">
                    <FaEye className="text-blue-500" />
                    <span>{formatViews(safeViewCount)} lượt xem</span>
                  </div>
                )}

                {movie.quality && (
                  <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                    {movie.quality}
                  </span>
                )}
              </div>

              {/* Genres */}
              {movie.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map(genre => (
                    <Link
                      key={genre.id}
                      to={`/the-loai/${genre.slug}`}
                      className="bg-rophim-card hover:bg-rophim-hover px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Description */}
              {movie.description && (
                <div className="mb-8 max-w-3xl">
                  <p className="text-rophim-textSecondary leading-relaxed">
                    {movie.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {movie.type === 'single' ? (
                  <a
                    href={movie.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center gap-2 px-8 py-4 text-lg"
                    onClick={handleStartWatching}
                  >
                    <FaPlay />
                    <span>Xem ngay</span>
                  </a>
                ) : (
                  <button
                    onClick={() => document.getElementById('episodes')?.scrollIntoView({ behavior: 'smooth' })}
                    className="btn-primary flex items-center gap-2 px-8 py-4 text-lg"
                  >
                    <FaPlay />
                    <span>Chọn tập</span>
                  </button>
                )}

                <button
                  onClick={handleToggleFavorite}
                  className={`btn-secondary flex items-center gap-2 px-6 py-4 ${
                    isFavorite ? 'text-red-500' : ''
                  }`}
                >
                  {isFavorite ? <FaHeart /> : <FaRegHeart />}
                  <span>{isFavorite ? 'Đã thích' : 'Yêu thích'}</span>
                </button>

                {movie.trailerUrl && (
                  <button
                    onClick={handleWatchTrailer}
                    className="btn-secondary flex items-center gap-2 px-6 py-4"
                  >
                    <FaPlay />
                    <span>Xem trailer</span>
                  </button>
                )}

                {movie.videoUrl && (
                  <a
                    href={movie.videoUrl}
                    download
                    className="btn-secondary flex items-center gap-2 px-6 py-4"
                  >
                    <FaDownload />
                    <span className="hidden md:inline">Tải xuống</span>
                  </a>
                )}

                {/* Share Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="btn-secondary flex items-center gap-2 px-6 py-4"
                  >
                    <FaShare />
                    <span className="hidden md:inline">Chia sẻ</span>
                  </button>

                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-full mb-2 left-0 bg-rophim-card border border-rophim-border rounded-lg shadow-xl p-2 min-w-[150px] z-50"
                      >
                        <button
                          onClick={handleShare}
                          className="w-full text-left px-4 py-2 hover:bg-rophim-hover rounded-lg transition-colors"
                        >
                          Copy link
                        </button>
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-left px-4 py-2 hover:bg-rophim-hover rounded-lg transition-colors"
                          onClick={() => setShowShareMenu(false)}
                        >
                          Chia sẻ Facebook
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-3 mt-6">
                {movie.language && (
                  <div className="flex items-center gap-1 text-xs text-rophim-textSecondary">
                    <FaLanguage /> {movie.language}
                  </div>
                )}
                {movie.subtitle !== undefined && (
                  <div className="flex items-center gap-1 text-xs text-rophim-textSecondary">
                    <FaClosedCaptioning /> {movie.subtitle ? 'Có phụ đề' : 'Không phụ đề'}
                  </div>
                )}
                {movie.status && (
                  <div className="flex items-center gap-1 text-xs text-rophim-textSecondary">
                    <span>•</span>
                    <span>
                      {movie.status === 'ongoing' && 'Đang chiếu'}
                      {movie.status === 'completed' && 'Hoàn thành'}
                      {movie.status === 'upcoming' && 'Sắp chiếu'}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-custom py-12">
        {/* Tabs */}
        <div className="flex border-b border-rophim-border mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-rophim-textSecondary hover:text-white'
            }`}
          >
            Tổng quan
          </button>
          {movie.type === 'series' && movie.episodes?.length > 0 && (
            <button
              onClick={() => setActiveTab('episodes')}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
                activeTab === 'episodes'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-rophim-textSecondary hover:text-white'
              }`}
            >
              Danh sách tập ({movie.episodes.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('cast')}
            className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'cast'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-rophim-textSecondary hover:text-white'
            }`}
          >
            Diễn viên
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'reviews'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-rophim-textSecondary hover:text-white'
            }`}
          >
            Đánh giá
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Video Player for Single Movie */}
                {movie.type === 'single' && movie.videoUrl && (
                  <section>
                    <h2 className="text-2xl font-bold mb-4">Xem phim</h2>
                    <MoviePlayer
                      movie={movie}
                      onStartWatching={handleStartWatching}
                      onProgress={handleProgress}
                    />
                  </section>
                )}

                {/* Description */}
                {movie.description && (
                  <section>
                    <h2 className="text-2xl font-bold mb-4">Nội dung phim</h2>
                    <p className="text-rophim-textSecondary leading-relaxed">
                      {movie.description}
                    </p>
                  </section>
                )}

                {/* Countries */}
                {movie.countries?.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold mb-4">Quốc gia</h2>
                    <div className="flex flex-wrap gap-2">
                      {movie.countries.map(country => (
                        <Link
                          key={country.id}
                          to={`/quoc-gia/${country.slug}`}
                          className="bg-rophim-card hover:bg-rophim-hover px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          <FaGlobe className="inline mr-1 text-blue-500" />
                          {country.name}
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </motion.div>
            )}

            {/* Episodes Tab */}
            {activeTab === 'episodes' && movie.type === 'series' && (
              <motion.div
                key="episodes"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                id="episodes"
              >
                <h2 className="text-2xl font-bold mb-4">Danh sách tập</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
                  {movie.episodes?.map(episode => (
                    <button
                      key={episode.id}
                      onClick={() => setSelectedEpisode(episode)}
                      className={`p-4 rounded-lg text-center transition-all ${
                        selectedEpisode?.id === episode.id
                          ? 'bg-red-600 scale-105 shadow-lg'
                          : 'bg-rophim-card hover:bg-rophim-hover'
                      }`}
                    >
                      <div className="font-bold text-lg">Tập {episode.episodeNumber}</div>
                      {episode.title && (
                        <div className="text-xs text-rophim-textSecondary truncate mt-1">
                          {episode.title}
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Player for selected episode */}
                {selectedEpisode && (
                  <div className="mt-6">
                    <MoviePlayer
                      movie={movie}
                      selectedEpisode={selectedEpisode}
                      onEpisodeChange={setSelectedEpisode}
                      onStartWatching={handleStartWatching}
                      onProgress={handleProgress}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Cast Tab */}
            {activeTab === 'cast' && (
              <motion.div
                key="cast"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="text-2xl font-bold mb-6">Diễn viên & Đạo diễn</h2>
                
                {/* Directors */}
                {movie.directors?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">Đạo diễn</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {movie.directors.map(director => (
                        <Link
                          key={director.id}
                          to={`/dao-dien/${director.slug}`}
                          className="flex items-center gap-3 p-3 bg-rophim-card rounded-lg hover:bg-rophim-hover transition-colors group"
                        >
                          {director.avatar ? (
                            <img
                              src={`${baseImageUrl}/${director.avatar}`}
                              alt={director.name}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=Director' }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                              <span className="text-xl font-bold">
                                {director.name?.charAt(0) || 'Đ'}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium group-hover:text-red-500 transition-colors truncate">
                              {director.name}
                            </p>
                            <p className="text-xs text-rophim-textSecondary">Đạo diễn</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actors */}
                {movie.actors?.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Diễn viên</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {movie.actors.map(actor => (
                        <Link
                          key={actor.id}
                          to={`/dien-vien/${actor.slug}`}
                          className="flex items-center gap-3 p-3 bg-rophim-card rounded-lg hover:bg-rophim-hover transition-colors group"
                        >
                          {actor.avatar ? (
                            <img
                              src={`${baseImageUrl}/${actor.avatar}`}
                              alt={actor.name}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=Actor' }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
                              <span className="text-xl font-bold">
                                {actor.name?.charAt(0) || 'D'}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium group-hover:text-red-500 transition-colors truncate">
                              {actor.name}
                            </p>
                            <p className="text-xs text-rophim-textSecondary">Diễn viên</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Rating Section */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold mb-6">Đánh giá phim</h2>
                  <div className="bg-rophim-card rounded-2xl p-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      {/* Average Rating */}
                      <div className="text-center">
                        <div className="text-5xl font-bold text-yellow-400">
                          {safeRating}
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <FaStar
                              key={star}
                              className={`${
                                star <= Math.round(parseFloat(safeRating))
                                  ? 'text-yellow-400'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-rophim-textSecondary mt-2">
                          {safeRatingCount} đánh giá
                        </div>
                      </div>

                      {/* User Rating */}
                      <div className="flex-1">
                        <p className="text-lg mb-4 text-center md:text-left">
                          Bạn đánh giá phim này?
                        </p>
                        <div className="flex justify-center md:justify-start gap-3">
                          {[1, 2, 3, 4, 5].map(score => (
                            <button
                              key={score}
                              onClick={() => handleRate(score)}
                              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
                                userRating === score
                                  ? 'bg-yellow-400 text-black scale-110 shadow-lg'
                                  : 'bg-rophim-hover hover:bg-rophim-border hover:scale-105'
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                        {userRating && (
                          <p className="text-sm text-rophim-textSecondary mt-4 text-center md:text-left">
                            Bạn đã đánh giá {userRating} sao
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Comments */}
                <CommentSection movieId={movie.id} />
              </motion.div>
            )}
          </div>

          {/* Sidebar - Movie Info */}
          <div className="lg:col-span-1">
            <div className="bg-rophim-card rounded-2xl p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-blue-500" />
                Thông tin phim
              </h3>
              
              <ul className="space-y-4">
                {movie.status && (
                  <li className="flex justify-between items-center">
                    <span className="text-rophim-textSecondary">Trạng thái:</span>
                    <span className="font-medium">
                      {movie.status === 'ongoing' && 'Đang chiếu'}
                      {movie.status === 'completed' && 'Hoàn thành'}
                      {movie.status === 'upcoming' && 'Sắp chiếu'}
                    </span>
                  </li>
                )}
                
                {movie.releaseYear && (
                  <li className="flex justify-between items-center">
                    <span className="text-rophim-textSecondary">Năm phát hành:</span>
                    <span className="font-medium">{movie.releaseYear}</span>
                  </li>
                )}
                
                {movie.duration > 0 && (
                  <li className="flex justify-between items-center">
                    <span className="text-rophim-textSecondary">Thời lượng:</span>
                    <span className="font-medium">{safeDuration}</span>
                  </li>
                )}
                
                {movie.language && (
                  <li className="flex justify-between items-center">
                    <span className="text-rophim-textSecondary">Ngôn ngữ:</span>
                    <span className="font-medium">{movie.language}</span>
                  </li>
                )}
                
                {movie.subtitle !== undefined && (
                  <li className="flex justify-between items-center">
                    <span className="text-rophim-textSecondary">Phụ đề:</span>
                    <span className="font-medium">
                      {movie.subtitle ? 'Có' : 'Không'}
                    </span>
                  </li>
                )}
                
                {safeViewCount > 0 && (
                  <li className="flex justify-between items-center">
                    <span className="text-rophim-textSecondary">Lượt xem:</span>
                    <span className="font-medium">{formatViews(safeViewCount)}</span>
                  </li>
                )}

                {safeRatingCount > 0 && (
                  <li className="flex justify-between items-center">
                    <span className="text-rophim-textSecondary">Lượt đánh giá:</span>
                    <span className="font-medium">{safeRatingCount.toLocaleString()}</span>
                  </li>
                )}
              </ul>

              {/* Countries */}
              {movie.countries?.length > 0 && (
                <>
                  <div className="border-t border-rophim-border my-4" />
                  <h4 className="font-bold mb-2">Quốc gia</h4>
                  <div className="flex flex-wrap gap-2">
                    {movie.countries.map(country => (
                      <Link
                        key={country.id}
                        to={`/quoc-gia/${country.slug}`}
                        className="bg-rophim-hover hover:bg-red-600 px-3 py-1 rounded-full text-xs transition-colors"
                      >
                        {country.name}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Movies */}
      {movie.relatedMovies?.length > 0 && (
        <div className="container-custom pb-12">
          <MovieRow
            title="Phim liên quan"
            movies={movie.relatedMovies}
          />
        </div>
      )}

      {/* Trailer Modal */}
      <AnimatePresence>
        {trailerModal && movie.trailerUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setTrailerModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setTrailerModal(false)}
                className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 z-10"
              >
                ✕
              </button>
              <iframe
                src={movie.trailerUrl.replace('watch?v=', 'embed/')}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default MovieDetail