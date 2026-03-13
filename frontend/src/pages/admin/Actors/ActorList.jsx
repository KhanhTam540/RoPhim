// src/pages/admin/Actors/ActorList.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FaPlus, FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff } from 'react-icons/fa'
import { adminActorApi } from '../../../api/admin'
import DataTable from '../../../components/admin/DataTable'
import ConfirmDialog from '../../../components/admin/ConfirmDialog'
import LoadingSpinner from '../../../components/admin/LoadingSpinner'
import { getImageUrl } from '../../../utils/imageUtils'
import toast from 'react-hot-toast'

const ActorList = () => {
  const navigate = useNavigate()
  const [actors, setActors] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  })
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, actor: null })
  const [filters, setFilters] = useState({
    search: '',
    nationality: '',
  })

  useEffect(() => {
    loadActors()
  }, [pagination.page, filters])

  const loadActors = async () => {
    try {
      setLoading(true)
      const response = await adminActorApi.getActors({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        nationality: filters.nationality
      })
      setActors(response.data?.actors || [])
      setPagination(response.data?.pagination || { page: 1, limit: 20, total: 0, pages: 1 })
    } catch (error) {
      console.error('Error loading actors:', error)
      toast.error('Không thể tải danh sách diễn viên')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await adminActorApi.deleteActor(deleteDialog.actor.id)
      toast.success('Xóa diễn viên thành công')
      loadActors()
    } catch (error) {
      console.error('Error deleting actor:', error)
      toast.error(error.response?.data?.message || 'Không thể xóa diễn viên')
    } finally {
      setDeleteDialog({ isOpen: false, actor: null })
    }
  }

  const handleToggleStatus = async (actor) => {
    try {
      await adminActorApi.toggleStatus(actor.id, !actor.isActive)
      toast.success(actor.isActive ? 'Đã vô hiệu hóa diễn viên' : 'Đã kích hoạt diễn viên')
      loadActors()
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error('Không thể thay đổi trạng thái')
    }
  }

  const handleEdit = (actor) => {
    navigate(`/admin/actors/${actor.id}`)
  }

  const handleView = (actor) => {
    window.open(`/dien-vien/${actor.slug}`, '_blank')
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
      render: (_, actor) => {
        const avatarUrl = actor.avatar ? getImageUrl(actor.avatar) : null
        return avatarUrl ? (
          <img src={avatarUrl} alt={actor.name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-sm font-bold">{actor.name?.charAt(0)}</span>
          </div>
        )
      }
    },
    {
      key: 'name',
      title: 'Tên diễn viên',
      render: (name, actor) => (
        <div>
          <p className="font-medium">{name}</p>
          {actor.originalName && (
            <p className="text-xs text-rophim-textSecondary">{actor.originalName}</p>
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
      render: (_, actor) => (
        <span className="text-sm font-medium">{actor.movieCount || 0}</span>
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
      render: (_, actor) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleView(actor)}
            className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
            title="Xem trên trang"
          >
            <FaEye size={16} />
          </button>
          <button
            onClick={() => handleEdit(actor)}
            className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => handleToggleStatus(actor)}
            className={`p-2 rounded-lg transition-colors ${
              actor.isActive 
                ? 'text-green-500 hover:bg-green-500/10' 
                : 'text-gray-400 hover:bg-gray-500/10'
            }`}
            title={actor.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
          >
            {actor.isActive ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
          </button>
          <button
            onClick={() => setDeleteDialog({ isOpen: true, actor })}
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
        <title>Quản lý diễn viên - RoPhim Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Quản lý diễn viên</h1>
          <Link
            to="/admin/actors/create"
            className="btn-primary flex items-center justify-center space-x-2 px-4 py-2"
          >
            <FaPlus size={16} />
            <span>Thêm diễn viên</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-rophim-card rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm diễn viên..."
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
              onClick={() => loadActors()}
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

        {/* Actors Table */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable
            columns={columns}
            data={actors}
            pagination={pagination}
            onPageChange={(page) => setPagination({ ...pagination, page })}
            emptyMessage="Không có diễn viên nào"
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, actor: null })}
        onConfirm={handleDelete}
        title="Xóa diễn viên"
        message={`Bạn có chắc chắn muốn xóa diễn viên "${deleteDialog.actor?.name}"?`}
      />
    </>
  )
}

export default ActorList