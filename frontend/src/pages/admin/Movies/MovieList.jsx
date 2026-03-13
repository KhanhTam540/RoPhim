// src/pages/admin/Movies/MovieList.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FaPlus, FaEdit, FaTrash, FaEye, FaVideo } from 'react-icons/fa'
import { adminMovieApi } from '../../../api/admin'
import DataTable from '../../../components/admin/DataTable'
import ConfirmDialog from '../../../components/admin/ConfirmDialog'
import LoadingSpinner from '../../../components/admin/LoadingSpinner'
import { getImageUrl } from '../../../utils/imageUtils'
import toast from 'react-hot-toast'

const MovieList = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  })
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, movie: null })
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
  })

  useEffect(() => {
    loadMovies()
  }, [pagination.page, filters])

  const loadMovies = async () => {
    try {
      setLoading(true)
      const response = await adminMovieApi.getMovies({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      })
      setMovies(response.data?.movies || [])
      setPagination(response.data?.pagination || { 
        page: 1, 
        limit: 20, 
        total: 0, 
        pages: 1 
      })
    } catch (error) {
      console.error('Error loading movies:', error)
      toast.error('Không thể tải danh sách phim')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await adminMovieApi.deleteMovie(deleteDialog.movie.id)
      toast.success('Xóa phim thành công')
      loadMovies()
    } catch (error) {
      console.error('Error deleting movie:', error)
      toast.error(error.response?.data?.message || 'Không thể xóa phim')
    } finally {
      setDeleteDialog({ isOpen: false, movie: null })
    }
  }

  const handleToggleStatus = async (movie) => {
    try {
      await adminMovieApi.toggleStatus(movie.id, !movie.isActive)
      toast.success(movie.isActive ? 'Đã vô hiệu hóa phim' : 'Đã kích hoạt phim')
      loadMovies()
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error('Không thể thay đổi trạng thái')
    }
  }

  const handleEdit = (movie) => {
    window.location.href = `/admin/movies/${movie.id}`
  }

  const handleView = (movie) => {
    window.open(`/phim/${movie.slug}`, '_blank')
  }

  const handleEpisodes = (movie) => {
    if (movie.type === 'series') {
      window.location.href = `/admin/movies/${movie.id}/episodes`
    }
  }

  const formatRating = (rating) => {
    if (rating === null || rating === undefined) return '0.0'
    const num = typeof rating === 'number' ? rating : parseFloat(rating)
    return isNaN(num) ? '0.0' : num.toFixed(1)
  }

  const columns = [
    {
      key: 'poster',
      title: 'Poster',
      render: (_, movie) => {
        const posterUrl = movie.poster 
          ? getImageUrl(movie.poster) 
          : 'https://picsum.photos/50/70?random=1'
        return (
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-10 h-14 object-cover rounded"
            onError={(e) => {
              e.target.src = 'https://picsum.photos/50/70?random=1'
            }}
          />
        )
      }
    },
    {
      key: 'title',
      title: 'Tên phim',
      render: (_, movie) => (
        <div>
          <p className="font-medium">{movie.title}</p>
          <p className="text-xs text-rophim-textSecondary">{movie.originalTitle}</p>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Loại',
      render: (type) => (
        <span className={`px-2 py-1 rounded text-xs ${
          type === 'series' ? 'bg-purple-500' : 'bg-blue-500'
        }`}>
          {type === 'series' ? 'Phim bộ' : 'Phim lẻ'}
        </span>
      )
    },
    {
      key: 'releaseYear',
      title: 'Năm',
      render: (year) => year || '-'
    },
    {
      key: 'viewCount',
      title: 'Lượt xem',
      render: (views) => views?.toLocaleString() || '0'
    },
    {
      key: 'ratingAverage',
      title: 'Đánh giá',
      render: (rating) => formatRating(rating)
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      render: (isActive) => (
        <span className={`px-2 py-1 rounded text-xs ${
          isActive ? 'bg-green-500' : 'bg-gray-500'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (_, movie) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleView(movie)}
            className="p-1 text-blue-500 hover:text-blue-400"
            title="Xem trên trang"
          >
            <FaEye size={16} />
          </button>
          <button
            onClick={() => handleEdit(movie)}
            className="p-1 text-yellow-500 hover:text-yellow-400"
            title="Chỉnh sửa"
          >
            <FaEdit size={16} />
          </button>
          {movie.type === 'series' && (
            <button
              onClick={() => handleEpisodes(movie)}
              className="p-1 text-purple-500 hover:text-purple-400"
              title="Quản lý tập"
            >
              <FaVideo size={16} />
            </button>
          )}
          <button
            onClick={() => setDeleteDialog({ isOpen: true, movie })}
            className="p-1 text-red-500 hover:text-red-400"
            title="Xóa"
          >
            <FaTrash size={16} />
          </button>
        </div>
      )
    }
  ]

  return (
    <>
      <Helmet>
        <title>Quản lý phim - RoPhim Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quản lý phim</h1>
          <Link
            to="/admin/movies/create"
            className="btn-primary flex items-center space-x-2"
          >
            <FaPlus size={16} />
            <span>Thêm phim mới</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-rophim-card rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm phim..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input-field"
            />
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="input-field"
            >
              <option value="">Tất cả loại</option>
              <option value="single">Phim lẻ</option>
              <option value="series">Phim bộ</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-field"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ongoing">Đang chiếu</option>
              <option value="completed">Hoàn thành</option>
              <option value="upcoming">Sắp chiếu</option>
            </select>
            <button
              onClick={() => loadMovies()}
              className="btn-secondary"
            >
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Movies Table */}
        <DataTable
          columns={columns}
          data={movies}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => setPagination({ ...pagination, page })}
          onToggleStatus={handleToggleStatus}
        />
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, movie: null })}
        onConfirm={handleDelete}
        title="Xóa phim"
        message={`Bạn có chắc chắn muốn xóa phim "${deleteDialog.movie?.title}"? Hành động này không thể hoàn tác.`}
      />
    </>
  )
}

export default MovieList