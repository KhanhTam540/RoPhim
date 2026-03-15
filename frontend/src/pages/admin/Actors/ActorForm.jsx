// src/pages/admin/Actors/ActorForm.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FaSave, FaTimes } from 'react-icons/fa'
import { adminActorApi } from '../../../api/admin'
import LoadingSpinner from '../../../components/admin/LoadingSpinner'
import { getImageUrl } from '../../../utils/imageUtils'
import toast from 'react-hot-toast'

const ActorForm = () => {
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
      loadActor()
    }
  }, [id])

  const loadActor = async () => {
    try {
      setLoading(true)
      const response = await adminActorApi.getActorById(id)
      const actor = response.data?.actor || {}
      setFormData({
        name: actor.name || '',
        originalName: actor.originalName || '',
        bio: actor.bio || '',
        birthDate: actor.birthDate || '',
        deathDate: actor.deathDate || '',
        nationality: actor.nationality || '',
        avatar: actor.avatar || '',
        isActive: actor.isActive ?? true,
      })
    } catch (error) {
      console.error('Error loading actor:', error)
      toast.error('Không thể tải thông tin diễn viên')
      navigate('/admin/actors')
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
        await adminActorApi.updateActor(id, formData)
        toast.success('Cập nhật diễn viên thành công')
      } else {
        await adminActorApi.createActor(formData)
        toast.success('Thêm diễn viên thành công')
      }
      navigate('/admin/actors')
    } catch (error) {
      console.error('Error saving actor:', error)
      toast.error(error.response?.data?.message || (isEdit ? 'Không thể cập nhật diễn viên' : 'Không thể thêm diễn viên'))
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
        <title>{isEdit ? 'Chỉnh sửa diễn viên' : 'Thêm diễn viên mới'} - RoPhim Admin</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isEdit ? 'Chỉnh sửa diễn viên' : 'Thêm diễn viên mới'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-rophim-card rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Thông tin diễn viên</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Tên diễn viên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="VD: Lý Liên Kiệt, Thành Long..."
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
                  placeholder="VD: Jet Li, Jackie Chan..."
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
                  placeholder="VD: Trung Quốc, Hàn Quốc..."
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
                  placeholder="Tiểu sử, sự nghiệp của diễn viên..."
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
              onClick={() => navigate('/admin/actors')}
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

export default ActorForm