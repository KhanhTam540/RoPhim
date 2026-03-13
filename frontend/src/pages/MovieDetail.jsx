import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { movieApi, ratingApi, favoriteApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import CommentSection from '../components/CommentSection'
import MovieRow from '../components/MovieRow'
import Loading from '../components/Loading'
import ReactPlayer from 'react-player'
import { FaPlay, FaStar, FaCalendar, FaClock, FaHeart, FaRegHeart } from 'react-icons/fa'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const MovieDetail = () => {
  const { slug } = useParams()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRating, setUserRating] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedEpisode, setSelectedEpisode] = useState(null)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    loadMovieDetail()
  }, [slug])

  useEffect(() => {
    if (user && movie) {
      checkFavorite()
      getUserRating()
    }
  }, [user, movie])

  const loadMovieDetail = async () => {
    try {
      setLoading(true)
      const response = await movieApi.getMovieBySlug(slug)
      setMovie(response.data)
      if (response.data.type === 'series' && response.data.episodes?.length > 0) {
        setSelectedEpisode(response.data.episodes[0])
      }
    } catch (error) {
      console.error('Error loading movie:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkFavorite = async () => {
    try {
      const response = await favoriteApi.checkFavorite(movie.id)
      setIsFavorite(response.data.isFavorite)
    } catch (error) {
      console.error('Error checking favorite:', error)
    }
  }

  const getUserRating = async () => {
    try {
      const response = await ratingApi.getUserRating(movie.id)
      setUserRating(response.data.score)
    } catch (error) {
      console.error('Error getting user rating:', error)
    }
  }

  const handleRate = async (score) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đánh giá')
      return
    }

    try {
      await ratingApi.rateMovie(movie.id, score)
      setUserRating(score)
      toast.success('Đã đánh giá phim')
      loadMovieDetail() // Reload to update average rating
    } catch (error) {
      console.error('Error rating movie:', error)
    }
  }

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập')
      return
    }

    try {
      if (isFavorite) {
        await favoriteApi.removeFavorite(movie.id)
        setIsFavorite(false)
        toast.success('Đã xóa khỏi danh sách yêu thích')
      } else {
        await favoriteApi.addFavorite(movie.id)
        setIsFavorite(true)
        toast.success('Đã thêm vào danh sách yêu thích')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  if (loading) {
    return <Loading />
  }

  if (!movie) {
    return (
      <div className="container-custom py-12 text-center">
        <h2 className="text-2xl">Không tìm thấy phim</h2>
      </div>
    )
  }

  const imageUrl = movie.backdrop || movie.poster
    ? `${import.meta.env.VITE_IMAGE_URL}/${movie.backdrop || movie.poster}`
    : 'https://via.placeholder.com/1920x1080?text=No+Image'

  return (
    <>
      <Helmet>
        <title>{movie.title} - RoPhim</title>
        <meta name="description" content={movie.description?.substring(0, 160)} />
      </Helmet>

      {/* Hero section */}
      <section className="relative h-[60vh] min-h-[400px]">
        <img
          src={imageUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rophim-bg via-transparent to-transparent">
          <div className="container-custom h-full flex items-end pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {movie.title}
              </h1>
              
              {movie.originalTitle && (
                <p className="text-lg text-rophim-textSecondary mb-4">
                  {movie.originalTitle}
                </p>
              )}

              {/* Movie info */}
              <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                {movie.releaseYear && (
                  <div className="flex items-center space-x-1">
                    <FaCalendar />
                    <span>{movie.releaseYear}</span>
                  </div>
                )}
                
                {movie.duration && (
                  <div className="flex items-center space-x-1">
                    <FaClock />
                    <span>{movie.duration} phút</span>
                  </div>
                )}
                
                {movie.ratingAverage > 0 && (
                  <div className="flex items-center space-x-1 text-yellow-400">
                    <FaStar />
                    <span>{movie.ratingAverage.toFixed(1)}</span>
                    <span className="text-rophim-textSecondary">
                      ({movie.ratingCount} đánh giá)
                    </span>
                  </div>
                )}

                {movie.quality && (
                  <span className="bg-blue-600 px-2 py-1 rounded text-xs font-bold">
                    {movie.quality}
                  </span>
                )}
              </div>

              {/* Genres */}
              {movie.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map(genre => (
                    <span
                      key={genre.id}
                      className="bg-rophim-card px-3 py-1 rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-4">
                {movie.type === 'single' ? (
                  <a
                    href={movie.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center space-x-2"
                  >
                    <FaPlay />
                    <span>Xem ngay</span>
                  </a>
                ) : (
                  <button
                    onClick={() => document.getElementById('episodes').scrollIntoView({ behavior: 'smooth' })}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <FaPlay />
                    <span>Chọn tập</span>
                  </button>
                )}

                <button
                  onClick={handleToggleFavorite}
                  className={`btn-secondary flex items-center space-x-2 ${
                    isFavorite ? 'text-red-500' : ''
                  }`}
                >
                  {isFavorite ? <FaHeart /> : <FaRegHeart />}
                  <span>{isFavorite ? 'Đã thích' : 'Yêu thích'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Description */}
            {movie.description && (
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-4">Nội dung phim</h2>
                <p className="text-rophim-textSecondary leading-relaxed">
                  {movie.description}
                </p>
              </section>
            )}

            {/* Cast */}
            {(movie.actors?.length > 0 || movie.directors?.length > 0) && (
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-4">Diễn viên & Đạo diễn</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {movie.directors?.map(director => (
                    <div key={director.id} className="text-center">
                      {director.avatar ? (
                        <img
                          src={`${import.meta.env.VITE_IMAGE_URL}/${director.avatar}`}
                          alt={director.name}
                          className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-blue-600 mx-auto mb-2 flex items-center justify-center">
                          <span className="text-2xl font-bold">
                            {director.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <p className="font-medium">{director.name}</p>
                      <p className="text-xs text-rophim-textSecondary">Đạo diễn</p>
                    </div>
                  ))}
                  
                  {movie.actors?.map(actor => (
                    <div key={actor.id} className="text-center">
                      {actor.avatar ? (
                        <img
                          src={`${import.meta.env.VITE_IMAGE_URL}/${actor.avatar}`}
                          alt={actor.name}
                          className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-blue-600 mx-auto mb-2 flex items-center justify-center">
                          <span className="text-2xl font-bold">
                            {actor.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <p className="font-medium">{actor.name}</p>
                      <p className="text-xs text-rophim-textSecondary">Diễn viên</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Episodes for series */}
            {movie.type === 'series' && movie.episodes?.length > 0 && (
              <section id="episodes" className="mb-8">
                <h2 className="text-xl font-bold mb-4">Danh sách tập</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {movie.episodes.map(episode => (
                    <button
                      key={episode.id}
                      onClick={() => setSelectedEpisode(episode)}
                      className={`p-3 rounded-lg text-center transition-colors ${
                        selectedEpisode?.id === episode.id
                          ? 'bg-blue-600'
                          : 'bg-rophim-card hover:bg-rophim-hover'
                      }`}
                    >
                      <div className="font-bold">Tập {episode.episodeNumber}</div>
                      {episode.title && (
                        <div className="text-xs text-rophim-textSecondary truncate">
                          {episode.title}
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Video player for selected episode */}
                {selectedEpisode && (
                  <div className="mt-6 aspect-video bg-black rounded-lg overflow-hidden">
                    <ReactPlayer
                      url={selectedEpisode.videoUrl}
                      width="100%"
                      height="100%"
                      controls
                      playing
                      config={{
                        file: {
                          attributes: {
                            controlsList: 'nodownload'
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </section>
            )}

            {/* Rating section */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">Đánh giá phim</h2>
              <div className="bg-rophim-card rounded-lg p-6">
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-400">
                      {movie.ratingAverage?.toFixed(1) || '0.0'}
                    </div>
                    <div className="text-sm text-rophim-textSecondary">
                      {movie.ratingCount || 0} đánh giá
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="mb-2">Bạn đánh giá phim này?</p>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map(score => (
                        <button
                          key={score}
                          onClick={() => handleRate(score)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            userRating === score
                              ? 'bg-yellow-400 text-black'
                              : 'bg-rophim-hover hover:bg-rophim-border'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                    {userRating && (
                      <p className="text-sm text-rophim-textSecondary mt-2">
                        Bạn đã đánh giá {userRating} sao
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Comments */}
            <CommentSection movieId={movie.id} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Country */}
            {movie.countries?.length > 0 && (
              <div className="bg-rophim-card rounded-lg p-4 mb-4">
                <h3 className="font-bold mb-2">Quốc gia</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.countries.map(country => (
                    <span
                      key={country.id}
                      className="bg-rophim-hover px-3 py-1 rounded-full text-sm"
                    >
                      {country.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-rophim-card rounded-lg p-4">
              <h3 className="font-bold mb-2">Thông tin phim</h3>
              <ul className="space-y-2 text-sm">
                {movie.status && (
                  <li className="flex justify-between">
                    <span className="text-rophim-textSecondary">Trạng thái:</span>
                    <span className="font-medium">
                      {movie.status === 'ongoing' && 'Đang chiếu'}
                      {movie.status === 'completed' && 'Hoàn thành'}
                      {movie.status === 'upcoming' && 'Sắp chiếu'}
                    </span>
                  </li>
                )}
                {movie.language && (
                  <li className="flex justify-between">
                    <span className="text-rophim-textSecondary">Ngôn ngữ:</span>
                    <span className="font-medium">{movie.language}</span>
                  </li>
                )}
                {movie.subtitle !== undefined && (
                  <li className="flex justify-between">
                    <span className="text-rophim-textSecondary">Phụ đề:</span>
                    <span className="font-medium">
                      {movie.subtitle ? 'Có' : 'Không'}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Related movies */}
      {movie.relatedMovies?.length > 0 && (
        <MovieRow
          title="Phim liên quan"
          movies={movie.relatedMovies}
        />
      )}
    </>
  )
}

export default MovieDetail