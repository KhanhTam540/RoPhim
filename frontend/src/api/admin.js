// src/api/admin.js
import api from './api'

// ==================== AUTH ADMIN ====================
export const adminAuthApi = {
  login: (data) => api.post('/admin/auth/login', data),
  getMe: () => api.get('/admin/auth/me'),
  changePassword: (data) => api.post('/admin/auth/change-password', data),
}

// ==================== MOVIE MANAGEMENT ====================
export const adminMovieApi = {
  getMovies: (params) => api.get('/admin/movies', { params }),
  getMovieById: (id) => api.get(`/admin/movies/${id}`),
  createMovie: (data) => api.post('/admin/movies', data),
  updateMovie: (id, data) => api.put(`/admin/movies/${id}`, data),
  deleteMovie: (id) => api.delete(`/admin/movies/${id}`),
  toggleStatus: (id, isActive) => api.patch(`/admin/movies/${id}/toggle-status`, { isActive }),
  getEpisodes: (movieId) => api.get(`/admin/movies/${movieId}/episodes`),
  addEpisode: (movieId, data) => api.post(`/admin/movies/${movieId}/episodes`, data),
  updateEpisode: (episodeId, data) => api.put(`/admin/episodes/${episodeId}`, data),
  deleteEpisode: (episodeId) => api.delete(`/admin/episodes/${episodeId}`),
}

// ==================== GENRE MANAGEMENT ====================
export const adminGenreApi = {
  getGenres: (params) => api.get('/admin/genres', { params }),
  getGenreById: (id) => api.get(`/admin/genres/${id}`),
  createGenre: (data) => api.post('/admin/genres', data),
  updateGenre: (id, data) => api.put(`/admin/genres/${id}`, data),
  deleteGenre: (id) => api.delete(`/admin/genres/${id}`),
  toggleStatus: (id, isActive) => api.patch(`/admin/genres/${id}/toggle-status`, { isActive }),
}

// ==================== COUNTRY MANAGEMENT ====================
export const adminCountryApi = {
  getCountries: (params) => api.get('/admin/countries', { params }),
  getCountryById: (id) => api.get(`/admin/countries/${id}`),
  createCountry: (data) => api.post('/admin/countries', data),
  updateCountry: (id, data) => api.put(`/admin/countries/${id}`, data),
  deleteCountry: (id) => api.delete(`/admin/countries/${id}`),
  toggleStatus: (id, isActive) => api.patch(`/admin/countries/${id}/toggle-status`, { isActive }),
}

// ==================== ACTOR MANAGEMENT ====================
export const adminActorApi = {
  getActors: (params) => api.get('/admin/actors', { params }),
  getActorById: (id) => api.get(`/admin/actors/${id}`),
  createActor: (data) => api.post('/admin/actors', data),
  updateActor: (id, data) => api.put(`/admin/actors/${id}`, data),
  deleteActor: (id) => api.delete(`/admin/actors/${id}`),
  toggleStatus: (id, isActive) => api.patch(`/admin/actors/${id}/toggle-status`, { isActive }),
}

// ==================== DIRECTOR MANAGEMENT ====================
export const adminDirectorApi = {
  getDirectors: (params) => api.get('/admin/directors', { params }),
  getDirectorById: (id) => api.get(`/admin/directors/${id}`),
  createDirector: (data) => api.post('/admin/directors', data),
  updateDirector: (id, data) => api.put(`/admin/directors/${id}`, data),
  deleteDirector: (id) => api.delete(`/admin/directors/${id}`),
  toggleStatus: (id, isActive) => api.patch(`/admin/directors/${id}/toggle-status`, { isActive }),
}

// ==================== USER MANAGEMENT ====================
export const adminUserApi = {
  getUsers: async (params) => {
    try {
      console.log('📦 API Call - getUsers with params:', params)
      const response = await api.get('/admin/users', { params })
      console.log('📦 API Response - getUsers:', response)
      return response
    } catch (error) {
      console.error('❌ API Error - getUsers:', error)
      throw error
    }
  },
  getUserById: async (id) => {
    try {
      if (!id || id === 'undefined' || id === 'create') {
        throw new Error('ID người dùng không hợp lệ')
      }
      console.log(`📦 Fetching user with ID: ${id}`)
      const response = await api.get(`/admin/users/${id}`)
      console.log('✅ User response:', response)
      return response
    } catch (error) {
      console.error('❌ Error in getUserById:', error)
      throw error
    }
  },
  createUser: async (data) => {
    try {
      console.log('📦 Creating user with data:', data)
      const response = await api.post('/admin/users', data)
      console.log('✅ Create user response:', response)
      return response
    } catch (error) {
      console.error('❌ Error in createUser:', error)
      throw error
    }
  },
  updateUser: async (id, data) => {
    try {
      if (!id || id === 'undefined') {
        throw new Error('ID người dùng không hợp lệ')
      }
      console.log(`📦 Updating user ${id} with data:`, data)
      const response = await api.put(`/admin/users/${id}`, data)
      console.log('✅ Update user response:', response)
      return response
    } catch (error) {
      console.error('❌ Error in updateUser:', error)
      throw error
    }
  },
  deleteUser: async (id) => {
    try {
      if (!id || id === 'undefined') {
        throw new Error('ID người dùng không hợp lệ')
      }
      console.log(`📦 Deleting user ${id}`)
      const response = await api.delete(`/admin/users/${id}`)
      console.log('✅ Delete user response:', response)
      return response
    } catch (error) {
      console.error('❌ Error in deleteUser:', error)
      throw error
    }
  },
  toggleStatus: async (id, isActive) => {
    try {
      if (!id || id === 'undefined') {
        throw new Error('ID người dùng không hợp lệ')
      }
      console.log(`📦 Toggling status for user ${id} to:`, isActive)
      const response = await api.patch(`/admin/users/${id}/toggle-status`, { isActive })
      console.log('✅ Toggle status response:', response)
      return response
    } catch (error) {
      console.error('❌ Error in toggleStatus:', error)
      throw error
    }
  },
  resetPassword: async (id, newPassword) => {
    try {
      if (!id || id === 'undefined') {
        throw new Error('ID người dùng không hợp lệ')
      }
      console.log(`📦 Resetting password for user ${id}`)
      const response = await api.post(`/admin/users/${id}/reset-password`, { newPassword })
      console.log('✅ Reset password response:', response)
      return response
    } catch (error) {
      console.error('❌ Error in resetPassword:', error)
      throw error
    }
  },
}

