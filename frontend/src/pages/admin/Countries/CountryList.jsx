// src/pages/admin/Countries/CountryList.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FaPlus, FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff } from 'react-icons/fa'
import { adminCountryApi } from '../../../api/admin'
import DataTable from '../../../components/admin/DataTable'
import ConfirmDialog from '../../../components/admin/ConfirmDialog'
import LoadingSpinner from '../../../components/admin/LoadingSpinner'
import { getImageUrl } from '../../../utils/imageUtils'
import toast from 'react-hot-toast'

const CountryList = () => {
  const navigate = useNavigate()
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  })
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, country: null })
  const [filters, setFilters] = useState({
    search: '',
  })

  useEffect(() => {
    loadCountries()
  }, [pagination.page, filters])

  const loadCountries = async () => {
    try {
      setLoading(true)
      const response = await adminCountryApi.getCountries({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search
      })
      setCountries(response.data?.countries || [])
      setPagination(response.data?.pagination || { page: 1, limit: 20, total: 0, pages: 1 })
    } catch (error) {
      console.error('Error loading countries:', error)
      toast.error('Không thể tải danh sách quốc gia')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await adminCountryApi.deleteCountry(deleteDialog.country.id)
      toast.success('Xóa quốc gia thành công')
      loadCountries()
    } catch (error) {
      console.error('Error deleting country:', error)
      toast.error(error.response?.data?.message || 'Không thể xóa quốc gia')
    } finally {
      setDeleteDialog({ isOpen: false, country: null })
    }
  }

  const handleToggleStatus = async (country) => {
    try {
      await adminCountryApi.toggleStatus(country.id, !country.isActive)
      toast.success(country.isActive ? 'Đã vô hiệu hóa quốc gia' : 'Đã kích hoạt quốc gia')
      loadCountries()
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error('Không thể thay đổi trạng thái')
    }
  }

  const handleEdit = (country) => {
    navigate(`/admin/countries/${country.id}`)
  }

  const handleView = (country) => {
    window.open(`/quoc-gia/${country.slug}`, '_blank')
  }

  const columns = [
    {
      key: 'id',
      title: 'ID',
      render: (id) => <span className="text-sm font-medium">#{id}</span>
    },
    {
      key: 'flag',
      title: 'Cờ',
      render: (_, country) => {
        const flagUrl = country.flag ? getImageUrl(country.flag) : null
        return flagUrl ? (
          <img src={flagUrl} alt={country.name} className="w-8 h-6 object-cover rounded" />
        ) : (
          <div className="w-8 h-6 bg-rophim-hover rounded flex items-center justify-center text-xs">
            {country.code}
          </div>
        )
      }
    },
    {
      key: 'name',
      title: 'Tên quốc gia',
      render: (name, country) => (
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-xs text-rophim-textSecondary">{country.code}</p>
        </div>
      )
    },
    {
      key: 'slug',
      title: 'Slug',
      render: (slug) => <span className="text-sm">/{slug}</span>
    },
    {
      key: 'movieCount',
      title: 'Số phim',
      render: (_, country) => (
        <span className="text-sm font-medium">{country.movieCount || 0}</span>
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
      render: (_, country) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleView(country)}
            className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
            title="Xem trên trang"
          >
            <FaEye size={16} />
          </button>
          <button
            onClick={() => handleEdit(country)}
            className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => handleToggleStatus(country)}
            className={`p-2 rounded-lg transition-colors ${
              country.isActive 
                ? 'text-green-500 hover:bg-green-500/10' 
                : 'text-gray-400 hover:bg-gray-500/10'
            }`}
            title={country.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
          >
            {country.isActive ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
          </button>
          <button
            onClick={() => setDeleteDialog({ isOpen: true, country })}
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
        <title>Quản lý quốc gia - RoPhim Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Quản lý quốc gia</h1>
          <Link
            to="/admin/countries/create"
            className="btn-primary flex items-center justify-center space-x-2 px-4 py-2"
          >
            <FaPlus size={16} />
            <span>Thêm quốc gia</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-rophim-card rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm quốc gia..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input-field"
            />
            <button
              onClick={() => loadCountries()}
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

        {/* Countries Table */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable
            columns={columns}
            data={countries}
            pagination={pagination}
            onPageChange={(page) => setPagination({ ...pagination, page })}
            emptyMessage="Không có quốc gia nào"
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, country: null })}
        onConfirm={handleDelete}
        title="Xóa quốc gia"
        message={`Bạn có chắc chắn muốn xóa quốc gia "${deleteDialog.country?.name}"?`}
      />
    </>
  )
}

export default CountryList