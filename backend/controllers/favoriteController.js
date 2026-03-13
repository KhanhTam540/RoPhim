const { Favorite, Movie } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/responseHandler');
const { formatMoviesResponse, getPagination } = require('../utils/helpers');

// Lấy danh sách yêu thích
const getFavorites = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const { count, rows: favorites } = await Favorite.findAndCountAll({
    where: { userId: req.user.id },
    include: [
      { 
        model: Movie, 
        as: 'movie',
        where: { isActive: true },
        include: ['genres']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    distinct: true
  });

  const movies = favorites.map(f => f.movie).filter(m => m);
  const pagination = getPagination(page, limit, count);

  successResponse(res, {
    movies: formatMoviesResponse(movies, req),
    pagination
  });
});

// Thêm vào yêu thích
const addFavorite = catchAsync(async (req, res, next) => {
  const { movieId } = req.params;

  const movie = await Movie.findByPk(movieId);
  if (!movie) {
    return next(new AppError('Không tìm thấy phim', 404));
  }

  const existing = await Favorite.findOne({
    where: { userId: req.user.id, movieId }
  });

  if (existing) {
    return next(new AppError('Phim đã có trong danh sách yêu thích', 400));
  }

  await Favorite.create({
    userId: req.user.id,
    movieId
  });

  successResponse(res, null, 'Đã thêm vào danh sách yêu thích', 201);
});

// Xóa khỏi yêu thích
const removeFavorite = catchAsync(async (req, res, next) => {
  const { movieId } = req.params;

  const result = await Favorite.destroy({
    where: { userId: req.user.id, movieId }
  });

  if (result === 0) {
    return next(new AppError('Không tìm thấy phim trong danh sách yêu thích', 404));
  }

  successResponse(res, null, 'Đã xóa khỏi danh sách yêu thích');
});

// Kiểm tra trạng thái yêu thích
const checkFavorite = catchAsync(async (req, res) => {
  const { movieId } = req.params;

  const favorite = await Favorite.findOne({
    where: { userId: req.user.id, movieId }
  });

  successResponse(res, {
    isFavorite: !!favorite
  });
});

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite
};