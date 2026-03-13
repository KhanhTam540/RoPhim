// src/pages/admin/Movies/MovieForm.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FaSave, FaTimes } from 'react-icons/fa'
import { adminMovieApi, adminGenreApi, adminCountryApi, adminActorApi, adminDirectorApi } from '../../../api/admin'
import LoadingSpinner from '../../../components/admin/LoadingSpinner'
import Select from 'react-select'
import { getImageUrl } from '../../../utils/imageUtils'
import toast from 'react-hot-toast'

const MovieForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    originalTitle: '',
    description: '',
    releaseYear: '',
    duration: '',
    type: 'single',
    status: 'ongoing',
    quality: '',
    language: '',
    subtitle: true,
    trailerUrl: '',
    videoUrl: '',
    posterUrl: '',
    backdropUrl: '',
    isActive: true,
    isFeatured: false,
    genreIds: [],
    countryIds: [],
    actorIds: [],
    directorIds: [],
  })

  const [genres, setGenres] = useState([])
  const [countries, setCountries] = useState([])
  const [actors, setActors] = useState([])
  const [directors, setDirectors] = useState([])

  useEffect(() => {
    loadOptions()
    if (isEdit) {
      loadMovie()
    }
  }, [id])

  const loadOptions = async () => {
    try {
      const [genresRes, countriesRes, actorsRes, directorsRes] = await Promise.all([
        adminGenreApi.getGenres({ limit: 100 }),
        adminCountryApi.getCountries({ limit: 100 }),
        adminActorApi.getActors({ limit: 100 }),
        adminDirectorApi.getDirectors({ limit: 100 }),
      ])
      setGenres(genresRes.data?.genres || [])
      setCountries(countriesRes.data?.countries || [])
      setActors(actorsRes.data?.actors || [])
      setDirectors(directorsRes.data?.directors || [])
    } catch (error) {
      console.error('Error loading options:', error)
      toast.error('Không thể tải dữ liệu')
    }
  }

  const loadMovie = async () => {
    try {
      setLoading(true)
      const response = await adminMovieApi.getMovieById(id)
      const movie = response.data?.movie || {}
      setFormData({
        title: movie.title || '',
        originalTitle: movie.originalTitle || '',
        description: movie.description || '',
        releaseYear: movie.releaseYear || '',
        duration: movie.duration || '',
        type: movie.type || 'single',
        status: movie.status || 'ongoing',
        quality: movie.quality || '',
        language: movie.language || '',
        subtitle: movie.subtitle ?? true,
        trailerUrl: movie.trailerUrl || '',
        videoUrl: movie.videoUrl || '',
        posterUrl: movie.poster || '',
        backdropUrl: movie.backdrop || '',
        isActive: movie.isActive ?? true,
        isFeatured: movie.isFeatured ?? false,
        genreIds: movie.genres?.map(g => g.id) || [],
        countryIds: movie.countries?.map(c => c.id) || [],
        actorIds: movie.actors?.map(a => a.id) || [],
        directorIds: movie.directors?.map(d => d.id) || [],
      })
    } catch (error) {
      console.error('Error loading movie:', error)
      toast.error('Không thể tải thông tin phim')
      navigate('/admin/movies')
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

  const handleMultiSelect = (name, selected) => {
    setFormData(prev => ({
      ...prev,
      [name]: selected ? selected.map(item => item.value) : []
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Prepare data for API
      const movieData = {
        ...formData,
        poster: formData.posterUrl,
        backdrop: formData.backdropUrl,
      }
      
      // Remove URL fields
      delete movieData.posterUrl
      delete movieData.backdropUrl

      if (isEdit) {
        await adminMovieApi.updateMovie(id, movieData)
        toast.success('Cập nhật phim thành công')
      } else {
        await adminMovieApi.createMovie(movieData)
        toast.success('Thêm phim thành công')
      }
      navigate('/admin/movies')
    } catch (error) {
      console.error('Error saving movie:', error)
      toast.error(error.response?.data?.message || (isEdit ? 'Không thể cập nhật phim' : 'Không thể thêm phim'))
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
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#1a1a1a',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#2a2a2a' : '#1a1a1a',
      color: '#fff',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#2a2a2a',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#fff',
    }),
    input: (base) => ({
      ...base,
      color: '#fff',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#fff',
    }),
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <>
      <Helmet>
        <title>{isEdit ? 'Chỉnh sửa phim' : 'Thêm phim mới'} - RoPhim Admin</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isEdit ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-rophim-card rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Thông tin cơ bản</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Tên phim <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Tên gốc
                </label>
                <input
                  type="text"
                  name="originalTitle"
                  value={formData.originalTitle}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Năm phát hành
                </label>
                <input
                  type="number"
                  name="releaseYear"
                  value={formData.releaseYear}
                  onChange={handleChange}
                  className="input-field"
                  min="1900"
                  max="2100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Thời lượng (phút)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="input-field"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Loại phim
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="single">Phim lẻ</option>
                  <option value="series">Phim bộ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="ongoing">Đang chiếu</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="upcoming">Sắp chiếu</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Chất lượng
                </label>
                <select
                  name="quality"
                  value={formData.quality}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Chọn chất lượng</option>
                  <option value="HD">HD</option>
                  <option value="Full HD">Full HD</option>
                  <option value="4K UHD">4K UHD</option>
                  <option value="CAM">CAM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Ngôn ngữ
                </label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="VD: Tiếng Việt, Tiếng Anh..."
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="subtitle"
                  checked={formData.subtitle}
                  onChange={handleChange}
                  className="rounded border-rophim-border bg-rophim-bg"
                />
                <span>Có phụ đề</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="rounded border-rophim-border bg-rophim-bg"
                />
                <span>Phim nổi bật</span>
              </label>
            </div>
          </div>

          {/* Relationships */}
          <div className="bg-rophim-card rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Danh mục liên quan</h2>

            <div>
              <label className="block text-sm font-medium mb-2">
                Thể loại
              </label>
              <Select
                isMulti
                options={genres.map(g => ({ value: g.id, label: g.name }))}
                value={genres
                  .filter(g => formData.genreIds.includes(g.id))
                  .map(g => ({ value: g.id, label: g.name }))
                }
                onChange={(selected) => handleMultiSelect('genreIds', selected)}
                styles={selectStyles}
                placeholder="Chọn thể loại..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Quốc gia
              </label>
              <Select
                isMulti
                options={countries.map(c => ({ value: c.id, label: c.name }))}
                value={countries
                  .filter(c => formData.countryIds.includes(c.id))
                  .map(c => ({ value: c.id, label: c.name }))
                }
                onChange={(selected) => handleMultiSelect('countryIds', selected)}
                styles={selectStyles}
                placeholder="Chọn quốc gia..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Diễn viên
              </label>
              <Select
                isMulti
                options={actors.map(a => ({ value: a.id, label: a.name }))}
                value={actors
                  .filter(a => formData.actorIds.includes(a.id))
                  .map(a => ({ value: a.id, label: a.name }))
                }
                onChange={(selected) => handleMultiSelect('actorIds', selected)}
                styles={selectStyles}
                placeholder="Chọn diễn viên..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Đạo diễn
              </label>
              <Select
                isMulti
                options={directors.map(d => ({ value: d.id, label: d.name }))}
                value={directors
                  .filter(d => formData.directorIds.includes(d.id))
                  .map(d => ({ value: d.id, label: d.name }))
                }
                onChange={(selected) => handleMultiSelect('directorIds', selected)}
                styles={selectStyles}
                placeholder="Chọn đạo diễn..."
              />
            </div>
          </div>

          {/* Images */}
          <div className="bg-rophim-card rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Hình ảnh</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Poster URL
                </label>
                <input
                  type="url"
                  name="posterUrl"
                  value={formData.posterUrl}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://example.com/poster.jpg"
                />
                {formData.posterUrl && (
                  <div className="mt-2">
                    <img
                      src={getImageUrl(formData.posterUrl)}
                      alt="Poster preview"
                      className="w-32 h-40 object-cover rounded"
                      onError={(e) => e.target.src = 'https://picsum.photos/200/300?random=1'}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Backdrop URL
                </label>
                <input
                  type="url"
                  name="backdropUrl"
                  value={formData.backdropUrl}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://example.com/backdrop.jpg"
                />
                {formData.backdropUrl && (
                  <div className="mt-2">
                    <img
                      src={getImageUrl(formData.backdropUrl)}
                      alt="Backdrop preview"
                      className="w-32 h-20 object-cover rounded"
                      onError={(e) => e.target.src = 'https://picsum.photos/400/200?random=2'}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Videos */}
          <div className="bg-rophim-card rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Video</h2>

            <div>
              <label className="block text-sm font-medium mb-2">
                Trailer URL (YouTube)
              </label>
              <input
                type="url"
                name="trailerUrl"
                value={formData.trailerUrl}
                onChange={handleChange}
                className="input-field"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            {formData.type === 'single' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://example.com/video.mp4"
                />
              </div>
            )}
          </div>

          {/* Status */}
          <div className="bg-rophim-card rounded-lg p-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="rounded border-rophim-border bg-rophim-bg"
              />
              <span>Kích hoạt</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/movies')}
              className="btn-secondary flex items-center space-x-2"
            >
              <FaTimes size={16} />
              <span>Hủy</span>
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center space-x-2"
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

export default MovieForm