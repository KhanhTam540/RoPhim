// src/pages/admin/Genres/GenreList.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FaPlus, FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff } from 'react-icons/fa'
import { adminGenreApi } from '../../../api/admin'
import DataTable from '../../../components/admin/DataTable'
import ConfirmDialog from '../../../components/admin/ConfirmDialog'
import LoadingSpinner from '../../../components/admin/LoadingSpinner'
import { getImageUrl } from '../../../utils/imageUtils'
import toast from 'react-hot-toast'

const GenreList = () => {
  const navigate = useNavigate()
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  })
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, genre: null })
  const [filters, setFilters] = useState({
    search: '',
  })

  useEffect(() => {
    loadGenres()
  }, [pagination.page, filters])

  const loadGenres = async () => {
    try {
      setLoading(true)
      const response = await adminGenreApi.getGenres({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search
      })
      setGenres(response.data?.genres || [])
      setPagination(response.data?.pagination || { page: 1, limit: 20, total: 0, pages: 1 })
    } catch (error) {
      console.error('Error loading genres:', error)
      toast.error('Không thể tải danh sách thể loại')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await adminGenreApi.deleteGenre(deleteDialog.genre.id)
      toast.success('Xóa thể loại thành công')
      loadGenres()
    } catch (error) {
      console.error('Error deleting genre:', error)
      toast.error(error.response?.data?.message || 'Không thể xóa thể loại')
    } finally {
      setDeleteDialog({ isOpen: false, genre: null })
    }
  }

  const handleToggleStatus = async (genre) => {
    try {
      await adminGenreApi.toggleStatus(genre.id, !genre.isActive)
      toast.success(genre.isActive ? 'Đã vô hiệu hóa thể loại' : 'Đã kích hoạt thể loại')
      loadGenres()
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error('Không thể thay đổi trạng thái')
    }
  }

  const handleEdit = (genre) => {
    navigate(`/admin/genres/${genre.id}`)
  }

  const handleView = (genre) => {
    window.open(`/the-loai/${genre.slug}`, '_blank')
  }

  const columns = [
    {
      key: 'id',
      title: 'ID',
      render: (id) => <span className="text-sm font-medium">#{id}</span>
    },
    {
      key: 'icon',
      title: 'Icon',
      render: (icon, genre) => {
        const iconUrl = icon ? getImageUrl(icon) : null
        return iconUrl ? (
          <img src={iconUrl} alt={genre.name} className="w-8 h-8 object-contain" />
        ) : (
          <div className="w-8 h-8 bg-rophim-hover rounded flex items-center justify-center">
            <span className="text-xs">{genre.name?.charAt(0)}</span>
          </div>
        )
      }
    },
    {
      key: 'name',
      title: 'Tên thể loại',
      render: (name, genre) => (
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-xs text-rophim-textSecondary">/{genre.slug}</p>
        </div>
      )
    },
    {
      key: 'description',
      title: 'Mô tả',
      render: (desc) => desc ? (
        <p className="text-sm line-clamp-2 max-w-xs">{desc}</p>
      ) : (
        <span className="text-rophim-textSecondary text-sm">-</span>
      )
    },
    {
      key: 'movieCount',
      title: 'Số phim',
      render: (_, genre) => (
        <span className="text-sm font-medium">{genre.movieCount || 0}</span>
      )
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      render: (isActive) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-400'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (_, genre) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleView(genre)}
            className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
            title="Xem trên trang"
          >
            <FaEye size={16} />
          </button>
          <button
            onClick={() => handleEdit(genre)}
            className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => handleToggleStatus(genre)}
            className={`p-2 rounded-lg transition-colors ${
              genre.isActive 
                ? 'text-green-500 hover:bg-green-500/10' 
                : 'text-gray-400 hover:bg-gray-500/10'
            }`}
            title={genre.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
          >
            {genre.isActive ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
          </button>
          <button
            onClick={() => setDeleteDialog({ isOpen: true, genre })}
            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
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
        <title>Quản lý thể loại - RoPhim Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Quản lý thể loại</h1>
          <Link
            to="/admin/genres/create"
            className="btn-primary flex items-center justify-center space-x-2 px-4 py-2"
          >
            <FaPlus size={16} />
            <span>Thêm thể loại</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-rophim-card rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm thể loại..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input-field"
            />
            <button
              onClick={() => loadGenres()}
              className="btn-secondary md:col-span-1"
            >
              Tìm kiếm
            </button>
            <button
              onClick={() => setFilters({ search: '' })}
              className="btn-secondary md:col-span-1"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Genres Table */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable
            columns={columns}
            data={genres}
            pagination={pagination}
            onPageChange={(page) => setPagination({ ...pagination, page })}
            emptyMessage="Không có thể loại nào"
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, genre: null })}
        onConfirm={handleDelete}
        title="Xóa thể loại"
        message={`Bạn có chắc chắn muốn xóa thể loại "${deleteDialog.genre?.name}"?`}
      />
    </>
  )
}

export default GenreList