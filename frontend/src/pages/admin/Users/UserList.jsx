// src/pages/admin/Users/UserList.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { 
  FaEye, FaBan, FaCheck, FaKey, FaTrash, FaPlus, 
  FaSync, FaFilter, FaSearch, FaTimes, FaUserCog
} from 'react-icons/fa'
import { adminUserApi } from '../../../api/admin'
import DataTable from '../../../components/admin/DataTable'
import ConfirmDialog from '../../../components/admin/ConfirmDialog'
import LoadingSpinner from '../../../components/admin/LoadingSpinner'
import { getImageUrl } from '../../../utils/imageUtils'
import toast from 'react-hot-toast'

const UserList = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  })
  const [actionDialog, setActionDialog] = useState({ 
    isOpen: false, 
    user: null, 
    action: null 
  })
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    isActive: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [pagination.page])


const loadUsers = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await adminUserApi.getUsers({
      page: pagination.page,
      limit: pagination.limit,
      ...filters
    });
    
    // Kiểm tra cấu trúc lồng nhau: response -> data (của axios) -> data (của backend)
    const result = response.data?.data ? response.data.data : response.data;

    if (result && result.users) {
      setUsers(result.users);
      setPagination(result.pagination || { 
        page: 1, 
        limit: 20, 
        total: 0, 
        pages: 1 
      });
    } else {
      setUsers([]);
    }
  } catch (error) {
    console.error('❌ Error loading users:', error);
    setError(error.response?.data?.message || 'Không thể tải danh sách người dùng');
    toast.error('Không thể tải danh sách người dùng');
  } finally {
    setLoading(false);
  }
};

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 })
    loadUsers()
  }

  const handleResetFilters = () => {
    setFilters({
      search: '',
      role: '',
      isActive: '',
    })
    setPagination({ ...pagination, page: 1 })
    setTimeout(() => loadUsers(), 100)
  }

  const handleToggleStatus = async () => {
    try {
      await adminUserApi.toggleStatus(actionDialog.user.id, !actionDialog.user.isActive)
      toast.success(actionDialog.user.isActive ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản')
      loadUsers()
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error(error.response?.data?.message || 'Không thể thay đổi trạng thái')
    } finally {
      setActionDialog({ isOpen: false, user: null, action: null })
    }
  }

  const handleResetPassword = async () => {
    const newPassword = prompt('Nhập mật khẩu mới cho người dùng (tối thiểu 6 ký tự):')
    if (!newPassword) return
    
    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    try {
      await adminUserApi.resetPassword(actionDialog.user.id, newPassword)
      toast.success('Đặt lại mật khẩu thành công')
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error(error.response?.data?.message || 'Không thể đặt lại mật khẩu')
    } finally {
      setActionDialog({ isOpen: false, user: null, action: null })
    }
  }

  const handleDelete = async () => {
    try {
      await adminUserApi.deleteUser(actionDialog.user.id)
      toast.success('Xóa người dùng thành công')
      loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(error.response?.data?.message || 'Không thể xóa người dùng')
    } finally {
      setActionDialog({ isOpen: false, user: null, action: null })
    }
  }

  const handleView = (user) => {
    if (user && user.id) {
      navigate(`/admin/users/${user.id}`)
    } else {
      toast.error('Không tìm thấy ID người dùng')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN')
    } catch (e) {
      return '-'
    }
  }

  const columns = [
    {
      key: 'avatar',
      title: 'Ảnh',
      render: (_, user) => {
        const avatarUrl = user.avatar ? getImageUrl(user.avatar) : null
        return avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={user.fullName} 
            className="w-10 h-10 rounded-full object-cover border-2 border-rophim-border"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = 'https://picsum.photos/40/40?random=3'
            }}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {user.fullName?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        )
      }
    },
    {
      key: 'fullName',
      title: 'Họ tên',
      render: (name, user) => (
        <div>
          <p className="font-medium">{name || 'Chưa có tên'}</p>
          <p className="text-xs text-rophim-textSecondary">@{user.username || 'unknown'}</p>
        </div>
      )
    },
    {
      key: 'email',
      title: 'Email',
      render: (email) => email || '-'
    },
    {
      key: 'role',
      title: 'Vai trò',
      render: (role) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          role === 'admin' ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'
        }`}>
          {role === 'admin' ? 'Admin' : 'User'}
        </span>
      )
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      render: (isActive) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
        }`}>
          {isActive ? 'Hoạt động' : 'Đã khóa'}
        </span>
      )
    },
    {
      key: 'createdAt',
      title: 'Ngày tham gia',
      render: (date) => formatDate(date)
    },
    {
      key: 'lastLogin',
      title: 'Lần cuối đăng nhập',
      render: (date) => {
          // Kiểm tra nếu date tồn tại và không phải giá trị rỗng/null
          if (date && date !== '0000-00-00 00:00:00') {
            return formatDate(date);
          }
          return <span className="text-gray-500 italic">Chưa đăng nhập</span>;
      }
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (_, user) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleView(user)}
            className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
            title="Xem chi tiết"
          >
            <FaEye size={16} />
          </button>
          
          {user.isActive ? (
            <button
              onClick={() => setActionDialog({ isOpen: true, user, action: 'lock' })}
              className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors"
              title="Khóa tài khoản"
            >
              <FaBan size={16} />
            </button>
          ) : (
            <button
              onClick={() => setActionDialog({ isOpen: true, user, action: 'unlock' })}
              className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
              title="Mở khóa tài khoản"
            >
              <FaCheck size={16} />
            </button>
          )}
          
          <button
            onClick={() => setActionDialog({ isOpen: true, user, action: 'reset-password' })}
            className="p-2 text-purple-500 hover:bg-purple-500/10 rounded-lg transition-colors"
            title="Đặt lại mật khẩu"
          >
            <FaKey size={16} />
          </button>

          <button
            onClick={() => setActionDialog({ isOpen: true, user, action: 'delete' })}
            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Xóa người dùng"
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
        <title>Quản lý người dùng - RoPhim Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <FaUserCog className="text-2xl text-blue-500" />
            <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2 px-4 py-2"
            >
              <FaFilter size={14} />
              <span>{showFilters ? 'Ẩn bộ lọc' : 'Bộ lọc'}</span>
            </button>
            <Link
              to="/admin/users/create"
              className="btn-primary flex items-center space-x-2 px-4 py-2"
            >
              <FaPlus size={14} />
              <span>Thêm người dùng</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-rophim-card rounded-lg p-4 border border-rophim-border">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="input-field pl-9"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="input-field"
              >
                <option value="">Tất cả vai trò</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={filters.isActive}
                onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                className="input-field"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Hoạt động</option>
                <option value="false">Đã khóa</option>
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={handleSearch}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <FaSearch size={14} />
                  <span>Tìm</span>
                </button>
                <button
                  onClick={handleResetFilters}
                  className="btn-secondary px-3"
                  title="Xóa bộ lọc"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-red-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-red-500">{error}</p>
              </div>
              <button
                onClick={loadUsers}
                className="btn-secondary flex items-center space-x-2 px-3 py-1"
              >
                <FaSync size={12} />
                <span>Thử lại</span>
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable
            columns={columns}
            data={users}
            pagination={pagination}
            onPageChange={(page) => setPagination({ ...pagination, page })}
            emptyMessage="Không có người dùng nào"
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={actionDialog.isOpen}
        onClose={() => setActionDialog({ isOpen: false, user: null, action: null })}
        onConfirm={
          actionDialog.action === 'reset-password' ? handleResetPassword :
          actionDialog.action === 'delete' ? handleDelete :
          handleToggleStatus
        }
        title={
          actionDialog.action === 'lock' ? 'Khóa tài khoản' :
          actionDialog.action === 'unlock' ? 'Mở khóa tài khoản' :
          actionDialog.action === 'delete' ? 'Xóa người dùng' :
          'Đặt lại mật khẩu'
        }
        message={
          actionDialog.action === 'lock' ? `Bạn có chắc chắn muốn khóa tài khoản của "${actionDialog.user?.fullName}"?` :
          actionDialog.action === 'unlock' ? `Bạn có chắc chắn muốn mở khóa tài khoản của "${actionDialog.user?.fullName}"?` :
          actionDialog.action === 'delete' ? `Bạn có chắc chắn muốn xóa người dùng "${actionDialog.user?.fullName}"? Hành động này không thể hoàn tác.` :
          `Bạn có chắc chắn muốn đặt lại mật khẩu cho "${actionDialog.user?.fullName}"?`
        }
      />
    </>
  )
}

export default UserList