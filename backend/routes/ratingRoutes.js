const express = require('express');
const router = express.Router({ mergeParams: true });
const { body } = require('express-validator');
const ratingController = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const ratingValidation = [
  body('score').isInt({ min: 1, max: 5 }).withMessage('Điểm đánh giá phải từ 1-5')
];

router.get('/', ratingController.getUserRating);
router.post('/', protect, ratingValidation, validate, ratingController.rateMovie);

module.exports = router;