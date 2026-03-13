const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', favoriteController.getFavorites);
router.post('/:movieId', favoriteController.addFavorite);
router.delete('/:movieId', favoriteController.removeFavorite);
router.get('/:movieId/check', favoriteController.checkFavorite);

module.exports = router;