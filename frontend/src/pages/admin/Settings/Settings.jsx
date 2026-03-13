import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { FaSave } from 'react-icons/fa'
import toast from 'react-hot-toast'

const Settings = () => {
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    siteName: 'RoPhim',
    siteDescription: 'Xem phim online miễn phí chất lượng cao',
    contactEmail: 'admin@rophim.is',
    itemsPerPage: 20,
    enableComments: true,
    enableRatings: true,
    maintenanceMode: false,
    facebookUrl: 'https://facebook.com/rophim',
    youtubeUrl: 'https://youtube.com/rophim',
    twitterUrl: 'https://twitter.com/rophim',
    instagramUrl: 'https://instagram.com/rophim',
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    // Simulate API call
    setTimeout(() => {
      toast.success('Cập nhật cài đặt thành công')
      setSaving(false)
    }, 1000)
  }

  return (
    <>
      <Helmet>
        <title>Cài đặt hệ thống - RoPhim Admin</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Cài đặt hệ thống</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Settings */}
          <div className="bg-rophim-card rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Cài đặt chung</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tên trang web
                </label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email liên hệ
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={settings.contactEmail}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Mô tả trang web
                </label>
                <textarea
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Số item mỗi trang
                </label>
                <input
                  type="number"
                  name="itemsPerPage"
                  value={settings.itemsPerPage}
                  onChange={handleChange}
                  className="input-field"
                  min="5"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Feature Settings */}
          <div className="bg-rophim-card rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Tính năng</h2>

            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="enableComments"
                  checked={settings.enableComments}
                  onChange={handleChange}
                  className="rounded border-rophim-border bg-rophim-bg"
                />
                <span>Cho phép bình luận</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="enableRatings"
                  checked={settings.enableRatings}
                  onChange={handleChange}
                  className="rounded border-rophim-border bg-rophim-bg"
                />
                <span>Cho phép đánh giá phim</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleChange}
                  className="rounded border-rophim-border bg-rophim-bg"
                />
                <span>Chế độ bảo trì</span>
              </label>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-rophim-card rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Mạng xã hội</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Facebook URL
                </label>
                <input
                  type="url"
                  name="facebookUrl"
                  value={settings.facebookUrl}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  YouTube URL
                </label>
                <input
                  type="url"
                  name="youtubeUrl"
                  value={settings.youtubeUrl}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Twitter URL
                </label>
                <input
                  type="url"
                  name="twitterUrl"
                  value={settings.twitterUrl}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Instagram URL
                </label>
                <input
                  type="url"
                  name="instagramUrl"
                  value={settings.instagramUrl}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center space-x-2"
            >
              <FaSave size={16} />
              <span>{saving ? 'Đang lưu...' : 'Lưu cài đặt'}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default Settings