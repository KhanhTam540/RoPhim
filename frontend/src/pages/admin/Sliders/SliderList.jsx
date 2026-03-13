// src/pages/admin/Sliders/SliderList.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { 
  FaPlus, FaEdit, FaTrash, FaEye, 
  FaToggleOn, FaToggleOff, FaArrowUp, FaArrowDown,
  FaImage, FaFilm, FaLink, FaSort
} from 'react-icons/fa'
import { adminSliderApi } from '../../../api/admin'
import ConfirmDialog from '../../../components/admin/ConfirmDialog'
import LoadingSpinner from '../../../components/admin/LoadingSpinner'
import { getImageUrl } from '../../../utils/imageUtils'
import toast from 'react-hot-toast'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Sortable Item Component
const SortableItem = ({ slider, onEdit, onDelete, onView, onToggleStatus }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slider.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  const imageUrl = slider.image ? getImageUrl(slider.image) : 'https://via.placeholder.com/200x100?text=No+Image'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-rophim-card rounded-lg overflow-hidden cursor-move hover:bg-rophim-hover transition-all border ${
        isDragging ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-105' : 'border-rophim-border'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4">
        {/* Drag Handle Indicator */}
        <div className="hidden sm:block text-gray-500 mr-2">
          <FaSort size={16} />
        </div>

        {/* Image */}
        <div className="flex-shrink-0">
          <img
            src={imageUrl}
            alt={slider.title || 'Slider'}
            className="w-24 h-16 object-cover rounded-lg border border-rophim-border"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = 'https://via.placeholder.com/200x100?text=No+Image'
            }}
          />
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-lg truncate">
            {slider.title || 'Chưa có tiêu đề'}
          </h3>
          
          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-rophim-textSecondary">
            {slider.movie && (
              <span className="flex items-center gap-1">
                <FaFilm size={12} />
                {slider.movie.title}
              </span>
            )}
            {slider.link && (
              <span className="flex items-center gap-1">
                <FaLink size={12} />
                {slider.link.length > 30 ? slider.link.substring(0, 30) + '...' : slider.link}
              </span>
            )}
            <span className="flex items-center gap-1">
              <FaImage size={12} />
              Thứ tự: {slider.order}
            </span>
          </div>

          {slider.description && (
            <p className="text-sm text-rophim-textSecondary mt-2 line-clamp-2">
              {slider.description}
            </p>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-1 w-full sm:w-auto justify-end">
          <span className={`px-3 py-1 rounded-full text-xs font-medium mr-2 ${
            slider.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-400'
          }`}>
            {slider.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
          </span>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onView(slider)
            }}
            className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
            title="Xem trước"
          >
            <FaEye size={16} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(slider)
            }}
            className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <FaEdit size={16} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleStatus(slider)
            }}
            className={`p-2 rounded-lg transition-colors ${
              slider.isActive 
                ? 'text-green-500 hover:bg-green-500/10' 
                : 'text-gray-400 hover:bg-gray-500/10'
            }`}
            title={slider.isActive ? 'Ẩn slider' : 'Hiển thị slider'}
          >
            {slider.isActive ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(slider)
            }}
            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Xóa slider"
          >
            <FaTrash size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

