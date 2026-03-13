// src/utils/imageUtils.js

/**
 * Get full image URL with base URL
 * @param {string} path - Image path or URL
 * @returns {string} Full image URL
 */
export const getImageUrl = (path) => {
  if (!path) return ''
  
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // Remove leading slashes
  const cleanPath = path.replace(/^\/+/, '')
  
  // Get base URL from env or use default
  const baseUrl = import.meta.env.VITE_IMAGE_URL || 'http://localhost:5000'
  
  // Construct full URL
  return `${baseUrl}/${cleanPath}`.replace(/\/+/g, '/')
}

/**
 * Get image source with fallback
 * @param {string} url - Image URL
 * @param {string} fallback - Fallback URL
 * @returns {Object} Image props
 */
export const getImageSrc = (url, fallback = '') => {
  const src = url ? getImageUrl(url) : fallback
  
  return {
    src,
    onError: (e) => {
      if (fallback && e.target.src !== fallback) {
        e.target.src = fallback
      }
    }
  }
}

/**
 * Get poster URL for movie
 * @param {string} posterPath - Poster path from movie object
 * @returns {string} Poster URL
 */
export const getPosterUrl = (posterPath) => {
  if (!posterPath) return ''
  return getImageUrl(posterPath)
}

/**
 * Get backdrop URL for movie
 * @param {string} backdropPath - Backdrop path from movie object
 * @returns {string} Backdrop URL
 */
export const getBackdropUrl = (backdropPath) => {
  if (!backdropPath) return ''
  return getImageUrl(backdropPath)
}

/**
 * Get avatar URL for user
 * @param {string} avatarPath - Avatar path from user object
 * @returns {string} Avatar URL
 */
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return ''
  return getImageUrl(avatarPath)
}

/**
 * Get slider image URL
 * @param {string} imagePath - Image path from slider object
 * @returns {string} Slider image URL
 */
export const getSliderImageUrl = (imagePath) => {
  if (!imagePath) return ''
  return getImageUrl(imagePath)
}