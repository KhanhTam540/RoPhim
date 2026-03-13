const { Movie, Slider, Genre, Country } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/responseHandler');
const { formatMoviesResponse } = require('../utils/helpers');
const { Op } = require('sequelize');

// Lấy dữ liệu trang chủ
const getHomeData = catchAsync(async (req, res) => {
  // Lấy slider
  const sliders = await Slider.findAll({
    where: { isActive: true },
    include: [
      { 
        model: Movie, 
        as: 'movie', 
        attributes: ['id', 'title', 'slug', 'poster']
      }
    ],
    order: [['order', 'ASC']]
  });

  // Lấy phim hot (nhiều view)
  const trendingMovies = await Movie.findAll({
    where: { isActive: true },
    include: [
      { 
        model: Genre, 
        as: 'genres', 
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] }
      }
    ],
    order: [['viewCount', 'DESC']],
    limit: 12
  });

  // Lấy phim mới nhất
  const latestMovies = await Movie.findAll({
    where: { isActive: true },
    include: [
      { 
        model: Genre, 
        as: 'genres', 
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] }
      }
    ],
    order: [['createdAt', 'DESC']],
    limit: 12
  });

  // Lấy phim đánh giá cao
  const topRatedMovies = await Movie.findAll({
    where: { 
      isActive: true,
      ratingCount: { [Op.gt]: 5 }
    },
    include: [
      { 
        model: Genre, 
        as: 'genres', 
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] }
      }
    ],
    order: [['ratingAverage', 'DESC'], ['ratingCount', 'DESC']],
    limit: 12
  });

  // Lấy phim bộ mới
  const seriesMovies = await Movie.findAll({
    where: { 
      isActive: true,
      type: 'series'
    },
    include: [
      { 
        model: Genre, 
        as: 'genres', 
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] }
      }
    ],
    order: [['createdAt', 'DESC']],
    limit: 12
  });

  // Lấy phim lẻ mới
  const singleMovies = await Movie.findAll({
    where: { 
      isActive: true,
      type: 'single'
    },
    include: [
      { 
        model: Genre, 
        as: 'genres', 
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] }
      }
    ],
    order: [['createdAt', 'DESC']],
    limit: 12
  });

  // Lấy thể loại
  const genres = await Genre.findAll({
    where: { isActive: true },
    attributes: ['id', 'name', 'slug', 'icon'],
    limit: 10,
    order: [['name', 'ASC']]
  });

  // Lấy quốc gia
  const countries = await Country.findAll({
    where: { isActive: true },
    attributes: ['id', 'name', 'slug', 'code', 'flag'],
    limit: 10,
    order: [['name', 'ASC']]
  });

  successResponse(res, {
    sliders: formatMoviesResponse(sliders, req),
    trendingMovies: formatMoviesResponse(trendingMovies, req),
    latestMovies: formatMoviesResponse(latestMovies, req),
    topRatedMovies: formatMoviesResponse(topRatedMovies, req),
    seriesMovies: formatMoviesResponse(seriesMovies, req),
    singleMovies: formatMoviesResponse(singleMovies, req),
    genres,
    countries
  });
});

module.exports = {
  getHomeData
};