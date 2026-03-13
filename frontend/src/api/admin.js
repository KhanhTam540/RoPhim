// src/api/admin.js
import api from './api'

// Auth Admin
export const adminAuthApi = {
  login: (data) => api.post('/admin/auth/login', data),
  getMe: () => api.get('/admin/auth/me'),
  changePassword: (data) => api.post('/admin/auth/change-password', data),
}

// Movie Management
export const adminMovieApi = {
  getMovies: (params) => api.get('/admin/movies', { params }),
  getMovieById: (id) => api.get(`/admin/movies/${id}`),
  createMovie: (data) => {
    // Gửi trực tiếp object, không dùng FormData
    return api.post('/admin/movies', data)
  },
  updateMovie: (id, data) => {
    return api.put(`/admin/movies/${id}`, data)
  },
  deleteMovie: (id) => api.delete(`/admin/movies/${id}`),
  toggleStatus: (id, isActive) => api.patch(`/admin/movies/${id}/toggle-status`, { isActive }),
  
  // Episodes
  getEpisodes: (movieId) => api.get(`/admin/movies/${movieId}/episodes`),
  addEpisode: (movieId, data) => api.post(`/admin/movies/${movieId}/episodes`, data),
  updateEpisode: (episodeId, data) => api.put(`/admin/episodes/${episodeId}`, data),
  deleteEpisode: (episodeId) => api.delete(`/admin/episodes/${episodeId}`),
}

// Genre Management
export const adminGenreApi = {
  getGenres: (params) => api.get('/admin/genres', { params }),
  getGenreById: (id) => api.get(`/admin/genres/${id}`),
  createGenre: (data) => api.post('/admin/genres', data),
  updateGenre: (id, data) => api.put(`/admin/genres/${id}`, data),
  deleteGenre: (id) => api.delete(`/admin/genres/${id}`),
  toggleStatus: (id, isActive) => api.patch(`/admin/genres/${id}/toggle-status`, { isActive }),
}

// Country Management
export const adminCountryApi = {
  getCountries: (params) => api.get('/admin/countries', { params }),
  getCountryById: (id) => api.get(`/admin/countries/${id}`),
  createCountry: (data) => api.post('/admin/countries', data),
  updateCountry: (id, data) => api.put(`/admin/countries/${id}`, data),
  deleteCountry: (id) => api.delete(`/admin/countries/${id}`),
  toggleStatus: (id, isActive) => api.patch(`/admin/countries/${id}/toggle-status`, { isActive }),
}

// Actor Management
export const adminActorApi = {
  getActors: (params) => api.get('/admin/actors', { params }),
  getActorById: (id) => api.get(`/admin/actors/${id}`),
  createActor: (data) => {
    return api.post('/admin/actors', data)
  },
  updateActor: (id, data) => {
    return api.put(`/admin/actors/${id}`, data)
  },
  deleteActor: (id) => api.delete(`/admin/actors/${id}`),
  toggleStatus: (id, isActive) => api.patch(`/admin/actors/${id}/toggle-status`, { isActive }),
}

// Director Management
export const adminDirectorApi = {
  getDirectors: (params) => api.get('/admin/directors', { params }),
  getDirectorById: (id) => api.get(`/admin/directors/${id}`),
  createDirector: (data) => {
    return api.post('/admin/directors', data)
  },
  updateDirector: (id, data) => {
    return api.put(`/admin/directors/${id}`, data)
  },
  deleteDirector: (id) => api.delete(`/admin/directors/${id}`),
  toggleStatus: (id, isActive) => api.patch(`/admin/directors/${id}/toggle-status`, { isActive }),
}

// User Management
export const adminUserApi = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleStatus: (id, isActive) => api.patch(`/admin/users/${id}/toggle-status`, { isActive }),
  resetPassword: (id, newPassword) => api.post(`/admin/users/${id}/reset-password`, { newPassword }),
}

// Slider Management
export const adminSliderApi = {
  getSliders: () => api.get('/admin/sliders'),
  getSliderById: (id) => api.get(`/admin/sliders/${id}`),
  createSlider: (data) => {
    return api.post('/admin/sliders', data)
  },
  updateSlider: (id, data) => {
    return api.put(`/admin/sliders/${id}`, data)
  },
  deleteSlider: (id) => api.delete(`/admin/sliders/${id}`),
  reorderSliders: (sliders) => api.post('/admin/sliders/reorder', { sliders }),
  toggleStatus: (id, isActive) => api.patch(`/admin/sliders/${id}/toggle-status`, { isActive }),
}

// Stats API
export const adminStatsApi = {
  getOverview: () => api.get('/admin/stats/overview'),
  getTopMovies: (limit = 10) => api.get('/admin/stats/top-movies', { params: { limit } }),
  getTopUsers: (limit = 10) => api.get('/admin/stats/top-users', { params: { limit } }),
  getGenreStats: () => api.get('/admin/stats/genres'),
  getCountryStats: () => api.get('/admin/stats/countries'),
  getYearStats: () => api.get('/admin/stats/years'),
  getDailyViews: (days = 30) => api.get('/admin/stats/daily-views', { params: { days } }),
  getNewUsers: (days = 30) => api.get('/admin/stats/new-users', { params: { days } }),
}