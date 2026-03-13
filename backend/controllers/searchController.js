const { Movie, Genre, Actor, Director } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/responseHandler');
const { formatMoviesResponse, getPagination } = require('../utils/helpers');
const { Op } = require('sequelize');

// Tìm kiếm tổng hợp
const search = catchAsync(async (req, res) => {
  const { keyword } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  if (!keyword || keyword.length < 2) {
    return successResponse(res, { 
      movies: [], 
      actors: [], 
      directors: [],
      pagination: getPagination(page, limit, 0)
    });
  }

  // Tìm phim
  const movieWhere = {
    [Op.or]: [
      { title: { [Op.like]: `%${keyword}%` } },
      { originalTitle: { [Op.like]: `%${keyword}%` } },
      { description: { [Op.like]: `%${keyword}%` } }
    ],
    isActive: true
  };

  const { count: movieCount, rows: movies } = await Movie.findAndCountAll({
    where: movieWhere,
    include: [
      { model: Genre, as: 'genres', attributes: ['id', 'name', 'slug'] }
    ],
    limit,
    offset,
    distinct: true,
    order: [['viewCount', 'DESC']]
  });

  // Tìm diễn viên
  const actors = await Actor.findAll({
    where: {
      name: { [Op.like]: `%${keyword}%` },
      isActive: true
    },
    attributes: ['id', 'name', 'slug', 'avatar', 'nationality'],
    limit: 5
  });

  // Tìm đạo diễn
  const directors = await Director.findAll({
    where: {
      name: { [Op.like]: `%${keyword}%` },
      isActive: true
    },
    attributes: ['id', 'name', 'slug', 'avatar', 'nationality'],
    limit: 5
  });

  const pagination = getPagination(page, limit, movieCount);

  successResponse(res, {
    movies: formatMoviesResponse(movies, req),
    actors,
    directors,
    pagination
  });
});

// Gợi ý tìm kiếm
const suggest = catchAsync(async (req, res) => {
  const { keyword } = req.query;

  if (!keyword || keyword.length < 2) {
    return successResponse(res, { suggestions: [] });
  }

  const suggestions = await Movie.findAll({
    where: {
      title: { [Op.like]: `%${keyword}%` },
      isActive: true
    },
    attributes: ['id', 'title', 'slug', 'poster', 'type', 'releaseYear'],
    limit: 5,
    order: [['viewCount', 'DESC']]
  });

  successResponse(res, {
    suggestions: formatMoviesResponse(suggestions, req)
  });
});

module.exports = {
  search,
  suggest
};