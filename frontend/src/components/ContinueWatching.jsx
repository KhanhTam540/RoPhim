// src/components/ContinueWatching.jsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaPlay, FaClock, FaFilm } from 'react-icons/fa'
import { getImageUrl } from '../utils/imageUtils'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const ContinueWatching = ({ history, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[2/3] bg-rophim-card rounded-lg" />
            <div className="h-4 bg-rophim-card rounded mt-2 w-3/4" />
            <div className="h-3 bg-rophim-card rounded mt-1 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (history.length === 0) return null

  const formatTimeAgo = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi })
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {history.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative group"
        >
          <Link to={`/phim/${item.movie.slug}`} className="block">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
              {item.movie.poster ? (
                <img
                  src={getImageUrl(item.movie.poster)}
                  alt={item.movie.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-purple-600/5 flex items-center justify-center">
                  <FaFilm className="text-4xl text-purple-500/50" />
                </div>
              )}

              {/* Progress Bar */}
              {item.progress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                  <div 
                    className="h-full bg-purple-600"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}

              {/* Episode Badge */}
              {item.episode && (
                <div className="absolute top-2 left-2 bg-purple-600 text-xs font-bold px-2 py-1 rounded">
                  Tập {item.episode.episodeNumber}
                </div>
              )}

              {/* Quality Badge */}
              {item.movie.quality && (
                <div className="absolute top-2 right-2 bg-blue-600 text-xs font-bold px-2 py-1 rounded">
                  {item.movie.quality}
                </div>
              )}

              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform">
                  <FaPlay className="text-white ml-1" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="mt-2">
              <h3 className="font-medium line-clamp-1 group-hover:text-purple-500 transition-colors">
                {item.movie.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-rophim-textSecondary mt-1">
                <span className="flex items-center gap-1">
                  <FaClock size={10} />
                  {formatTimeAgo(item.watchedAt)}
                </span>
                {item.progress > 0 && (
                  <span className="text-purple-500">{item.progress}%</span>
                )}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

export default ContinueWatching