const { Actor, Movie } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/responseHandler');
const AppError = require('../utils/AppError');
const { formatMoviesResponse, getPagination } = require('../utils/helpers');

// Lấy danh sách diễn viên
const getActors = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const { count, rows: actors } = await Actor.findAndCountAll({
    where: { isActive: true },
    attributes: ['id', 'name', 'slug', 'avatar', 'nationality', 'bio'],
    order: [['name', 'ASC']],
    limit,
    offset
  });

  const pagination = getPagination(page, limit, count);
  
  successResponse(res, {
    actors,
    pagination
  });
});

// Lấy chi tiết diễn viên theo slug
const getActorBySlug = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const actor = await Actor.findOne({
    where: { slug, isActive: true }
  });

  if (!actor) {
    return next(new AppError('Không tìm thấy diễn viên', 404));
  }

  // Lấy danh sách phim của diễn viên
  const movies = await actor.getMovies({
    where: { isActive: true },
    attributes: ['id', 'title', 'slug', 'poster', 'releaseYear', 'type'],
    through: { attributes: [] },
    limit: 20,
    order: [['releaseYear', 'DESC']]
  });

  successResponse(res, {
    actor,
    movies: formatMoviesResponse(movies, req)
  });
});

module.exports = {
  getActors,
  getActorBySlug
};