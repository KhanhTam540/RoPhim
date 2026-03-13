const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');

router.get('/', genreController.getGenres);
router.get('/:slug', genreController.getGenreBySlug);

module.exports = router;