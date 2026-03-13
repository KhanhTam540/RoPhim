const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminMovieController = require('../../controllers/admin/adminMovieController');
const { protect, restrictToAdmin } = require('../../middleware/authMiddleware');
const { uploadFields } = require('../../middleware/uploadMiddleware');
const validate = require('../../middleware/validateMiddleware');

router.use(protect, restrictToAdmin);

const movieValidation = [
  body('title').notEmpty().withMessage('Tên phim không được để trống'),
  body('type').isIn(['single', 'series']).withMessage('Loại phim không hợp lệ'),
  body('status').optional().isIn(['ongoing', 'completed', 'upcoming'])
];

router.get('/', adminMovieController.getAllMovies);
router.get('/:movieId', adminMovieController.getMovieById);
router.post('/', uploadFields, movieValidation, validate, adminMovieController.createMovie);
router.put('/:movieId', uploadFields, movieValidation, validate, adminMovieController.updateMovie);
router.delete('/:movieId', adminMovieController.deleteMovie);
router.patch('/:movieId/toggle-status', adminMovieController.toggleMovieStatus);

// Episode routes
router.get('/:movieId/episodes', adminMovieController.getEpisodes);
router.post('/:movieId/episodes', adminMovieController.addEpisode);
router.put('/episodes/:episodeId', adminMovieController.updateEpisode);
router.delete('/episodes/:episodeId', adminMovieController.deleteEpisode);

module.exports = router;