const { Director, Movie } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/responseHandler');
const AppError = require('../utils/AppError');
const { formatMoviesResponse, getPagination } = require('../utils/helpers');

// Lấy danh sách đạo diễn
const getDirectors = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const { count, rows: directors } = await Director.findAndCountAll({
    where: { isActive: true },
    attributes: ['id', 'name', 'slug', 'avatar', 'nationality', 'bio'],
    order: [['name', 'ASC']],
    limit,
    offset
  });

  const pagination = getPagination(page, limit, count);
  
  successResponse(res, {
    directors,
    pagination
  });
});

// Lấy chi tiết đạo diễn theo slug
const getDirectorBySlug = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const director = await Director.findOne({
    where: { slug, isActive: true }
  });

  if (!director) {
    return next(new AppError('Không tìm thấy đạo diễn', 404));
  }

  // Lấy danh sách phim của đạo diễn
  const movies = await director.getMovies({
    where: { isActive: true },
    attributes: ['id', 'title', 'slug', 'poster', 'releaseYear', 'type'],
    through: { attributes: [] },
    limit: 20,
    order: [['releaseYear', 'DESC']]
  });

  successResponse(res, {
    director,
    movies: formatMoviesResponse(movies, req)
  });
});

module.exports = {
  getDirectors,
  getDirectorBySlug
};