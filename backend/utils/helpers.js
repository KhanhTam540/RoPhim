const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Format movie response with full URLs
 */
const formatMovieResponse = (movie, req) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const movieData = movie.toJSON ? movie.toJSON() : movie;

  if (movieData.poster && !movieData.poster.startsWith('http')) {
    movieData.poster = `${baseUrl}/${movieData.poster}`;
  }
  if (movieData.backdrop && !movieData.backdrop.startsWith('http')) {
    movieData.backdrop = `${baseUrl}/${movieData.backdrop}`;
  }

  return movieData;
};

/**
 * Format array of movies
 */
const formatMoviesResponse = (movies, req) => {
  return movies.map(movie => formatMovieResponse(movie, req));
};

/**
 * Get pagination info
 */
const getPagination = (page, limit, total) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  return {
    page: pageNum,
    limit: limitNum,
    total,
    pages: Math.ceil(total / limitNum),
    hasNext: pageNum < Math.ceil(total / limitNum),
    hasPrev: pageNum > 1
  };
};

/**
 * Delete file safely
 */
const deleteFile = (filePath) => {
  if (!filePath) return false;

  const fullPath = path.join(__dirname, '../../', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return true;
  }
  return false;
};

module.exports = {
  generateToken,
  verifyToken,
  formatMovieResponse,
  formatMoviesResponse,
  getPagination,
  deleteFile
};