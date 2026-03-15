// src/pages/admin/Sliders/SliderList.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff, 
  FaSave, FaTimes, FaArrowUp, FaArrowDown
} from 'react-icons/fa'
import { adminSliderApi } from '../../../api/admin'
import ConfirmDialog from '../../../components/admin/ConfirmDialog'
import LoadingSpinner from '../../../components/admin/LoadingSpinner'
import { getImageUrl } from '../../../utils/imageUtils'
import toast from 'react-hot-toast'

const SliderList = () => {
  const navigate = useNavigate()
  const [sliders, setSliders] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, slider: null })
  const [editingOrder, setEditingOrder] = useState(null)
  const [newOrder, setNewOrder] = useState('')
  const [savingOrder, setSavingOrder] = useState(false)

  useEffect(() => {
    loadSliders()
  }, [])

  const loadSliders = async () => {
    try {
      setLoading(true)
      const response = await adminSliderApi.getSliders()
      const sortedSliders = (response.data?.sliders || []).sort((a, b) => a.order - b.order)
      setSliders(sortedSliders)
    } catch (error) {
      console.error('Error loading sliders:', error)
      toast.error('Không thể tải danh sách slider')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await adminSliderApi.deleteSlider(deleteDialog.slider.id)
      toast.success('Xóa slider thành công')
      loadSliders()
    } catch (error) {
      console.error('Error deleting slider:', error)
      toast.error(error.response?.data?.message || 'Không thể xóa slider')
    } finally {
      setDeleteDialog({ isOpen: false, slider: null })
    }
  }

  const handleToggleStatus = async (slider) => {
    try {
      await adminSliderApi.toggleStatus(slider.id, !slider.isActive)
      toast.success(slider.isActive ? 'Đã vô hiệu hóa slider' : 'Đã kích hoạt slider')
      loadSliders()
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error('Không thể thay đổi trạng thái')
    }
  }

  const handleEdit = (slider) => {
    navigate(`/admin/sliders/${slider.id}`)
  }

  const handleView = (slider) => {
    window.open('/', '_blank')
  }

  const startEditOrder = (slider) => {
    setEditingOrder(slider.id)
    setNewOrder(slider.order.toString())
  }

  const cancelEditOrder = () => {
    setEditingOrder(null)
    setNewOrder('')
  }

  const saveOrder = async (sliderId) => {
    const orderValue = parseInt(newOrder)
    
    if (isNaN(orderValue) || orderValue < 0) {
      toast.error('Thứ tự phải là số không âm')
      return
    }

    setSavingOrder(true)
    try {
      await adminSliderApi.updateSlider(sliderId, { order: orderValue })
      toast.success('Đã cập nhật thứ tự')
      loadSliders()
      setEditingOrder(null)
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Không thể cập nhật thứ tự')
    } finally {
      setSavingOrder(false)
    }
  }

  const moveUp = (index) => {
    if (index === 0) return
    const newSliders = [...sliders]
    const temp = newSliders[index].order
    newSliders[index].order = newSliders[index - 1].order
    newSliders[index - 1].order = temp
    
    // Sắp xếp lại theo order
    newSliders.sort((a, b) => a.order - b.order)
    setSliders(newSliders)
  }

  const moveDown = (index) => {
    if (index === sliders.length - 1) return
    const newSliders = [...sliders]
    const temp = newSliders[index].order
    newSliders[index].order = newSliders[index + 1].order
    newSliders[index + 1].order = temp
    
    // Sắp xếp lại theo order
    newSliders.sort((a, b) => a.order - b.order)
    setSliders(newSliders)
  }

  const saveAllOrders = async () => {
    setSavingOrder(true)
    try {
      const slidersToUpdate = sliders.map(slider => ({
        id: slider.id,
        order: slider.order
      }))
      
      await adminSliderApi.reorderSliders(slidersToUpdate)
      toast.success('Đã cập nhật tất cả thứ tự')
      loadSliders()
    } catch (error) {
      console.error('Error saving all orders:', error)
      toast.error('Không thể cập nhật thứ tự')
    } finally {
      setSavingOrder(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Quản lý slider - RoPhim Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Quản lý slider</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={saveAllOrders}
              disabled={savingOrder}
              className="btn-primary flex items-center space-x-2 px-4 py-2"
            >
              <FaSave size={16} />
              <span>{savingOrder ? 'Đang lưu...' : 'Lưu thứ tự'}</span>
            </button>
            <Link
              to="/admin/sliders/create"
              className="btn-primary flex items-center justify-center space-x-2 px-4 py-2"
            >
              <FaPlus size={16} />
              <span>Thêm slider</span>
            </Link>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
          <p className="text-sm text-blue-500">
            <strong>Hướng dẫn:</strong> Sử dụng nút lên/xuống để sắp xếp thứ tự slider. 
            Slider ở trên cùng sẽ hiển thị đầu tiên.
          </p>
        </div>

        {/* Sliders List */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-4">
            {sliders.map((slider, index) => {
              const imageUrl = slider.image ? getImageUrl(slider.image) : 'https://picsum.photos/200/100?random=5'
              
              return (
                <div
                  key={slider.id}
                  className="bg-rophim-card rounded-lg overflow-hidden border border-rophim-border hover:border-blue-500 transition-colors"
                >
                  <div className="flex flex-col md:flex-row p-4 gap-4">
                    {/* Ảnh preview */}
                    <div className="w-full md:w-48 flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt={slider.title || 'Slider'}
                        className="w-full h-24 object-cover rounded"
                        onError={(e) => e.target.src = 'https://picsum.photos/200/100?random=5'}
                      />
                    </div>

                    {/* Thông tin */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold truncate">
                          {slider.title || 'Không có tiêu đề'}
                        </h3>
                      </div>

                      {slider.movie && (
                        <p className="text-sm text-rophim-textSecondary mb-1">
                          <span className="font-medium">Phim:</span> {slider.movie.title}
                        </p>
                      )}

                      {slider.description && (
                        <p className="text-sm text-rophim-textSecondary mb-1 line-clamp-2">
                          {slider.description}
                        </p>
                      )}

                      {/* Order controls */}
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-rophim-textSecondary">
                            Thứ tự:
                          </span>
                          <span className="text-sm font-bold bg-rophim-hover px-3 py-1 rounded">
                            {slider.order}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className={`p-1.5 rounded transition-colors ${
                              index === 0 
                                ? 'text-gray-600 cursor-not-allowed' 
                                : 'text-blue-500 hover:bg-blue-500/10'
                            }`}
                            title="Di chuyển lên"
                          >
                            <FaArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => moveDown(index)}
                            disabled={index === sliders.length - 1}
                            className={`p-1.5 rounded transition-colors ${
                              index === sliders.length - 1 
                                ? 'text-gray-600 cursor-not-allowed' 
                                : 'text-blue-500 hover:bg-blue-500/10'
                            }`}
                            title="Di chuyển xuống"
                          >
                            <FaArrowDown size={14} />
                          </button>
                        </div>

                        {editingOrder === slider.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              value={newOrder}
                              onChange={(e) => setNewOrder(e.target.value)}
                              className="w-20 px-2 py-1 bg-rophim-bg border border-rophim-border rounded text-sm focus:outline-none focus:border-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={() => saveOrder(slider.id)}
                              disabled={savingOrder}
                              className="p-1.5 text-green-500 hover:bg-green-500/10 rounded"
                              title="Lưu"
                            >
                              <FaSave size={14} />
                            </button>
                            <button
                              onClick={cancelEditOrder}
                              className="p-1.5 text-red-500 hover:bg-red-500/10 rounded"
                              title="Hủy"
                            >
                              <FaTimes size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditOrder(slider)}
                            className="p-1.5 text-yellow-500 hover:bg-yellow-500/10 rounded"
                            title="Nhập số thứ tự"
                          >
                            <FaEdit size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status và Actions - CĂN CHỈNH NGANG HÀNG */}
                    <div className="flex flex-row items-center space-x-2 w-full md:w-auto">
                      {/* Status badge */}
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                        slider.isActive 
                          ? 'bg-green-500/20 text-green-500 border border-green-500/30' 
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {slider.isActive ? 'Active' : 'Inactive'}
                      </span>
                      
                      {/* Action buttons */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleView(slider)}
                          className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Xem"
                        >
                          <FaEye size={16} />
                        </button>
                        
                        <button
                          onClick={() => handleEdit(slider)}
                          className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <FaEdit size={16} />
                        </button>
                        
                        <button
                          onClick={() => handleToggleStatus(slider)}
                          className={`p-2 rounded-lg transition-colors ${
                            slider.isActive 
                              ? 'text-green-500 hover:bg-green-500/10' 
                              : 'text-gray-400 hover:bg-gray-500/10'
                          }`}
                          title={slider.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          {slider.isActive ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
                        </button>
                        
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, slider })}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {sliders.length === 0 && (
              <div className="text-center py-12 bg-rophim-card rounded-lg border border-rophim-border">
                <p className="text-rophim-textSecondary mb-4">Chưa có slider nào</p>
                <Link
                  to="/admin/sliders/create"
                  className="btn-primary inline-flex items-center space-x-2 px-6 py-3"
                >
                  <FaPlus size={16} />
                  <span>Thêm slider đầu tiên</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, slider: null })}
        onConfirm={handleDelete}
        title="Xóa slider"
        message={`Bạn có chắc chắn muốn xóa slider "${deleteDialog.slider?.title || 'không tiêu đề'}"?`}
      />
    </>
  )
}

export default SliderList