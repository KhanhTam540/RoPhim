// backend/controllers/genreController.js
const { Genre } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/responseHandler');
const AppError = require('../utils/AppError');

// Lấy danh sách thể loại
const getGenres = catchAsync(async (req, res) => {
  const genres = await Genre.findAll({
    where: { is_active: true },  // SỬA: is_active thay vì isActive
    attributes: ['id', 'name', 'slug', 'description'],
    order: [['name', 'ASC']]
  });

  successResponse(res, { genres });
});

// Lấy chi tiết thể loại theo slug
const getGenreBySlug = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const genre = await Genre.findOne({
    where: { slug, is_active: true }  // SỬA: is_active thay vì isActive
  });

  if (!genre) {
    return next(new AppError('Không tìm thấy thể loại', 404));
  }

  successResponse(res, { genre });
});

module.exports = {
  getGenres,
  getGenreBySlug
};