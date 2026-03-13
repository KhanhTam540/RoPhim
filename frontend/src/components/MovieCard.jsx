// src/components/MovieCard.jsx
import { Link } from 'react-router-dom'
import { FaPlay, FaStar, FaCalendar } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { getImageUrl } from '../utils/imageUtils'

// Format rating safely
const formatRating = (rating) => {
  if (rating === null || rating === undefined) return '0.0'
  const num = typeof rating === 'number' ? rating : parseFloat(rating)
  return isNaN(num) ? '0.0' : num.toFixed(1)
}

const MovieCard = ({ movie }) => {
  if (!movie) return null

  const rating = formatRating(movie.ratingAverage)
  const hasRating = rating !== '0.0' && movie.ratingCount > 0
  
  // Get image URL with fallback
  const posterUrl = movie.poster ? getImageUrl(movie.poster) : 'https://picsum.photos/300/450?random=1'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative group cursor-pointer"
    >
      <Link to={`/phim/${movie.slug || '#'}`}>
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-rophim-card">
          {/* Image */}
          <img
            src={posterUrl}
            alt={movie.title || 'Movie poster'}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://picsum.photos/300/450?random=1'
            }}
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

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center transform hover:scale-110 transition-transform">
              <FaPlay className="ml-1 text-white" />
            </div>
          </div>

          {/* Quality badge */}
          {movie.quality && (
            <div className="absolute top-2 right-2 bg-blue-600 text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded">
              {movie.quality}
            </div>
          )}

          {/* Type badge */}
          {movie.type === 'series' && (
            <div className="absolute top-2 left-2 bg-purple-600 text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded">
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