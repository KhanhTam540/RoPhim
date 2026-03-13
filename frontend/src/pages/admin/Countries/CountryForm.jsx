// src/pages/admin/Countries/CountryForm.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FaSave, FaTimes } from 'react-icons/fa'
import { adminCountryApi } from '../../../api/admin'
import LoadingSpinner from '../../../components/admin/LoadingSpinner'
import { getImageUrl } from '../../../utils/imageUtils'
import toast from 'react-hot-toast'

const CountryForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    flag: '',
    isActive: true,
  })

  useEffect(() => {
    if (isEdit) {
      loadCountry()
    }
  }, [id])

  const loadCountry = async () => {
    try {
      setLoading(true)
      const response = await adminCountryApi.getCountryById(id)
      const country = response.data?.country || {}
      setFormData({
        name: country.name || '',
        code: country.code || '',
        flag: country.flag || '',
        isActive: country.isActive ?? true,
      })
    } catch (error) {
      console.error('Error loading country:', error)
      toast.error('Không thể tải thông tin quốc gia')
      navigate('/admin/countries')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value.toUpperCase()
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (isEdit) {
        await adminCountryApi.updateCountry(id, formData)
        toast.success('Cập nhật quốc gia thành công')
      } else {
        await adminCountryApi.createCountry(formData)
        toast.success('Thêm quốc gia thành công')
      }
      navigate('/admin/countries')
    } catch (error) {
      console.error('Error saving country:', error)
      toast.error(error.response?.data?.message || (isEdit ? 'Không thể cập nhật quốc gia' : 'Không thể thêm quốc gia'))
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
        <title>{isEdit ? 'Chỉnh sửa quốc gia' : 'Thêm quốc gia mới'} - RoPhim Admin</title>
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isEdit ? 'Chỉnh sửa quốc gia' : 'Thêm quốc gia mới'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-rophim-card rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Thông tin quốc gia</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tên quốc gia <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="VD: Việt Nam, Hàn Quốc..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Mã quốc gia <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="input-field"
                  required
                  maxLength="2"
                  placeholder="VN, US, JP..."
                />
                <p className="text-xs text-rophim-textSecondary mt-1">
                  Mã ISO 2 ký tự (viết hoa)
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Flag URL
              </label>
              <input
                type="url"
                name="flag"
                value={formData.flag}
                onChange={handleChange}
                className="input-field"
                placeholder="https://example.com/flag.png"
              />
              {formData.flag && (
                <div className="mt-2">
                  <img
                    src={getImageUrl(formData.flag)}
                    alt="Flag preview"
                    className="w-12 h-8 object-cover rounded"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
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
              onClick={() => navigate('/admin/countries')}
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

export default CountryForm