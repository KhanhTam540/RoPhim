const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminGenreController = require('../../controllers/admin/adminGenreController');
const { protect, restrictToAdmin } = require('../../middleware/authMiddleware');
const validate = require('../../middleware/validateMiddleware');

router.use(protect, restrictToAdmin);

const genreValidation = [
  body('name').notEmpty().withMessage('Tên thể loại không được để trống'),
  body('description').optional()
];

router.get('/', adminGenreController.getAllGenres);
router.get('/:genreId', adminGenreController.getGenreById);
router.post('/', genreValidation, validate, adminGenreController.createGenre);
router.put('/:genreId', genreValidation, validate, adminGenreController.updateGenre);
router.delete('/:genreId', adminGenreController.deleteGenre);
router.patch('/:genreId/toggle-status', adminGenreController.toggleGenreStatus);

module.exports = router;