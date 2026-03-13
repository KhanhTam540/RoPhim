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
  getMovies: (params) => api.get('/movies', { params }),
  getMovieBySlug: (slug) => api.get(`/movies/${slug}`),
  getPopularMovies: (limit = 10) => api.get('/movies/popular', { params: { limit } }),
  getLatestMovies: (limit = 10) => api.get('/movies/latest', { params: { limit } }),
  getFeaturedMovies: (limit = 10) => api.get('/movies/featured', { params: { limit } }),
  incrementViewCount: (movieId) => api.post(`/movies/${movieId}/view`),
}

// Genre API
export const genreApi = {
  getGenres: () => api.get('/genres'),
  getGenreBySlug: (slug) => api.get(`/genres/${slug}`),
}

// Country API
export const countryApi = {
  getCountries: () => api.get('/countries'),
  getCountryBySlug: (slug) => api.get(`/countries/${slug}`),
}

// Actor API
export const actorApi = {
  getActors: (params) => api.get('/actors', { params }),
  getActorBySlug: (slug) => api.get(`/actors/${slug}`),
}

// Director API
export const directorApi = {
  getDirectors: (params) => api.get('/directors', { params }),
  getDirectorBySlug: (slug) => api.get(`/directors/${slug}`),
}

// User API
export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.post('/users/change-password', data),
  uploadAvatar: (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// Comment API
export const commentApi = {
  getComments: (movieId, params) => api.get(`/movies/${movieId}/comments`, { params }),
  addComment: (movieId, data) => api.post(`/movies/${movieId}/comments`, data),
  updateComment: (commentId, data) => api.put(`/comments/${commentId}`, data),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
  likeComment: (commentId) => api.post(`/comments/${commentId}/like`),
}

// Rating API
export const ratingApi = {
  rateMovie: (movieId, score) => api.post(`/movies/${movieId}/ratings`, { score }),
  getUserRating: (movieId) => api.get(`/movies/${movieId}/ratings`),
}

// Favorite API
export const favoriteApi = {
  getFavorites: (params) => api.get('/favorites', { params }),
  addFavorite: (movieId) => api.post(`/favorites/${movieId}`),
  removeFavorite: (movieId) => api.delete(`/favorites/${movieId}`),
  checkFavorite: (movieId) => api.get(`/favorites/${movieId}/check`),
}

// History API
export const historyApi = {
  getHistory: (params) => api.get('/history', { params }),
  addToHistory: (data) => api.post('/history', data),
  removeFromHistory: (historyId) => api.delete(`/history/${historyId}`),
  clearHistory: () => api.delete('/history'),
}

// Search API
export const searchApi = {
  search: (params) => api.get('/search', { params }),
  suggest: (keyword) => api.get('/search/suggest', { params: { keyword } }),
}

// Home API
export const homeApi = {
  getHomeData: () => api.get('/home'),
}