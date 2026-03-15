// src/pages/FavoritesPage.jsx
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaHeart, FaTrash, FaFilm, FaPlay } from 'react-icons/fa'
import { useFavorites } from '../context/FavoritesContext'
import { getImageUrl } from '../utils/imageUtils'
import LoadingSpinner from '../components/LoadingSpinner'

const FavoritesPage = () => {
  const { favorites, loading, removeFavorite } = useFavorites()
  const [selectedItems, setSelectedItems] = useState([])

  const handleSelectAll = () => {
    if (selectedItems.length === favorites.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(favorites.map(m => m.id))
    }
  }

  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    )
  }

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedItems.map(id => removeFavorite(id)))
      setSelectedItems([])
    } catch (error) {
      console.error('Error deleting selected:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Phim yêu thích - RoPhim</title>
      </Helmet>

      <div className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaHeart className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Phim yêu thích</h1>
                <p className="text-rophim-textSecondary mt-1">
                  {favorites.length} phim đã lưu
                </p>
              </div>
            </div>

            {/* Actions */}
            {favorites.length > 0 && selectedItems.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="btn-danger flex items-center gap-2"
              >
                <FaTrash size={14} />
                Xóa đã chọn ({selectedItems.length})
              </button>
            )}
          </div>

          {/* Select All */}
          {favorites.length > 0 && (
            <div className="mb-4 p-3 bg-rophim-card rounded-lg border border-rophim-border flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.length === favorites.length}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-rophim-border bg-rophim-bg text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium">Chọn tất cả</span>
              </label>
              <span className="text-sm text-rophim-textSecondary">
                Đã chọn {selectedItems.length} / {favorites.length}
              </span>
            </div>
          )}

          {/* Favorites Grid */}
          {favorites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {favorites.map((movie) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative group"
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(movie.id)}
                    onChange={() => handleSelectItem(movie.id)}
                    className="absolute top-2 left-2 z-10 w-5 h-5 rounded border-rophim-border bg-black/50 text-red-600 focus:ring-red-500"
                  />

                  {/* Poster */}
                  <Link to={`/movies/${movie.slug}`} className="block">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                      {movie.poster ? (
                        <img
                          src={getImageUrl(movie.poster)}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-600/20 to-red-600/5 flex items-center justify-center">
                          <FaFilm className="text-4xl text-red-500/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Info */}
                    <div className="mt-2">
                      <h3 className="font-medium line-clamp-1 group-hover:text-red-500 transition-colors">
                        {movie.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-rophim-textSecondary">
                        <span>{movie.releaseYear || 'N/A'}</span>
                        {movie.ratingAverage > 0 && (
                          <span>⭐ {movie.ratingAverage.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Quick actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={() => removeFavorite(movie.id)}
                      className="p-2 bg-black/60 hover:bg-red-600 rounded-lg transition-colors"
                      title="Xóa khỏi yêu thích"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-rophim-card rounded-lg border border-rophim-border">
              <FaHeart className="mx-auto text-6xl text-rophim-textSecondary mb-4" />
              <p className="text-xl text-rophim-textSecondary mb-2">
                Danh sách yêu thích trống
              </p>
              <p className="text-sm text-rophim-textSecondary mb-6">
                Thêm phim vào yêu thích để xem sau
              </p>
              <Link to="/" className="btn-primary">
                Khám phá phim ngay
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}

export default FavoritesPage