// ==================== SLIDER MANAGEMENT ====================
export const adminSliderApi = {
  /**
   * Lấy danh sách slider
   */
  getSliders: async () => {
    try {
      console.log('📦 Fetching sliders')
      const response = await api.get('/admin/sliders')
      console.log('✅ Sliders response:', response)
      return response
    } catch (error) {
      console.error('❌ Error in getSliders:', error)
      throw error
    }
  },

  /**
   * Lấy chi tiết slider theo ID
   * @param {number|string} id - Slider ID
   */
  getSliderById: async (id) => {
    try {
      if (!id || id === 'undefined') {
        throw new Error('ID slider không hợp lệ')
      }
      
      console.log(`📦 Fetching slider with ID: ${id}`)
      const response = await api.get(`/admin/sliders/${id}`)
      console.log('✅ Slider response:', response)
      return response
    } catch (error) {
      console.error('❌ Error in getSliderById:', error)
      throw error
    }
  },

  /**
   * Tạo slider mới
   * @param {Object} data - Dữ liệu slider
   */
  createSlider: async (data) => {
    try {
      console.log('📦 Creating slider with data:', data)
      
      const response = await api.post('/admin/sliders', data)
      console.log('✅ Create slider response:', response)
      return response
    } catch (error) {
      console.error('❌ Error in createSlider:', error)
      throw error
    }
  },

  /**
   * Cập nhật slider
   * @param {number|string} id - Slider ID
   * @param {Object} data - Dữ liệu slider
   */
  updateSlider: async (id, data) => {
    try {
      if (!id || id === 'undefined') {
        throw new Error('ID slider không hợp lệ')
      }
      
      console.log(`📦 Updating slider ${id} with data:`, data)
      
      const response = await api.put(`/admin/sliders/${id}`, data)
      console.log('✅ Update slider response:', response)
      return response
    } catch (error) {
      console.error('❌ Error in updateSlider:', error)
      throw error
    }
  },

  /**
   * Xóa slider
   * @param {number|string} id - Slider ID
   */
  deleteSlider: async (id) => {
    try {
      if (!id || id === 'undefined') {
        throw new Error('ID slider không hợp lệ')
      }
      
      console.log(`📦 Deleting slider ${id}`)
      const response = await api.delete(`/admin/sliders/${id}`)
      console.log('✅ Delete slider response:', response)
      return response
    } catch (error) {
      console.error('❌ Error in deleteSlider:', error)
      throw error
    }
  },

  /**
   * Sắp xếp thứ tự slider
   * @param {Array} sliders - Mảng các slider với id và order
   */
  reorderSliders: async (sliders) => {
    try {
      console.log('📦 Reordering sliders:', sliders)
      const response = await api.post('/admin/sliders/reorder', { sliders })
      console.log('✅ Reorder response:', response)
      return response
    } catch (error) {
      console.error('❌ Error in reorderSliders:', error)
      throw error
    }
  },

  /**
   * Bật/tắt trạng thái slider
   * @param {number|string} id - Slider ID
   * @param {boolean} isActive - Trạng thái mới
   */
  toggleStatus: async (id, isActive) => {
    try {
      if (!id || id === 'undefined') {
        throw new Error('ID slider không hợp lệ')
      }
      
      console.log(`📦 Toggling status for slider ${id} to:`, isActive)
      const response = await api.patch(`/admin/sliders/${id}/toggle-status`, { isActive })
      console.log('✅ Toggle status response:', response)
      return response
    } catch (error) {
      console.error('❌ Error in toggleStatus:', error)
      throw error
    }
  },
}

// ==================== STATISTICS ====================
export const adminStatsApi = {
  getOverview: () => api.get('/admin/stats/overview'),
  getTopMovies: (limit = 10) => api.get('/admin/stats/top-movies', { params: { limit } }),
  getTopUsers: (limit = 10) => api.get('/admin/stats/top-users', { params: { limit } }),
  getGenreStats: () => api.get('/admin/stats/genres'),
  getCountryStats: () => api.get('/admin/stats/countries'),
  getYearStats: () => api.get('/admin/stats/years'),
  getDailyViews: (days = 30) => api.get('/admin/stats/daily-views', { params: { days } }),
  getNewUsers: (days = 30) => api.get('/admin/stats/new-users', { params: { days } }),
  getDashboardStats: () => api.get('/admin/stats/dashboard'),
}