const { Rating, Movie, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/responseHandler');

// Đánh giá phim
const rateMovie = catchAsync(async (req, res, next) => {
  const { movieId } = req.params;
  const { score } = req.body;

  if (score < 1 || score > 5) {
    return next(new AppError('Điểm đánh giá phải từ 1-5', 400));
  }

  const movie = await Movie.findByPk(movieId);
  if (!movie) {
    return next(new AppError('Không tìm thấy phim', 404));
  }

  // Tìm đánh giá cũ
  let rating = await Rating.findOne({
    where: { userId: req.user.id, movieId }
  });

  if (rating) {
    // Cập nhật
    rating.score = score;
    await rating.save();
  } else {
    // Tạo mới
    rating = await Rating.create({
      userId: req.user.id,
      movieId,
      score
    });
  }

  // Cập nhật rating trung bình của phim
  const stats = await Rating.findAll({
    where: { movieId },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('score')), 'avgRating'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    raw: true
  });

  const avgRating = stats[0]?.avgRating || 0;
  const count = stats[0]?.count || 0;

  movie.ratingAverage = Math.round(avgRating * 10) / 10;
  movie.ratingCount = count;
  await movie.save();

  successResponse(res, {
    score: rating.score
  }, 'Đánh giá thành công');
});

// Lấy đánh giá của user
const getUserRating = catchAsync(async (req, res) => {
  const { movieId } = req.params;

  const rating = await Rating.findOne({
    where: { userId: req.user.id, movieId }
  });

  successResponse(res, {
    score: rating ? rating.score : null
  });
});

module.exports = {
  rateMovie,
  getUserRating
};