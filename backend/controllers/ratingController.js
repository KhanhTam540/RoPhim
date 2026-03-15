// backend/controllers/ratingController.js
const { Rating, Movie, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/responseHandler');

// Đánh giá phim
const rateMovie = catchAsync(async (req, res, next) => {
  const { movieId } = req.params;
  const { score } = req.body;

  console.log('📝 Rating movie:', { movieId, score, userId: req.user?.id });

  if (score < 1 || score > 5) {
    return next(new AppError('Điểm đánh giá phải từ 1-5', 400));
  }

  const movie = await Movie.findByPk(movieId);
  if (!movie) {
    return next(new AppError('Không tìm thấy phim', 404));
  }

  // Tìm đánh giá cũ - SỬA: dùng user_id, movie_id
  let rating = await Rating.findOne({
    where: { 
      user_id: req.user.id, 
      movie_id: movieId 
    }
  });

  if (rating) {
    // Cập nhật
    rating.score = score;
    await rating.save();
  } else {
    // Tạo mới - SỬA: dùng user_id, movie_id
    rating = await Rating.create({
      user_id: req.user.id,
      movie_id: movieId,
      score
    });
  }

  // Cập nhật rating trung bình của phim - SỬA: dùng movie_id
  const stats = await Rating.findAll({
    where: { movie_id: movieId },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('score')), 'avgRating'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    raw: true
  });

  const avgRating = stats[0]?.avgRating || 0;
  const count = stats[0]?.count || 0;

  // SỬA: dùng rating_average, rating_count
  movie.rating_average = Math.round(avgRating * 10) / 10;
  movie.rating_count = count;
  await movie.save();

  successResponse(res, {
    score: rating.score
  }, 'Đánh giá thành công');
});

// Lấy đánh giá của user
const getUserRating = catchAsync(async (req, res, next) => {
  const { movieId } = req.params;

  console.log('📝 Getting user rating:', { movieId, userId: req.user?.id });

  // Kiểm tra user đã đăng nhập chưa
  if (!req.user) {
    return successResponse(res, { score: null });
  }

  // SỬA: dùng user_id, movie_id
  const rating = await Rating.findOne({
    where: { 
      user_id: req.user.id, 
      movie_id: movieId 
    }
  });

  successResponse(res, {
    score: rating ? rating.score : null
  });
});

module.exports = {
  rateMovie,
  getUserRating
};