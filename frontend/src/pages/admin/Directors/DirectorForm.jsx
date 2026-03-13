// src/pages/admin/Directors/DirectorForm.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FaSave, FaTimes } from 'react-icons/fa'
import { adminDirectorApi } from '../../../api/admin'
import LoadingSpinner from '../../../components/admin/LoadingSpinner'
import { getImageUrl } from '../../../utils/imageUtils'
import toast from 'react-hot-toast'

const DirectorForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    originalName: '',
    bio: '',
    birthDate: '',
    deathDate: '',
    nationality: '',
    avatar: '',
    isActive: true,
  })

  useEffect(() => {
    if (isEdit) {
      loadDirector()
    }
  }, [id])

  const loadDirector = async () => {
    try {
      setLoading(true)
      const response = await adminDirectorApi.getDirectorById(id)
      const director = response.data?.director || {}
      setFormData({
        name: director.name || '',
        originalName: director.originalName || '',
        bio: director.bio || '',
        birthDate: director.birthDate || '',
        deathDate: director.deathDate || '',
        nationality: director.nationality || '',
        avatar: director.avatar || '',
        isActive: director.isActive ?? true,
      })
    } catch (error) {
      console.error('Error loading director:', error)
      toast.error('Không thể tải thông tin đạo diễn')
      navigate('/admin/directors')
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
        await adminDirectorApi.updateDirector(id, formData)
        toast.success('Cập nhật đạo diễn thành công')
      } else {
        await adminDirectorApi.createDirector(formData)
        toast.success('Thêm đạo diễn thành công')
      }
      navigate('/admin/directors')
    } catch (error) {
      console.error('Error saving director:', error)
      toast.error(error.response?.data?.message || (isEdit ? 'Không thể cập nhật đạo diễn' : 'Không thể thêm đạo diễn'))
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
        <title>{isEdit ? 'Chỉnh sửa đạo diễn' : 'Thêm đạo diễn mới'} - RoPhim Admin</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isEdit ? 'Chỉnh sửa đạo diễn' : 'Thêm đạo diễn مới'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-rophim-card rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Thông tin đạo diễn</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Tên đạo diễn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="VD: Lý An, Trương Nghệ Mưu..."
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Tên gốc
                </label>
                <input
                  type="text"
                  name="originalName"
                  value={formData.originalName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="VD: Ang Lee, Zhang Yimou..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Ngày mất
                </label>
                <input
                  type="date"
                  name="deathDate"
                  value={formData.deathDate}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Quốc tịch
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="VD: Đài Loan, Trung Quốc..."
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Avatar URL
                </label>
                <input
                  type="url"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://example.com/avatar.jpg"
                />
                {formData.avatar && (
                  <div className="mt-2">
                    <img
                      src={getImageUrl(formData.avatar)}
                      alt="Avatar preview"
                      className="w-20 h-20 rounded-full object-cover"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Tiểu sử
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="6"
                  className="input-field"
                  placeholder="Tiểu sử, sự nghiệp của đạo diễn..."
                />
              </div>
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
              onClick={() => navigate('/admin/directors')}
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

export default DirectorForm