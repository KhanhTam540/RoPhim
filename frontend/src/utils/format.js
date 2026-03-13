// src/utils/format.js

/**
 * Format rating number safely
 * @param {any} rating - Rating value (could be string, number, null)
 * @returns {string} Formatted rating with 1 decimal place
 */
export const formatRating = (rating) => {
  if (rating === null || rating === undefined) return '0.0'
  const num = typeof rating === 'number' ? rating : parseFloat(rating)
  return isNaN(num) ? '0.0' : num.toFixed(1)
}

/**
 * Format view count (K, M)
 * @param {any} views - View count
 * @returns {string} Formatted view count
 */
export const formatViews = (views) => {
  const num = typeof views === 'number' ? views : parseInt(views)
  if (isNaN(num)) return '0'
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Format duration (minutes to hours and minutes)
 * @param {any} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  const num = typeof minutes === 'number' ? minutes : parseInt(minutes)
  if (isNaN(num) || !minutes) return ''
  
  const hours = Math.floor(num / 60)
  const mins = num % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

/**
 * Format date to Vietnamese format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Get image URL with base
 * @param {string} path - Image path
 * @returns {string} Full image URL
 */
export const getImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/300x450?text=No+Image'
  if (path.startsWith('http')) return path
  
  const baseUrl = import.meta.env.VITE_IMAGE_URL || 'http://localhost:5000'
  return `${baseUrl}/${path}`
}

/**
 * Safe parse number
 * @param {any} value - Value to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} Parsed number
 */
export const safeParseNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined) return defaultValue
  const num = typeof value === 'number' ? value : parseFloat(value)
  return isNaN(num) ? defaultValue : num
}