// src/pages/HistoryPage.jsx
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaHistory, FaTrash, FaPlay, FaClock, FaFilm, FaTrashAlt } from 'react-icons/fa'
import { useHistory } from '../hooks/useHistory'
import { getImageUrl } from '../utils/imageUtils'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const HistoryPage = () => {
  const {
    history,
    loading,
    pagination,
    removeFromHistory,
    clearHistory,
    setPage
  } = useHistory()

  const [selectedItems, setSelectedItems] = useState([])
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSelectAll = () => {
    if (selectedItems.length === history.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(history.map(item => item.id))
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
      await Promise.all(selectedItems.map(id => removeFromHistory(id)))
      setSelectedItems([])
      toast.success(`Đã xóa ${selectedItems.length} mục khỏi lịch sử`)
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleClearAll = async () => {
    try {
      await clearHistory()
      setSelectedItems([])
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    }
  }

  const formatTimeAgo = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi })
  }

  if (loading && history.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Lịch sử xem - RoPhim</title>
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
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaHistory className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Lịch sử xem</h1>
                <p className="text-rophim-textSecondary mt-1">
                  {history.length} phim đã xem
                </p>
              </div>
            </div>

            {/* Actions */}
            {history.length > 0 && (
              <div className="flex items-center gap-3">
                {selectedItems.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="btn-danger flex items-center gap-2"
                  >
                    <FaTrash size={14} />
                    Xóa đã chọn ({selectedItems.length})
                  </button>
                )}
                <button
                  onClick={() => setShowConfirm(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FaTrashAlt size={14} />
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>

          {/* Select All */}
          {history.length > 0 && (
            <div className="mb-4 p-3 bg-rophim-card rounded-lg border border-rophim-border flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.length === history.length}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-rophim-border bg-rophim-bg text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium">Chọn tất cả</span>
              </label>
              <span className="text-sm text-rophim-textSecondary">
                Đã chọn {selectedItems.length} / {history.length}
              </span>
            </div>
          )}

          {/* History List */}
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-rophim-card rounded-lg border border-rophim-border overflow-hidden hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-center p-4 gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="w-5 h-5 rounded border-rophim-border bg-rophim-bg text-purple-600 focus:ring-purple-500"
                    />

                    {/* Poster */}
                    <Link to={`/phim/${item.movie.slug}`} className="flex-shrink-0">
                      {item.movie.poster ? (
                        <img
                          src={getImageUrl(item.movie.poster)}
                          alt={item.movie.title}
                          className="w-16 h-20 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-20 bg-gradient-to-br from-purple-600/20 to-purple-600/5 rounded-lg flex items-center justify-center">
                          <FaFilm className="text-2xl text-purple-500/50" />
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/phim/${item.movie.slug}`}
                        className="text-lg font-bold hover:text-purple-500 transition-colors line-clamp-1"
                      >
                        {item.movie.title}
                      </Link>
                      <div className="flex items-center gap-3 text-sm text-rophim-textSecondary mt-1">
                        {item.episode && (
                          <span className="flex items-center gap-1">
                            <FaPlay size={10} />
                            Tập {item.episode.episodeNumber}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <FaClock size={10} />
                          {formatTimeAgo(item.watchedAt)}
                        </span>
                        {item.progress > 0 && (
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-500 rounded-full text-xs">
                            {item.progress}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/phim/${item.movie.slug}`}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Xem lại"
                      >
                        <FaPlay className="text-purple-500" />
                      </Link>
                      <button
                        onClick={() => removeFromHistory(item.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Xóa khỏi lịch sử"
                      >
                        <FaTrash className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <button
                    onClick={() => setPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 bg-rophim-card border border-rophim-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rophim-hover transition-colors"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-2 bg-purple-600 rounded-lg">
                    {pagination.page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 bg-rophim-card border border-rophim-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rophim-hover transition-colors"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-rophim-card rounded-lg border border-rophim-border">
              <FaHistory className="mx-auto text-6xl text-rophim-textSecondary mb-4" />
              <p className="text-xl text-rophim-textSecondary mb-2">
                Lịch sử xem trống
              </p>
              <p className="text-sm text-rophim-textSecondary mb-6">
                Các phim bạn xem sẽ được lưu lại ở đây
              </p>
              <Link to="/" className="btn-primary">
                Khám phá phim ngay
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Confirm Clear Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-rophim-card rounded-xl border border-rophim-border p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">Xóa lịch sử xem?</h3>
            <p className="text-rophim-textSecondary mb-6">
              Bạn có chắc muốn xóa toàn bộ lịch sử xem? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-secondary"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  handleClearAll()
                  setShowConfirm(false)
                }}
                className="btn-danger"
              >
                Xóa tất cả
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}

export default HistoryPage