const express = require('express');
const router = express.Router();
const adminStatsController = require('../../controllers/admin/adminStatsController');
const { protect, restrictToAdmin } = require('../../middleware/authMiddleware');

router.use(protect, restrictToAdmin);

router.get('/overview', adminStatsController.getOverview);
router.get('/top-movies', adminStatsController.getTopMovies);
router.get('/top-users', adminStatsController.getTopUsers);
router.get('/genres', adminStatsController.getGenreStats);
router.get('/countries', adminStatsController.getCountryStats);
router.get('/years', adminStatsController.getYearStats);
router.get('/daily-views', adminStatsController.getDailyViews);
router.get('/new-users', adminStatsController.getNewUsers);

module.exports = router;