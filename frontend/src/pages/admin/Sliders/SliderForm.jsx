// src/pages/admin/Sliders/SliderForm.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FaSave, FaTimes, FaImage, FaLink, FaFilm } from 'react-icons/fa'
import { adminSliderApi, adminMovieApi } from '../../../api/admin'
import LoadingSpinner from '../../../components/admin/LoadingSpinner'
import Select from 'react-select'
import { getImageUrl } from '../../../utils/imageUtils'
import toast from 'react-hot-toast'

const SliderForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [movies, setMovies] = useState([])
  const [imagePreview, setImagePreview] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    movieId: '',
    link: '',
    order: 0,
    description: '',
    isActive: true,
  })

  useEffect(() => {
    loadMovies()
    if (isEdit) {
      loadSlider()
    }
  }, [id])

  useEffect(() => {
    // Cập nhật preview khi image URL thay đổi
    if (formData.image) {
      setImagePreview(getImageUrl(formData.image))
    } else {
      setImagePreview('')
    }
  }, [formData.image])

  const loadMovies = async () => {
    try {
      const response = await adminMovieApi.getMovies({ limit: 100 })
      // Xử lý response linh hoạt
      const movieList = response.data?.movies || response.movies || []
      const options = movieList.map(m => ({
        value: m.id,
        label: m.title
      }))
      setMovies(options)
    } catch (error) {
      console.error('Lỗi tải danh sách phim:', error)
      toast.error('Không thể tải danh sách phim')
    }
  }

  const loadSlider = async () => {
    try {
      setLoading(true)
      const response = await adminSliderApi.getSliderById(id)
      // Xử lý response linh hoạt
      const slider = response.data?.slider || response.slider
      if (slider) {
        setFormData({
          title: slider.title || '',
          image: slider.image || '',
          movieId: slider.movieId || '',
          link: slider.link || '',
          order: slider.order || 0,
          description: slider.description || '',
          isActive: slider.isActive ?? true,
        })
      }
    } catch (error) {
      console.error('Lỗi tải slider:', error)
      toast.error('Không thể tải thông tin slider')
      navigate('/admin/sliders')
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

  const handleMovieChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      movieId: selectedOption ? selectedOption.value : '',
      // Nếu chọn phim thì xóa link tùy chỉnh
      link: selectedOption ? '' : prev.link
    }))
  }

  const handleImageUrlChange = (e) => {
    const url = e.target.value
    setFormData(prev => ({ ...prev, image: url }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate
    if (!formData.image.trim()) {
      return toast.error('Vui lòng nhập URL hình ảnh cho slider')
    }

    // Kiểm tra URL có hợp lệ không
    try {
      new URL(formData.image)
    } catch {
      return toast.error('URL hình ảnh không hợp lệ')
    }

    // Kiểm tra nếu không có movieId và link thì báo lỗi
    if (!formData.movieId && !formData.link.trim()) {
      return toast.error('Vui lòng chọn phim hoặc nhập link liên kết')
    }

    try {
      setSaving(true)
      
      // Log dữ liệu gửi lên để debug
      console.log('📦 Submitting slider data:', formData)
      
      if (isEdit) {
        await adminSliderApi.updateSlider(id, formData)
        toast.success('Cập nhật slider thành công')
      } else {
        await adminSliderApi.createSlider(formData)
        toast.success('Thêm slider thành công')
      }
      navigate('/admin/sliders')
    } catch (error) {
      console.error('❌ Error saving slider:', error)
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu')
    } finally {
      setSaving(false)
    }
  }

  const selectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: '#1a1a1a',
      borderColor: '#2a2a2a',
      color: '#fff',
      minHeight: '42px',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#1a1a1a',
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#2a2a2a' : '#1a1a1a',
      color: '#fff',
      cursor: 'pointer',
    }),
    input: (base) => ({
      ...base,
      color: '#fff',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#fff',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#6b7280',
    }),
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{isEdit ? 'Sửa Slider' : 'Thêm Slider'} - RoPhim Admin</title>
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {isEdit ? 'Chỉnh sửa Slider' : 'Thêm Slider mới'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-rophim-card rounded-lg p-6 space-y-6 border border-rophim-border">
            {/* Tiêu đề */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tiêu đề slider <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                placeholder="Nhập tiêu đề hiển thị trên slider"
                required
              />
            </div>

            {/* URL hình ảnh */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                <FaImage className="mr-2 text-gray-400" />
                URL hình ảnh <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleImageUrlChange}
                className="input-field"
                placeholder="https://example.com/images/slider-1.jpg"
                required
              />
              <p className="text-xs text-rophim-textSecondary mt-1">
                Nhập URL hình ảnh (khuyến nghị kích thước 1920x1080px)
              </p>
              
              {/* Preview hình ảnh */}
              {imagePreview && (
                <div className="mt-4 border border-rophim-border rounded-lg overflow-hidden">
                  <p className="text-xs font-medium px-3 py-2 bg-rophim-hover border-b border-rophim-border">
                    Xem trước
                  </p>
                  <div className="p-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-64 object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://via.placeholder.com/1920x1080?text=Invalid+Image+URL'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Liên kết */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                  <FaFilm className="mr-2 text-gray-400" />
                  Liên kết tới phim
                </label>
                <Select
                  options={movies}
                  value={movies.find(m => m.value === formData.movieId)}
                  onChange={handleMovieChange}
                  placeholder="Chọn phim liên kết"
                  isClearable
                  styles={selectStyles}
                />
                <p className="text-xs text-rophim-textSecondary mt-1">
                  Chọn phim có sẵn trong hệ thống
                </p>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                  <FaLink className="mr-2 text-gray-400" />
                  Hoặc link tùy chỉnh
                </label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://example.com/promotion"
                  disabled={!!formData.movieId}
                />
                <p className="text-xs text-rophim-textSecondary mt-1">
                  {formData.movieId 
                    ? 'Đã chọn phim, không thể nhập link tùy chỉnh' 
                    : 'Nhập link ngoài (quảng cáo, sự kiện...)'}
                </p>
              </div>
            </div>

            {/* Thứ tự và mô tả */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  className="input-field"
                  min="0"
                />
                <p className="text-xs text-rophim-textSecondary mt-1">
                  Số càng nhỏ hiển thị càng đầu
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Mô tả ngắn
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                  placeholder="Nhập mô tả ngắn cho slider (không bắt buộc)"
                />
              </div>
            </div>

            {/* Trạng thái */}
            <div className="flex items-center space-x-3 pt-4 border-t border-rophim-border">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 rounded border-rophim-border bg-rophim-bg text-blue-600"
              />
              <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                Kích hoạt hiển thị trên trang chủ
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/sliders')}
              className="btn-secondary flex items-center space-x-2 px-6 py-2"
            >
              <FaTimes size={16} />
              <span>Hủy</span>
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center space-x-2 px-6 py-2"
            >
              <FaSave size={16} />
              <span>{saving ? 'Đang lưu...' : 'Lưu slider'}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default SliderForm