const SliderList = () => {
  const navigate = useNavigate()
  const [sliders, setSliders] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, slider: null })
  const [reordering, setReordering] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadSliders()
  }, [])

  const loadSliders = async () => {
    try {
      setLoading(true)
      const response = await adminSliderApi.getSliders()
      // API trả về { data: { sliders: [...] } } hoặc { sliders: [...] }
      const slidersData = response.data?.sliders || response.sliders || []
      setSliders(slidersData)
    } catch (error) {
      console.error('❌ Error loading sliders:', error)
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
      console.error('❌ Error deleting slider:', error)
      toast.error(error.response?.data?.message || 'Không thể xóa slider')
    } finally {
      setDeleteDialog({ isOpen: false, slider: null })
    }
  }

  const handleToggleStatus = async (slider) => {
    try {
      await adminSliderApi.toggleStatus(slider.id, !slider.isActive)
      toast.success(slider.isActive ? 'Đã ẩn slider' : 'Đã hiển thị slider')
      loadSliders()
    } catch (error) {
      console.error('❌ Error toggling status:', error)
      toast.error('Không thể thay đổi trạng thái')
    }
  }

  const handleEdit = (slider) => {
    navigate(`/admin/sliders/${slider.id}`)
  }

  const handleView = (slider) => {
    // Nếu slider có link thì mở link, nếu có movie thì mở trang phim
    if (slider.link) {
      window.open(slider.link, '_blank')
    } else if (slider.movie?.slug) {
      window.open(`/phim/${slider.movie.slug}`, '_blank')
    } else {
      window.open('/', '_blank')
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = sliders.findIndex((s) => s.id === active.id)
      const newIndex = sliders.findIndex((s) => s.id === over.id)
      
      const newSliders = arrayMove(sliders, oldIndex, newIndex)
      
      // Update order
      const updatedSliders = newSliders.map((slider, index) => ({
        ...slider,
        order: index + 1
      }))
      
      setSliders(updatedSliders)

      // Save to API
      try {
        setReordering(true)
        await adminSliderApi.reorderSliders(
          updatedSliders.map(s => ({ id: s.id, order: s.order }))
        )
        toast.success('Đã cập nhật thứ tự slider')
      } catch (error) {
        console.error('❌ Error reordering sliders:', error)
        toast.error('Không thể cập nhật thứ tự')
        loadSliders() // Reload to revert changes
      } finally {
        setReordering(false)
      }
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
          <div>
            <h1 className="text-2xl font-bold">Quản lý slider</h1>
            <p className="text-sm text-rophim-textSecondary mt-1">
              Quản lý các slider hiển thị trên trang chủ
            </p>
          </div>
          <Link
            to="/admin/sliders/create"
            className="btn-primary flex items-center justify-center space-x-2 px-4 py-2"
          >
            <FaPlus size={16} />
            <span>Thêm slider mới</span>
          </Link>
        </div>

        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-500 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-500 font-medium">Hướng dẫn sắp xếp</p>
              <p className="text-sm text-blue-500/80 mt-1">
                Kéo thả các slider bằng biểu tượng <FaSort className="inline mx-1" /> để sắp xếp thứ tự hiển thị. 
                Slider ở trên cùng sẽ hiển thị đầu tiên trên trang chủ.
              </p>
            </div>
          </div>
        </div>

        {/* Sliders List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : sliders.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sliders.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {sliders.map((slider) => (
                  <SortableItem
                    key={slider.id}
                    slider={slider}
                    onEdit={handleEdit}
                    onDelete={(s) => setDeleteDialog({ isOpen: true, slider: s })}
                    onView={handleView}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-16 bg-rophim-card rounded-lg border border-rophim-border">
            <div className="text-6xl mb-4 opacity-30">🎯</div>
            <h3 className="text-xl font-medium mb-2">Chưa có slider nào</h3>
            <p className="text-rophim-textSecondary mb-6">
              Bắt đầu bằng cách thêm slider đầu tiên để hiển thị trên trang chủ
            </p>
            <Link
              to="/admin/sliders/create"
              className="btn-primary inline-flex items-center space-x-2 px-6 py-3"
            >
              <FaPlus size={16} />
              <span>Thêm slider đầu tiên</span>
            </Link>
          </div>
        )}

        {/* Reordering overlay */}
        {reordering && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-rophim-card rounded-lg p-4 flex items-center space-x-3">
              <LoadingSpinner size="sm" />
              <span>Đang cập nhật thứ tự...</span>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, slider: null })}
        onConfirm={handleDelete}
        title="Xóa slider"
        message={
          deleteDialog.slider
            ? `Bạn có chắc chắn muốn xóa slider "${deleteDialog.slider.title || 'không tiêu đề'}"? Hành động này không thể hoàn tác.`
            : 'Bạn có chắc chắn muốn xóa slider này?'
        }
      />
    </>
  )
}

export default SliderList