// src/api/auth.js
import api from './api'

export const authApi = {
  /**
   * Đăng ký tài khoản mới
   * @param {Object} data - { username, email, password, fullName }
   */
  register: (data) => api.post('/auth/register', data),

  /**
   * Đăng nhập
   * @param {Object} data - { username, password }
   */
  login: (data) => api.post('/auth/login', data),

  /**
   * Đăng xuất
   */
  logout: () => api.post('/auth/logout'),

  /**
   * Lấy thông tin user hiện tại
   */
  getMe: () => api.get('/auth/me'),

  /**
   * Quên mật khẩu
   * @param {string} email 
   */
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  /**
   * Reset mật khẩu
   * @param {string} token 
   * @param {string} password 
   */
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
}

// Movie API
export const movieApi = {
  /**
   * Lấy danh sách phim với các bộ lọc
   * @param {Object} params - { page, limit, genre, country, year, type, quality, status, sort, search }
   */
  getMovies: (params) => api.get('/movies', { params }),

  /**
   * Lấy chi tiết phim theo slug
   * @param {string} slug 
   */
  getMovieBySlug: (slug) => api.get(`/movies/${slug}`),

  /**
   * Lấy phim hot (nhiều lượt xem)
   * @param {number} limit 
   */
  getPopularMovies: (limit = 10) => api.get('/movies/popular', { params: { limit } }),

  /**
   * Lấy phim mới nhất
   * @param {number} limit 
   */
  getLatestMovies: (limit = 10) => api.get('/movies/latest', { params: { limit } }),

  /**
   * Lấy phim đề cử
   * @param {number} limit 
   */
  getFeaturedMovies: (limit = 10) => api.get('/movies/featured', { params: { limit } }),

  /**
   * Tăng lượt xem cho phim
   * @param {number} movieId 
   */
  incrementViewCount: (movieId) => api.post(`/movies/${movieId}/view`),
}

// Genre API
export const genreApi = {
  /**
   * Lấy danh sách thể loại
   */
  getGenres: () => api.get('/genres'),

  /**
   * Lấy chi tiết thể loại theo slug
   * @param {string} slug 
   */
  getGenreBySlug: (slug) => api.get(`/genres/${slug}`),
}

// Country API
export const countryApi = {
  /**
   * Lấy danh sách quốc gia
   */
  getCountries: () => api.get('/countries'),

  /**
   * Lấy chi tiết quốc gia theo slug
   * @param {string} slug 
   */
  getCountryBySlug: (slug) => api.get(`/countries/${slug}`),
}

// Actor API
export const actorApi = {
  /**
   * Lấy danh sách diễn viên
   * @param {Object} params - { page, limit, search }
   */
  getActors: (params) => api.get('/actors', { params }),

  /**
   * Lấy chi tiết diễn viên theo slug
   * @param {string} slug 
   */
  getActorBySlug: (slug) => api.get(`/actors/${slug}`),
}

// Director API
export const directorApi = {
  /**
   * Lấy danh sách đạo diễn
   * @param {Object} params - { page, limit, search }
   */
  getDirectors: (params) => api.get('/directors', { params }),

  /**
   * Lấy chi tiết đạo diễn theo slug
   * @param {string} slug 
   */
  getDirectorBySlug: (slug) => api.get(`/directors/${slug}`),
}

// User API
export const userApi = {
  /**
   * Lấy thông tin profile của user hiện tại
   */
  getProfile: () => api.get('/users/profile'),

  /**
   * Cập nhật profile
   * @param {Object} data - { fullName, preferences }
   */
  updateProfile: (data) => api.put('/users/profile', data),

  /**
   * Đổi mật khẩu
   * @param {Object} data - { currentPassword, newPassword }
   */
  changePassword: (data) => api.post('/users/change-password', data),

  /**
   * Upload avatar
   * @param {File} file 
   */
  uploadAvatar: (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  /**
   * Lấy lịch sử xem của user
   * @param {Object} params - { page, limit }
   */
  getHistory: (params) => api.get('/users/history', { params }),

  /**
   * Lấy danh sách yêu thích của user
   * @param {Object} params - { page, limit }
   */
  getFavorites: (params) => api.get('/users/favorites', { params }),
}

// Comment API
export const commentApi = {
  /**
   * Lấy bình luận của phim
   * @param {number} movieId 
   * @param {Object} params - { page, limit }
   */
  getComments: (movieId, params) => api.get(`/movies/${movieId}/comments`, { params }),

  /**
   * Thêm bình luận mới
   * @param {number} movieId 
   * @param {Object} data - { content, parentId }
   */
  addComment: (movieId, data) => api.post(`/movies/${movieId}/comments`, data),

  /**
   * Cập nhật bình luận
   * @param {number} commentId 
   * @param {Object} data - { content }
   */
  updateComment: (commentId, data) => api.put(`/comments/${commentId}`, data),

  /**
   * Xóa bình luận
   * @param {number} commentId 
   */
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),

  /**
   * Thích/bỏ thích bình luận
   * @param {number} commentId 
   */
  likeComment: (commentId) => api.post(`/comments/${commentId}/like`),
}

// Rating API
export const ratingApi = {
  /**
   * Đánh giá phim
   * @param {number} movieId 
   * @param {number} score - 1-5
   */
  rateMovie: (movieId, score) => api.post(`/movies/${movieId}/ratings`, { score }),

  /**
   * Lấy đánh giá của user hiện tại cho phim
   * @param {number} movieId 
   */
  getUserRating: (movieId) => api.get(`/movies/${movieId}/ratings`),
}

// Favorite API
export const favoriteApi = {
  /**
   * Lấy danh sách yêu thích
   * @param {Object} params - { page, limit }
   */
  getFavorites: (params) => api.get('/favorites', { params }),

  /**
   * Thêm phim vào yêu thích
   * @param {number} movieId 
   */
  addFavorite: (movieId) => api.post(`/favorites/${movieId}`),

  /**
   * Xóa phim khỏi yêu thích
   * @param {number} movieId 
   */
  removeFavorite: (movieId) => api.delete(`/favorites/${movieId}`),

  /**
   * Kiểm tra phim đã được yêu thích chưa
   * @param {number} movieId 
   */
  checkFavorite: (movieId) => api.get(`/favorites/${movieId}/check`),
}

// History API - SỬA: Hoàn chỉnh với debounce và upsert
export const historyApi = {
  /**
   * Lấy lịch sử xem
   * @param {Object} params - { page, limit }
   */
  getHistory: (params) => api.get('/history', { params }),

  /**
   * Thêm/cập nhật lịch sử xem - Tự động upsert (thêm mới nếu chưa có, cập nhật nếu đã có)
   * @param {Object} data - { movieId, episodeId, progress, completed }
   */
  addToHistory: (data) => api.post('/history', data),

  /**
   * Xóa một item khỏi lịch sử
   * @param {number} historyId 
   */
  removeFromHistory: (historyId) => api.delete(`/history/${historyId}`),

  /**
   * Xóa toàn bộ lịch sử
   */
  clearHistory: () => api.delete('/history'),
}

// Search API
export const searchApi = {
  /**
   * Tìm kiếm tổng hợp
   * @param {Object} params - { keyword, page, limit }
   */
  search: (params) => api.get('/search', { params }),

  /**
   * Gợi ý tìm kiếm
   * @param {string} keyword 
   */
  suggest: (keyword) => api.get('/search/suggest', { params: { keyword } }),
}

// Home API
export const homeApi = {
  /**
   * Lấy dữ liệu trang chủ (sliders, movies...)
   */
  getHomeData: () => api.get('/home'),
}