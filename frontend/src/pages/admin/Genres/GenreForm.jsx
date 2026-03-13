// src/pages/admin/Genres/GenreForm.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FaSave, FaTimes } from 'react-icons/fa'
import { adminGenreApi } from '../../../api/admin'
import LoadingSpinner from '../../../components/admin/LoadingSpinner'
import { getImageUrl } from '../../../utils/imageUtils'
import toast from 'react-hot-toast'

const GenreForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    metaTitle: '',
    metaDescription: '',
    isActive: true,
  })

  useEffect(() => {
    if (isEdit) {
      loadGenre()
    }
  }, [id])

  const loadGenre = async () => {
    try {
      setLoading(true)
      const response = await adminGenreApi.getGenreById(id)
      const genre = response.data?.genre || {}
      setFormData({
        name: genre.name || '',
        description: genre.description || '',
        icon: genre.icon || '',
        metaTitle: genre.metaTitle || '',
        metaDescription: genre.metaDescription || '',
        isActive: genre.isActive ?? true,
      })
    } catch (error) {
      console.error('Error loading genre:', error)
      toast.error('Không thể tải thông tin thể loại')
      navigate('/admin/genres')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (isEdit) {
        await adminGenreApi.updateGenre(id, formData)
        toast.success('Cập nhật thể loại thành công')
      } else {
        await adminGenreApi.createGenre(formData)
        toast.success('Thêm thể loại thành công')
      }
      navigate('/admin/genres')
    } catch (error) {
      console.error('Error saving genre:', error)
      toast.error(error.response?.data?.message || (isEdit ? 'Không thể cập nhật thể loại' : 'Không thể thêm thể loại'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <>
      <Helmet>
        <title>{isEdit ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'} - RoPhim Admin</title>
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isEdit ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-rophim-card rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Thông tin cơ bản</h2>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tên thể loại <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
                placeholder="VD: Hành Động, Tình Cảm..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="input-field"
                placeholder="Mô tả ngắn về thể loại..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Icon URL
              </label>
              <input
                type="url"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="input-field"
                placeholder="https://example.com/icon.png"
              />
              {formData.icon && (
                <div className="mt-2">
                  <img
                    src={getImageUrl(formData.icon)}
                    alt="Icon preview"
                    className="w-12 h-12 object-contain"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
              <p className="text-xs text-rophim-textSecondary mt-1">
                URL hình ảnh icon (khuyến nghị: 64x64px)
              </p>
            </div>
          </div>

          {/* SEO Info */}
          <div className="bg-rophim-card rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Thông tin SEO</h2>

            <div>
              <label className="block text-sm font-medium mb-2">
                Meta Title
              </label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                className="input-field"
                placeholder="Tiêu đề cho SEO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                rows="3"
                className="input-field"
                placeholder="Mô tả cho SEO"
              />
            </div>
          </div>

          {/* Status */}
          <div className="bg-rophim-card rounded-lg p-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 rounded border-rophim-border bg-rophim-bg text-blue-600"
              />
              <span>Kích hoạt</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/genres')}
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
              <span>{saving ? 'Đang lưu...' : 'Lưu'}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default GenreForm