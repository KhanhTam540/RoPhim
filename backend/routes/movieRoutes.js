const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const commentRoutes = require('./commentRoutes');
const ratingRoutes = require('./ratingRoutes');

// Nested routes
router.use('/:movieId/comments', commentRoutes);
router.use('/:movieId/ratings', ratingRoutes);

// Public routes
router.get('/', movieController.getMovies);
router.get('/popular', movieController.getPopularMovies);
router.get('/latest', movieController.getLatestMovies);
router.get('/featured', movieController.getFeaturedMovies);
router.get('/:slug', movieController.getMovieDetail);

// Protected routes
const { protect } = require('../middleware/authMiddleware');
router.post('/:movieId/view', protect, movieController.incrementViewCount);

module.exports = router;