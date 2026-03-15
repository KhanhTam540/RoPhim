// src/components/MovieCard.jsx
import { Link } from 'react-router-dom'
import { FaPlay, FaStar, FaCalendar, FaHeart, FaRegHeart } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { getImageUrl } from '../utils/imageUtils'
import { useFavorites } from '../context/FavoritesContext'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import toast from 'react-hot-toast'

// Format rating safely
const formatRating = (rating) => {
  if (rating === null || rating === undefined) return '0.0'
  const num = typeof rating === 'number' ? rating : parseFloat(rating)
  return isNaN(num) ? '0.0' : num.toFixed(1)
}

const MovieCard = ({ movie }) => {
  const { isFavorite, toggleFavorite } = useFavorites()
  const { isAuthenticated } = useAuth()
  const [isHovered, setIsHovered] = useState(false)
  const [isImageError, setIsImageError] = useState(false)

  if (!movie) return null

  const rating = formatRating(movie.ratingAverage)
  const hasRating = rating !== '0.0' && movie.ratingCount > 0
  const favorite = isFavorite(movie.id)
  
  // Get image URL with fallback
  const posterUrl = movie.poster && !isImageError 
    ? getImageUrl(movie.poster) 
    : `https://via.placeholder.com/300x450?text=${encodeURIComponent(movie.title || 'No Image')}`

  const handleFavoriteClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào yêu thích')
      return
    }

    await toggleFavorite(movie.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/phim/${movie.slug || '#'}`}>
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-rophim-card">
          {/* Image */}
          <img
            src={posterUrl}
            alt={movie.title || 'Movie poster'}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            onError={() => setIsImageError(true)}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-bold text-sm md:text-base line-clamp-2 mb-2 text-white">
                {movie.title}
              </h3>
              
              <div className="flex items-center gap-3 text-xs text-gray-300">
                {movie.releaseYear && (
                  <div className="flex items-center gap-1">
                    <FaCalendar size={10} />
                    <span>{movie.releaseYear}</span>
                  </div>
                )}
                
                {hasRating && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <FaStar size={10} />
                    <span>{rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all transform z-10 ${
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            } ${
              favorite
                ? 'bg-red-600 text-white'
                : 'bg-black/60 text-white hover:bg-red-600'
            }`}
          >
            {favorite ? <FaHeart /> : <FaRegHeart />}
          </button>

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center transform hover:scale-110 transition-transform">
              <FaPlay className="ml-1 text-white" />
            </div>
          </div>

          {/* Quality badge */}
          {movie.quality && (
            <div className="absolute top-2 left-2 bg-blue-600 text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded z-10">
              {movie.quality}
            </div>
          )}

          {/* Type badge */}
          {movie.type === 'series' && (
            <div className="absolute bottom-2 left-2 bg-purple-600 text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded z-10">
              Phim Bộ
            </div>
          )}
        </div>

        {/* Title for mobile */}
        <div className="mt-2 md:hidden">
          <h3 className="font-medium text-sm line-clamp-2">{movie.title}</h3>
          <div className="flex items-center gap-2 text-xs text-rophim-textSecondary mt-1">
            {movie.releaseYear && <span>{movie.releaseYear}</span>}
            {hasRating && (
              <span className="flex items-center gap-1">
                <FaStar className="text-yellow-400" size={10} />
                {rating}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default MovieCard