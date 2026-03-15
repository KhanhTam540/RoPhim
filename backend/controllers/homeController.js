const { Movie, Slider, Genre, Country } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/responseHandler');
const { formatMoviesResponse } = require('../utils/helpers');
const { Op } = require('sequelize');

// Lấy dữ liệu trang chủ
const getHomeData = catchAsync(async (req, res) => {
  // Log để debug
  console.log('🏠 Loading home page data...');

  // Lấy slider - SỬA: isActive -> is_active
  const sliders = await Slider.findAll({
    where: { is_active: true },
    include: [
      { 
        model: Movie, 
        as: 'movie', 
        attributes: ['id', 'title', 'slug', 'poster', 'type']
      }
    ],
    order: [['order', 'ASC']]
  });

  // Lấy phim hot (nhiều view) - SỬA: isActive -> is_active, viewCount -> view_count
  const trendingMovies = await Movie.findAll({
    where: { is_active: true },
    include: [
      { 
        model: Genre, 
        as: 'genres', 
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] }
      }
    ],
    order: [['view_count', 'DESC']],
    limit: 12
  });

  // Lấy phim mới nhất - SỬA: isActive -> is_active, createdAt -> created_at
  const latestMovies = await Movie.findAll({
    where: { is_active: true },
    include: [
      { 
        model: Genre, 
        as: 'genres', 
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] }
      }
    ],
    order: [['created_at', 'DESC']],
    limit: 12
  });

  // Lấy phim đánh giá cao - SỬA: isActive -> is_active, ratingCount -> rating_count, ratingAverage -> rating_average
  const topRatedMovies = await Movie.findAll({
    where: { 
      is_active: true,
      rating_count: { [Op.gt]: 5 }
    },
    include: [
      { 
        model: Genre, 
        as: 'genres', 
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] }
      }
    ],
    order: [['rating_average', 'DESC'], ['rating_count', 'DESC']],
    limit: 12
  });

  // Lấy phim bộ mới - SỬA: isActive -> is_active, createdAt -> created_at
  const seriesMovies = await Movie.findAll({
    where: { 
      is_active: true,
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
    order: [['created_at', 'DESC']],
    limit: 12
  });

  // Lấy phim lẻ mới - SỬA: isActive -> is_active, createdAt -> created_at
  const singleMovies = await Movie.findAll({
    where: { 
      is_active: true,
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
    order: [['created_at', 'DESC']],
    limit: 12
  });

  // Lấy thể loại - SỬA: isActive -> is_active
  const genres = await Genre.findAll({
    where: { is_active: true },
    attributes: ['id', 'name', 'slug', 'icon'],
    limit: 10,
    order: [['name', 'ASC']]
  });

  // Lấy quốc gia - SỬA: isActive -> is_active
  const countries = await Country.findAll({
    where: { is_active: true },
    attributes: ['id', 'name', 'slug', 'code', 'flag'],
    limit: 10,
    order: [['name', 'ASC']]
  });

  // Log kết quả
  console.log(`✅ Home data loaded: ${trendingMovies.length} trending, ${latestMovies.length} latest, ${genres.length} genres`);

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