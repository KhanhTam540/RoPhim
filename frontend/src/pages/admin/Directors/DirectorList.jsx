// src/pages/admin/Directors/DirectorList.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FaPlus, FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff } from 'react-icons/fa'
import { adminDirectorApi } from '../../../api/admin'
import DataTable from '../../../components/admin/DataTable'
import ConfirmDialog from '../../../components/admin/ConfirmDialog'
import LoadingSpinner from '../../../components/admin/LoadingSpinner'
import { getImageUrl } from '../../../utils/imageUtils'
import toast from 'react-hot-toast'

const DirectorList = () => {
  const navigate = useNavigate()
  const [directors, setDirectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  })
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, director: null })
  const [filters, setFilters] = useState({
    search: '',
    nationality: '',
  })

  useEffect(() => {
    loadDirectors()
  }, [pagination.page, filters])

  const loadDirectors = async () => {
    try {
      setLoading(true)
      const response = await adminDirectorApi.getDirectors({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        nationality: filters.nationality
      })
      setDirectors(response.data?.directors || [])
      setPagination(response.data?.pagination || { page: 1, limit: 20, total: 0, pages: 1 })
    } catch (error) {
      console.error('Error loading directors:', error)
      toast.error('Không thể tải danh sách đạo diễn')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await adminDirectorApi.deleteDirector(deleteDialog.director.id)
      toast.success('Xóa đạo diễn thành công')
      loadDirectors()
    } catch (error) {
      console.error('Error deleting director:', error)
      toast.error(error.response?.data?.message || 'Không thể xóa đạo diễn')
    } finally {
      setDeleteDialog({ isOpen: false, director: null })
    }
  }

  const handleToggleStatus = async (director) => {
    try {
      await adminDirectorApi.toggleStatus(director.id, !director.isActive)
      toast.success(director.isActive ? 'Đã vô hiệu hóa đạo diễn' : 'Đã kích hoạt đạo diễn')
      loadDirectors()
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error('Không thể thay đổi trạng thái')
    }
  }

  const handleEdit = (director) => {
    navigate(`/admin/directors/${director.id}`)
  }

  const handleView = (director) => {
    window.open(`/dao-dien/${director.slug}`, '_blank')
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  const columns = [
    {
      key: 'avatar',
      title: 'Ảnh',
      render: (_, director) => {
        const avatarUrl = director.avatar ? getImageUrl(director.avatar) : null
        return avatarUrl ? (
          <img src={avatarUrl} alt={director.name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-sm font-bold">{director.name?.charAt(0)}</span>
          </div>
        )
      }
    },
    {
      key: 'name',
      title: 'Tên đạo diễn',
      render: (name, director) => (
        <div>
          <p className="font-medium">{name}</p>
          {director.originalName && (
            <p className="text-xs text-rophim-textSecondary">{director.originalName}</p>
          )}
        </div>
      )
    },
    {
      key: 'nationality',
      title: 'Quốc tịch',
      render: (nationality) => nationality || '-'
    },
    {
      key: 'birthDate',
      title: 'Ngày sinh',
      render: (date) => formatDate(date)
    },
    {
      key: 'movieCount',
      title: 'Số phim',
      render: (_, director) => (
        <span className="text-sm font-medium">{director.movieCount || 0}</span>
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
      render: (_, director) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleView(director)}
            className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
            title="Xem trên trang"
          >
            <FaEye size={16} />
          </button>
          <button
            onClick={() => handleEdit(director)}
            className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => handleToggleStatus(director)}
            className={`p-2 rounded-lg transition-colors ${
              director.isActive 
                ? 'text-green-500 hover:bg-green-500/10' 
                : 'text-gray-400 hover:bg-gray-500/10'
            }`}
            title={director.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
          >
            {director.isActive ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
          </button>
          <button
            onClick={() => setDeleteDialog({ isOpen: true, director })}
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
        <title>Quản lý đạo diễn - RoPhim Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Quản lý đạo diễn</h1>
          <Link
            to="/admin/directors/create"
            className="btn-primary flex items-center justify-center space-x-2 px-4 py-2"
          >
            <FaPlus size={16} />
            <span>Thêm đạo diễn</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-rophim-card rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm đạo diễn..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Quốc tịch..."
              value={filters.nationality}
              onChange={(e) => setFilters({ ...filters, nationality: e.target.value })}
              className="input-field"
            />
            <button
              onClick={() => loadDirectors()}
              className="btn-secondary"
            >
              Tìm kiếm
            </button>
            <button
              onClick={() => setFilters({ search: '', nationality: '' })}
              className="btn-secondary"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Directors Table */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable
            columns={columns}
            data={directors}
            pagination={pagination}
            onPageChange={(page) => setPagination({ ...pagination, page })}
            emptyMessage="Không có đạo diễn nào"
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, director: null })}
        onConfirm={handleDelete}
        title="Xóa đạo diễn"
        message={`Bạn có chắc chắn muốn xóa đạo diễn "${deleteDialog.director?.name}"?`}
      />
    </>
  )
}

export default DirectorList