// src/pages/admin/Sliders/SliderForm.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FaSave, FaTimes, FaImage, FaLink, FaFilm, FaExclamationCircle } from 'react-icons/fa'
import { adminSliderApi, adminMovieApi } from '../../../api/admin'
import LoadingSpinner from '../../../components/admin/LoadingSpinner'
import Select from 'react-select'
import { getImageUrl } from '../../../utils/imageUtils'
import toast from 'react-hot-toast'

const SliderForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  // States
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [movies, setMovies] = useState([])
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [imageError, setImageError] = useState('')
  const [linkError, setLinkError] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    buttonText: 'Xem ngay',
    movieId: '',
    link: '',
    order: 0,
    isActive: true,
  })

  // Load movies and slider data
  useEffect(() => {
    loadMovies()
    if (isEdit) {
      loadSlider()
    }
  }, [id])

  const loadMovies = async () => {
    try {
      const response = await adminMovieApi.getMovies({ limit: 100 })
      setMovies(response.data?.movies || [])
    } catch (error) {
      console.error('Error loading movies:', error)
      toast.error('Không thể tải danh sách phim')
    }
  }

  const loadSlider = async () => {
    try {
      setLoading(true)
      const response = await adminSliderApi.getSliderById(id)
      const slider = response.data?.slider || response.data?.data?.slider || {}
      
      setFormData({
        title: slider.title || '',
        description: slider.description || '',
        buttonText: slider.buttonText || 'Xem ngay',
        movieId: slider.movieId || slider.movie_id || '',
        link: slider.link || '',
        order: slider.order || 0,
        isActive: slider.isActive ?? slider.is_active ?? true,
      })
      
      if (slider.image) {
        setImageUrl(slider.image)
        setImagePreview(getImageUrl(slider.image))
      }
    } catch (error) {
      console.error('Error loading slider:', error)
      toast.error('Không thể tải thông tin slider')
      navigate('/admin/sliders')
    } finally {
      setLoading(false)
    }
  }

  // Validate URL
  const validateUrl = (url, type = 'image') => {
    if (!url) return type === 'image' && !isEdit ? 'Vui lòng nhập URL hình ảnh' : ''
    
    // Kiểm tra URL hợp lệ
    const isValidHttpUrl = url.startsWith('http://') || url.startsWith('https://')
    const isValidPath = url.startsWith('/')
    
    if (!isValidHttpUrl && !isValidPath) {
      return `URL ${type === 'image' ? 'hình ảnh' : 'đường dẫn'} không hợp lệ. Phải bắt đầu bằng http://, https:// hoặc /`
    }
    
    // Kiểm tra định dạng ảnh (nếu là image)
    if (type === 'image' && isValidHttpUrl) {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
      const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext))
      if (!hasImageExtension) {
        return 'URL hình ảnh nên có đuôi .jpg, .png, .gif, .webp'
      }
    }
    
    return ''
  }

  // Handle image URL change
  const handleImageUrlChange = (e) => {
    const url = e.target.value
    setImageUrl(url)
    
    const error = validateUrl(url, 'image')
    setImageError(error)
    
    // Hiển thị preview nếu URL hợp lệ
    if (url && !error && (url.startsWith('http') || url.startsWith('/'))) {
      setImagePreview(getImageUrl(url))
    } else {
      setImagePreview('')
    }
  }

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))

    // Validate link ngay khi nhập
    if (name === 'link') {
      const error = validateUrl(value, 'link')
      setLinkError(error)
    }

    // Clear movieId khi nhập link
    if (name === 'link' && value) {
      setFormData(prev => ({ ...prev, movieId: '' }))
    }
  }

  // Handle movie selection
  const handleMovieChange = (selected) => {
    setFormData({ 
      ...formData, 
      movieId: selected?.value || '',
      link: '' // Clear link khi chọn movie
    })
    setLinkError('') // Clear lỗi link
  }

  // Validate form before submit
  const validateForm = () => {
    // Kiểm tra image
    if (!isEdit && !imageUrl) {
      toast.error('Vui lòng nhập URL hình ảnh cho slider')
      return false
    }

    const imageValidation = validateUrl(imageUrl, 'image')
    if (imageValidation) {
      setImageError(imageValidation)
      toast.error(imageValidation)
      return false
    }

    // Kiểm tra link nếu có
    if (formData.link && !formData.movieId) {
      const linkValidation = validateUrl(formData.link, 'link')
      if (linkValidation) {
        setLinkError(linkValidation)
        toast.error(linkValidation)
        return false
      }
    }

    // Kiểm tra order
    if (formData.order < 0) {
      toast.error('Thứ tự phải là số không âm')
      return false
    }

    return true
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setSaving(true)

    try {
      // Xử lý dữ liệu trước khi gửi
      const dataToSend = {
        title: formData.title?.trim() || null,
        description: formData.description?.trim() || null,
        buttonText: formData.buttonText?.trim() || 'Xem ngay',
        movieId: formData.movieId ? parseInt(formData.movieId) : null,
        link: formData.movieId ? null : (formData.link?.trim() || null),
        order: parseInt(formData.order) || 0,
        isActive: formData.isActive,
        image: imageUrl.trim(),
      }

      // Log dữ liệu gửi đi
      console.log('📦 Sending data to API:', JSON.stringify(dataToSend, null, 2))

      let response
      if (isEdit) {
        response = await adminSliderApi.updateSlider(id, dataToSend)
        console.log('✅ Update response:', response.data)
        toast.success('Cập nhật slider thành công!')
      } else {
        response = await adminSliderApi.createSlider(dataToSend)
        console.log('✅ Create response:', response.data)
        toast.success('Thêm slider mới thành công!')
      }
      
      // Chuyển về trang danh sách
      navigate('/admin/sliders')
      
    } catch (error) {
      console.error('❌ Error saving slider:', error)
      
      // Xử lý lỗi từ server
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          (isEdit ? 'Không thể cập nhật slider' : 'Không thể thêm slider')
      
      toast.error(errorMessage)
      
      // Log chi tiết lỗi để debug
      if (error.response) {
        console.error('Server response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        })
      }
    } finally {
      setSaving(false)
    }
  }

  // Style cho react-select
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#1a1a1a',
      borderColor: state.isFocused ? '#3b82f6' : '#2a2a2a',
      color: '#fff',
      minHeight: '42px',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
      '&:hover': {
        borderColor: '#3b82f6'
      }
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#1a1a1a',
      border: '1px solid #2a2a2a',
      zIndex: 50
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#2a2a2a' : '#1a1a1a',
      color: '#fff',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#2a2a2a'
      }
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
    noOptionsMessage: (base) => ({
      ...base,
      color: '#6b7280',
    }),
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <>
      <Helmet>
        <title>{isEdit ? 'Chỉnh sửa slider' : 'Thêm slider mới'} - RoPhim Admin</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {isEdit ? 'Chỉnh sửa slider' : 'Thêm slider mới'}
          </h1>
          <div className="flex items-center space-x-2 text-sm text-rophim-textSecondary">
            <FaImage className="text-blue-500" />
            <span>Nhập URL hình ảnh (khuyến nghị: 1920x1080px)</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image URL Section */}
          <div className="bg-rophim-card rounded-lg p-6 border border-rophim-border">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaImage className="mr-2 text-blue-500" />
              URL hình ảnh {!isEdit && <span className="text-red-500 ml-1">*</span>}
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <div className="flex-1">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                    className={`input-field ${imageError ? 'border-red-500' : ''}`}
                    placeholder="https://example.com/images/slider-1.jpg"
                    required={!isEdit}
                  />
                  {imageError && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <FaExclamationCircle className="mr-1" />
                      {imageError}
                    </p>
                  )}
                </div>
                <div className="flex items-center h-10 px-3 bg-rophim-hover rounded-lg text-rophim-textSecondary">
                  <FaLink size={16} />
                </div>
              </div>
              <p className="text-xs text-rophim-textSecondary">
                Hỗ trợ: URL từ các trang ảnh như imgur, cloudinary, hoặc đường dẫn tương đối /uploads/sliders/...
              </p>

              {/* Image Preview */}
              {imagePreview && !imageError && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    Xem trước:
                  </label>
                  <div className="relative rounded-lg overflow-hidden border border-rophim-border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/1920x1080?text=Invalid+Image+URL'
                        setImageError('Không thể tải ảnh từ URL này')
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-rophim-card rounded-lg p-6 border border-rophim-border">
            <h2 className="text-lg font-semibold mb-4">Thông tin slider</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Nhập tiêu đề hiển thị trên slider"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                  placeholder="Nhập mô tả ngắn về slider..."
                />
              </div>

              {/* Button Text */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Text nút
                </label>
                <input
                  type="text"
                  name="buttonText"
                  value={formData.buttonText}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="VD: Xem ngay"
                />
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Thứ tự
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  className="input-field"
                  min="0"
                />
              </div>

              {/* Movie Link */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Liên kết đến phim
                </label>
                <div className="flex items-start space-x-2">
                  <div className="flex-1">
                    <Select
                      options={movies.map(m => ({ value: m.id, label: m.title }))}
                      value={formData.movieId ? { 
                        value: formData.movieId, 
                        label: movies.find(m => m.id === parseInt(formData.movieId))?.title 
                      } : null}
                      onChange={handleMovieChange}
                      styles={selectStyles}
                      isClearable
                      placeholder="Chọn phim để liên kết..."
                      noOptionsMessage={() => "Không có phim nào"}
                    />
                  </div>
                  <div className="flex items-center h-10 px-3 bg-rophim-hover rounded-lg text-rophim-textSecondary">
                    <FaFilm size={16} />
                  </div>
                </div>
              </div>

              {/* Custom Link */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Hoặc liên kết tùy chỉnh
                </label>
                <div className="flex items-start space-x-2">
                  <div className="flex-1">
                    <input
                      type="url"
                      name="link"
                      value={formData.link}
                      onChange={handleChange}
                      className={`input-field ${linkError ? 'border-red-500' : ''}`}
                      placeholder="https://example.com hoặc /movies/example"
                      disabled={!!formData.movieId}
                    />
                    {linkError && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <FaExclamationCircle className="mr-1" />
                        {linkError}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center h-10 px-3 bg-rophim-hover rounded-lg text-rophim-textSecondary">
                    <FaLink size={16} />
                  </div>
                </div>
                <p className="text-xs text-rophim-textSecondary mt-1">
                  Ví dụ: /movies/ky-sinh-trung hoặc https://example.com
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-rophim-card rounded-lg p-6 border border-rophim-border">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 rounded border-rophim-border bg-rophim-bg text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
              />
              <div>
                <span className="font-medium">Kích hoạt slider</span>
                <p className="text-sm text-rophim-textSecondary">
                  Slider sẽ hiển thị trên trang chủ nếu được kích hoạt
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/sliders')}
              className="btn-secondary flex items-center space-x-2 px-6 py-3"
              disabled={saving}
            >
              <FaTimes size={16} />
              <span>Hủy</span>
            </button>
            <button
              type="submit"
              disabled={saving || !!imageError || !!linkError}
              className="btn-primary flex items-center space-x-2 px-6 py-3 min-w-[140px] justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <FaSave size={16} />
                  <span>{isEdit ? 'Cập nhật' : 'Thêm mới'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default SliderForm