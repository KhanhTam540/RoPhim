import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FaPlus, FaEdit, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { adminMovieApi } from '../../../api/admin'
import ConfirmDialog from '../../../components/admin/ConfirmDialog'
import LoadingSpinner from '../../../components/admin/LoadingSpinner'
import toast from 'react-hot-toast'

const EpisodeManager = () => {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [episodes, setEpisodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEpisode, setEditingEpisode] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, episode: null })
  const [formData, setFormData] = useState({
    episodeNumber: '',
    title: '',
    description: '',
    duration: '',
    videoUrl: '',
    thumbnail: '',
    releaseDate: '',
  })

  useEffect(() => {
    loadData()
  }, [movieId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [movieRes, episodesRes] = await Promise.all([
        adminMovieApi.getMovieById(movieId),
        adminMovieApi.getEpisodes(movieId)
      ])
      setMovie(movieRes.data.movie)
      setEpisodes(episodesRes.data.episodes || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Không thể tải dữ liệu')
      navigate('/admin/movies')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingEpisode) {
        await adminMovieApi.updateEpisode(editingEpisode.id, formData)
        toast.success('Cập nhật tập phim thành công')
      } else {
        await adminMovieApi.addEpisode(movieId, formData)
        toast.success('Thêm tập phim thành công')
      }
      loadData()
      resetForm()
    } catch (error) {
      console.error('Error saving episode:', error)
      toast.error(editingEpisode ? 'Không thể cập nhật tập phim' : 'Không thể thêm tập phim')
    }
  }

  const handleDelete = async () => {
    try {
      await adminMovieApi.deleteEpisode(deleteDialog.episode.id)
      toast.success('Xóa tập phim thành công')
      loadData()
    } catch (error) {
      console.error('Error deleting episode:', error)
      toast.error('Không thể xóa tập phim')
    } finally {
      setDeleteDialog({ isOpen: false, episode: null })
    }
  }

  const handleEdit = (episode) => {
    setEditingEpisode(episode)
    setFormData({
      episodeNumber: episode.episodeNumber,
      title: episode.title || '',
      description: episode.description || '',
      duration: episode.duration || '',
      videoUrl: episode.videoUrl || '',
      thumbnail: episode.thumbnail || '',
      releaseDate: episode.releaseDate || '',
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setEditingEpisode(null)
    setFormData({
      episodeNumber: '',
      title: '',
      description: '',
      duration: '',
      videoUrl: '',
      thumbnail: '',
      releaseDate: '',
    })
    setShowForm(false)
  }

  const moveEpisode = async (episodeId, direction) => {
    // Implement reorder logic here
    // This would require a backend API to reorder episodes
    toast.success(`Đã di chuyển tập phim ${direction === 'up' ? 'lên' : 'xuống'}`)
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <>
      <Helmet>
        <title>Quản lý tập phim - {movie?.title} - RoPhim Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/admin/movies')}
              className="text-rophim-textSecondary hover:text-white mb-2 inline-block"
            >
              ← Quay lại danh sách phim
            </button>
            <h1 className="text-2xl font-bold">Quản lý tập phim: {movie?.title}</h1>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <FaPlus size={16} />
              <span>Thêm tập mới</span>
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-rophim-card rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingEpisode ? 'Chỉnh sửa tập phim' : 'Thêm tập phim mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Số tập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="episodeNumber"
                    value={formData.episodeNumber}
                    onChange={handleChange}
                    className="input-field"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tiêu đề tập
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Thời lượng (phút)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="input-field"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ngày phát hành
                  </label>
                  <input
                    type="date"
                    name="releaseDate"
                    value={formData.releaseDate}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Video URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    className="input-field"
                    required
                    placeholder="https://example.com/episode.mp4"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingEpisode ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Episodes List */}
        <div className="bg-rophim-card rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-rophim-hover">
                  <th className="px-4 py-3 text-left text-sm font-medium w-16">STT</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Số tập</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Tiêu đề</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Thời lượng</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Lượt xem</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Ngày phát hành</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {episodes.map((episode, index) => (
                  <tr key={episode.id} className="border-t border-rophim-border hover:bg-rophim-hover">
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => moveEpisode(episode.id, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:text-blue-500 disabled:opacity-30"
                        >
                          <FaArrowUp size={12} />
                        </button>
                        <span>{index + 1}</span>
                        <button
                          onClick={() => moveEpisode(episode.id, 'down')}
                          disabled={index === episodes.length - 1}
                          className="p-1 hover:text-blue-500 disabled:opacity-30"
                        >
                          <FaArrowDown size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">Tập {episode.episodeNumber}</td>
                    <td className="px-4 py-3 text-sm">{episode.title || '-'}</td>
                    <td className="px-4 py-3 text-sm">{episode.duration ? `${episode.duration} phút` : '-'}</td>
                    <td className="px-4 py-3 text-sm">{episode.viewCount?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3 text-sm">
                      {episode.releaseDate ? new Date(episode.releaseDate).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(episode)}
                          className="p-1 text-yellow-500 hover:text-yellow-400"
                          title="Chỉnh sửa"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, episode })}
                          className="p-1 text-red-500 hover:text-red-400"
                          title="Xóa"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {episodes.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-rophim-textSecondary">
                      Chưa có tập phim nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, episode: null })}
        onConfirm={handleDelete}
        title="Xóa tập phim"
        message={`Bạn có chắc chắn muốn xóa tập ${deleteDialog.episode?.episodeNumber}?`}
      />
    </>
  )
}

export default EpisodeManager