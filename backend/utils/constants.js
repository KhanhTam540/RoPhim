module.exports = {
  // User roles
  USER_ROLES: {
    USER: 'user',
    ADMIN: 'admin'
  },

  // Movie types
  MOVIE_TYPES: {
    SINGLE: 'single',
    SERIES: 'series'
  },

  // Movie status
  MOVIE_STATUS: {
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
    UPCOMING: 'upcoming'
  },

  // Quality options
  QUALITY: {
    HD: 'HD',
    FULL_HD: 'Full HD',
    UHD_4K: '4K UHD',
    CAM: 'CAM'
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },

  // Cache TTL (seconds)
  CACHE_TTL: {
    SHORT: 300,      // 5 minutes
    MEDIUM: 1800,    // 30 minutes
    LONG: 3600,      // 1 hour
    VERY_LONG: 86400 // 24 hours
  },

  // File upload
  UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  }
};