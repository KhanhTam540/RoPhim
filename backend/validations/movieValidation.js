const { body } = require('express-validator');

const createMovieValidation = [
  body('title')
    .notEmpty()
    .withMessage('Tên phim không được để trống')
    .isLength({ max: 255 })
    .withMessage('Tên phim không được quá 255 ký tự'),
  body('description')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Mô tả không được quá 5000 ký tự'),
  body('releaseYear')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 5 })
    .withMessage('Năm phát hành không hợp lệ'),
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Thời lượng phải là số dương'),
  body('type')
    .optional()
    .isIn(['single', 'series'])
    .withMessage('Loại phim không hợp lệ'),
  body('status')
    .optional()
    .isIn(['ongoing', 'completed', 'upcoming'])
    .withMessage('Trạng thái không hợp lệ'),
  body('quality')
    .optional()
    .isIn(['HD', 'Full HD', '4K UHD', 'CAM'])
    .withMessage('Chất lượng không hợp lệ'),
  body('genreIds')
    .optional()
    .isArray()
    .withMessage('Thể loại phải là mảng'),
  body('countryIds')
    .optional()
    .isArray()
    .withMessage('Quốc gia phải là mảng'),
  body('actorIds')
    .optional()
    .isArray()
    .withMessage('Diễn viên phải là mảng'),
  body('directorIds')
    .optional()
    .isArray()
    .withMessage('Đạo diễn phải là mảng')
];

const updateMovieValidation = [
  body('title')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Tên phim không được quá 255 ký tự'),
  body('description')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Mô tả không được quá 5000 ký tự'),
  body('releaseYear')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 5 })
    .withMessage('Năm phát hành không hợp lệ'),
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Thời lượng phải là số dương'),
  body('type')
    .optional()
    .isIn(['single', 'series'])
    .withMessage('Loại phim không hợp lệ'),
  body('status')
    .optional()
    .isIn(['ongoing', 'completed', 'upcoming'])
    .withMessage('Trạng thái không hợp lệ')
];

module.exports = {
  createMovieValidation,
  updateMovieValidation
};