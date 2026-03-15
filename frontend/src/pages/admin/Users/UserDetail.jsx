// src/pages/admin/Users/UserDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { 
  FaArrowLeft, FaBan, FaCheck, FaKey, FaEdit, 
  FaSave, FaTimes, FaTrash, FaUserCircle, FaEnvelope,
  FaCalendar, FaClock, FaStar, FaHeart, FaComment,
  FaFilm, FaHistory
} from 'react-icons/fa'
import { adminUserApi } from '../../../api/admin'
import LoadingSpinner from '../../../components/admin/LoadingSpinner'
import ConfirmDialog from '../../../components/admin/ConfirmDialog'
import { getImageUrl } from '../../../utils/imageUtils'
import { formatDate } from '../../../utils/format'
import toast from 'react-hot-toast'

const UserDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    role: '',
    isActive: true,
  })
  const [actionDialog, setActionDialog] = useState({ isOpen: false, action: null })
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    if (!id || id === 'undefined' || id === 'create') {
      setError('ID người dùng không hợp lệ')
      setLoading(false)
      return
    }
    
    loadUser()
  }, [id])

  const loadUser = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📥 Loading user with ID:', id)
      
      const response = await adminUserApi.getUserById(id)
      
      console.log('📦 User response:', response)
      
      if (response && response.data) {
        const userData = response.data.user || response.data
        setUser(userData)
        setFormData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          username: userData.username || '',
          role: userData.role || 'user',
          isActive: userData.isActive ?? true,
        })
      } else {
        setError('Không tìm thấy dữ liệu người dùng')
      }
    } catch (error) {
      console.error('❌ Error loading user:', error)
      
      if (error.response?.status === 404) {
        setError('Không tìm thấy người dùng')
        toast.error('Người dùng không tồn tại')
      } else {
        setError(error.message || 'Không thể tải thông tin người dùng')
        toast.error(error.response?.data?.message || 'Không thể tải thông tin người dùng')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleUpdate = async () => {
    setSaving(true)
    try {
      await adminUserApi.updateUser(id, formData)
      toast.success('Cập nhật thông tin thành công')
      setEditing(false)
      loadUser()
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async () => {
    try {
      await adminUserApi.toggleStatus(id, !user.isActive)
      toast.success(user.isActive ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản')
      loadUser()
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error(error.response?.data?.message || 'Không thể thay đổi trạng thái')
    } finally {
      setActionDialog({ isOpen: false, action: null })
    }
  }

  const handleResetPassword = async () => {
    const newPassword = prompt('Nhập mật khẩu mới (tối thiểu 6 ký tự):')
    if (!newPassword) return
    
    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    try {
      await adminUserApi.resetPassword(id, newPassword)
      toast.success('Đặt lại mật khẩu thành công')
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error(error.response?.data?.message || 'Không thể đặt lại mật khẩu')
    } finally {
      setActionDialog({ isOpen: false, action: null })
    }
  }

  const handleDelete = async () => {
    try {
      await adminUserApi.deleteUser(id)
      toast.success('Xóa người dùng thành công')
      navigate('/admin/users')
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(error.response?.data?.message || 'Không thể xóa người dùng')
    } finally {
      setActionDialog({ isOpen: false, action: null })
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-500 text-6xl">😕</div>
        <h2 className="text-2xl font-bold text-center">{error}</h2>
        <p className="text-rophim-textSecondary text-center max-w-md">
          Có lỗi xảy ra khi tải thông tin người dùng. Vui lòng kiểm tra lại ID hoặc thử lại sau.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="btn-primary px-6 py-2"
          >
            Quay lại danh sách
          </button>
          <button
            onClick={loadUser}
            className="btn-secondary px-6 py-2"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const avatarUrl = user.avatar ? getImageUrl(user.avatar) : null

  return (
    <>
      <Helmet>
        <title>Chi tiết người dùng - {user.fullName} - RoPhim Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header với nút quay lại */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="btn-secondary flex items-center space-x-2 px-4 py-2"
          >
            <FaArrowLeft size={16} />
            <span>Quay lại</span>
          </button>
          <h1 className="text-2xl font-bold">Chi tiết người dùng</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-rophim-card rounded-lg p-6 text-center border border-rophim-border sticky top-24">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.fullName}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-rophim-border"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.style.display = 'none'
                    e.target.parentElement.innerHTML = '<div class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 mx-auto mb-4 flex items-center justify-center border-4 border-rophim-border"><span class="text-4xl font-bold text-white">' + user.fullName?.charAt(0).toUpperCase() + '</span></div>'
                  }}
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 mx-auto mb-4 flex items-center justify-center border-4 border-rophim-border">
                  <span className="text-4xl font-bold text-white">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              {!editing ? (
                <>
                  <h2 className="text-xl font-bold">{user.fullName}</h2>
                  <p className="text-rophim-textSecondary mb-2">@{user.username}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'admin' ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'
                  }`}>
                    {user.role === 'admin' ? 'Administrator' : 'Người dùng'}
                  </span>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-rophim-textSecondary">Trạng thái:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-rophim-textSecondary">Email xác thực:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.emailVerified ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {user.emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <button
                      onClick={() => setEditing(true)}
                      className="btn-secondary w-full flex items-center justify-center space-x-2 py-2"
                    >
                      <FaEdit size={14} />
                      <span>Chỉnh sửa thông tin</span>
                    </button>
                    
                    {user.isActive ? (
                      <button
                        onClick={() => setActionDialog({ isOpen: true, action: 'lock' })}
                        className="btn-secondary w-full flex items-center justify-center space-x-2 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500"
                      >
                        <FaBan size={14} />
                        <span>Khóa tài khoản</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setActionDialog({ isOpen: true, action: 'unlock' })}
                        className="btn-secondary w-full flex items-center justify-center space-x-2 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500"
                      >
                        <FaCheck size={14} />
                        <span>Mở khóa tài khoản</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => setActionDialog({ isOpen: true, action: 'reset-password' })}
                      className="btn-secondary w-full flex items-center justify-center space-x-2 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500"
                    >
                      <FaKey size={14} />
                      <span>Đặt lại mật khẩu</span>
                    </button>

                    <button
                      onClick={() => setActionDialog({ isOpen: true, action: 'delete' })}
                      className="btn-secondary w-full flex items-center justify-center space-x-2 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500"
                    >
                      <FaTrash size={14} />
                      <span>Xóa người dùng</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-4 text-left">
                  <h3 className="text-lg font-semibold mb-4">Chỉnh sửa thông tin</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Họ tên</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Vai trò</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleChange}
                          className="w-4 h-4 rounded border-rophim-border bg-rophim-bg text-blue-600"
                        />
                        <span>Kích hoạt tài khoản</span>
                      </label>
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="btn-primary flex-1 flex items-center justify-center space-x-2 py-2"
                      >
                        <FaSave size={14} />
                        <span>{saving ? 'Đang lưu...' : 'Lưu'}</span>
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="btn-secondary flex-1 py-2"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Details - Tabs */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="border-b border-rophim-border mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'info'
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-rophim-textSecondary hover:text-white hover:border-rophim-border'
                  }`}
                >
                  Thông tin cá nhân
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'comments'
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-rophim-textSecondary hover:text-white hover:border-rophim-border'
                  }`}
                >
                  Bình luận ({user.stats?.comments || 0})
                </button>
                <button
                  onClick={() => setActiveTab('ratings')}
                  className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'ratings'
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-rophim-textSecondary hover:text-white hover:border-rophim-border'
                  }`}
                >
                  Đánh giá ({user.stats?.ratings || 0})
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'favorites'
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-rophim-textSecondary hover:text-white hover:border-rophim-border'
                  }`}
                >
                  Yêu thích ({user.stats?.favorites || 0})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'history'
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-rophim-textSecondary hover:text-white hover:border-rophim-border'
                  }`}
                >
                  Lịch sử xem ({user.stats?.history || 0})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {/* Info Tab */}
              {activeTab === 'info' && (
                <>
                  {/* Personal Info */}
                  <div className="bg-rophim-card rounded-lg p-6 border border-rophim-border">
                    <h3 className="text-lg font-semibold mb-4">Thông tin cá nhân</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-rophim-textSecondary text-sm">Họ và tên</p>
                        <p className="font-medium">{user.fullName}</p>
                      </div>
                      <div>
                        <p className="text-rophim-textSecondary text-sm">Username</p>
                        <p className="font-medium">{user.username}</p>
                      </div>
                      <div>
                        <p className="text-rophim-textSecondary text-sm">Email</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-rophim-textSecondary text-sm">Vai trò</p>
                        <p className="font-medium capitalize">{user.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Activity Stats */}
                  <div className="bg-rophim-card rounded-lg p-6 border border-rophim-border">
                    <h3 className="text-lg font-semibold mb-4">Thống kê hoạt động</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-rophim-hover rounded-lg">
                        <FaComment className="mx-auto text-blue-500 mb-2" size={24} />
                        <p className="text-2xl font-bold text-blue-500">
                          {user.stats?.comments || 0}
                        </p>
                        <p className="text-sm text-rophim-textSecondary">Bình luận</p>
                      </div>
                      <div className="text-center p-4 bg-rophim-hover rounded-lg">
                        <FaStar className="mx-auto text-yellow-500 mb-2" size={24} />
                        <p className="text-2xl font-bold text-yellow-500">
                          {user.stats?.ratings || 0}
                        </p>
                        <p className="text-sm text-rophim-textSecondary">Đánh giá</p>
                      </div>
                      <div className="text-center p-4 bg-rophim-hover rounded-lg">
                        <FaHeart className="mx-auto text-red-500 mb-2" size={24} />
                        <p className="text-2xl font-bold text-red-500">
                          {user.stats?.favorites || 0}
                        </p>
                        <p className="text-sm text-rophim-textSecondary">Yêu thích</p>
                      </div>
                      <div className="text-center p-4 bg-rophim-hover rounded-lg">
                        <FaHistory className="mx-auto text-green-500 mb-2" size={24} />
                        <p className="text-2xl font-bold text-green-500">
                          {user.stats?.history || 0}
                        </p>
                        <p className="text-sm text-rophim-textSecondary">Lịch sử xem</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Timeline */}
                  <div className="bg-rophim-card rounded-lg p-6 border border-rophim-border">
                    <h3 className="text-lg font-semibold mb-4">Dòng thời gian</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <FaCalendar className="text-blue-500 mt-1" size={16} />
                        <div>
                          <p className="text-sm font-medium">Ngày tham gia</p>
                          <p className="text-xs text-rophim-textSecondary">
                            {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <FaClock className="text-green-500 mt-1" size={16} />
                        <div>
                          <p className="text-sm font-medium">Lần cuối đăng nhập</p>
                          <p className="text-xs text-rophim-textSecondary">
                            {user.lastLogin ? formatDate(user.lastLogin) : 'Chưa đăng nhập'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <FaEnvelope className="text-purple-500 mt-1" size={16} />
                        <div>
                          <p className="text-sm font-medium">Cập nhật lần cuối</p>
                          <p className="text-xs text-rophim-textSecondary">
                            {formatDate(user.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div className="bg-rophim-card rounded-lg p-6 border border-rophim-border">
                  <h3 className="text-lg font-semibold mb-4">Bình luận gần đây</h3>
                  {user.comments && user.comments.length > 0 ? (
                    <div className="space-y-4">
                      {user.comments.map((comment) => (
                        <div key={comment.id} className="border-b border-rophim-border pb-4 last:border-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <FaComment className="text-blue-500" size={14} />
                              <span className="text-sm font-medium">
                                Phim: {comment.movie?.title || 'N/A'}
                              </span>
                            </div>
                            <span className="text-xs text-rophim-textSecondary">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-rophim-textSecondary py-8">
                      Người dùng chưa có bình luận nào
                    </p>
                  )}
                </div>
              )}

              {/* Ratings Tab */}
              {activeTab === 'ratings' && (
                <div className="bg-rophim-card rounded-lg p-6 border border-rophim-border">
                  <h3 className="text-lg font-semibold mb-4">Đánh giá gần đây</h3>
                  {user.ratings && user.ratings.length > 0 ? (
                    <div className="space-y-4">
                      {user.ratings.map((rating) => (
                        <div key={rating.id} className="border-b border-rophim-border pb-4 last:border-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <FaStar className="text-yellow-500" size={14} />
                              <span className="text-sm font-medium">
                                Phim: {rating.movie?.title || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-yellow-500">
                                {rating.score}/5
                              </span>
                              <span className="text-xs text-rophim-textSecondary">
                                {formatDate(rating.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-rophim-textSecondary py-8">
                      Người dùng chưa có đánh giá nào
                    </p>
                  )}
                </div>
              )}

              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <div className="bg-rophim-card rounded-lg p-6 border border-rophim-border">
                  <h3 className="text-lg font-semibold mb-4">Phim yêu thích</h3>
                  {user.favorites && user.favorites.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {user.favorites.map((favorite) => (
                        <div key={favorite.id} className="text-center">
                          {favorite.movie?.poster ? (
                            <img
                              src={getImageUrl(favorite.movie.poster)}
                              alt={favorite.movie.title}
                              className="w-full aspect-[2/3] object-cover rounded-lg mb-2"
                              onError={(e) => {
                                e.target.src = 'https://picsum.photos/200/300?random=1'
                              }}
                            />
                          ) : (
                            <div className="w-full aspect-[2/3] bg-rophim-hover rounded-lg mb-2 flex items-center justify-center">
                              <FaFilm className="text-rophim-textSecondary" size={24} />
                            </div>
                          )}
                          <p className="text-sm font-medium line-clamp-1">{favorite.movie?.title}</p>
                          <p className="text-xs text-rophim-textSecondary">
                            {formatDate(favorite.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-rophim-textSecondary py-8">
                      Người dùng chưa có phim yêu thích nào
                    </p>
                  )}
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="bg-rophim-card rounded-lg p-6 border border-rophim-border">
                  <h3 className="text-lg font-semibold mb-4">Lịch sử xem</h3>
                  {user.histories && user.histories.length > 0 ? (
                    <div className="space-y-4">
                      {user.histories.map((history) => (
                        <div key={history.id} className="border-b border-rophim-border pb-4 last:border-0">
                          <div className="flex items-start space-x-4">
                            {history.movie?.poster ? (
                              <img
                                src={getImageUrl(history.movie.poster)}
                                alt={history.movie.title}
                                className="w-16 h-24 object-cover rounded"
                                onError={(e) => {
                                  e.target.src = 'https://picsum.photos/200/300?random=1'
                                }}
                              />
                            ) : (
                              <div className="w-16 h-24 bg-rophim-hover rounded flex items-center justify-center">
                                <FaFilm className="text-rophim-textSecondary" size={24} />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{history.movie?.title}</p>
                              {history.episode && (
                                <p className="text-sm text-rophim-textSecondary">
                                  Tập {history.episode.episodeNumber}: {history.episode.title}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 mt-2">
                                <div className="flex-1 bg-rophim-hover rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${history.progress || 0}%` }}
                                  />
                                </div>
                                <span className="text-xs text-rophim-textSecondary">
                                  {history.progress || 0}%
                                </span>
                              </div>
                              <p className="text-xs text-rophim-textSecondary mt-2">
                                Xem lúc: {formatDate(history.watchedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-rophim-textSecondary py-8">
                      Người dùng chưa có lịch sử xem
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={actionDialog.isOpen}
        onClose={() => setActionDialog({ isOpen: false, action: null })}
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
          actionDialog.action === 'lock' ? `Bạn có chắc chắn muốn khóa tài khoản của "${user?.fullName}"?` :
          actionDialog.action === 'unlock' ? `Bạn có chắc chắn muốn mở khóa tài khoản của "${user?.fullName}"?` :
          actionDialog.action === 'delete' ? `Bạn có chắc chắn muốn xóa người dùng "${user?.fullName}"? Hành động này không thể hoàn tác.` :
          `Bạn có chắc chắn muốn đặt lại mật khẩu cho "${user?.fullName}"?`
        }
      />
    </>
  )
}

export default UserDetail