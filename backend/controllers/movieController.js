const { Movie, Genre, Country, Director, Actor, Episode, Rating, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/responseHandler');
const { formatMovieResponse, formatMoviesResponse, getPagination } = require('../utils/helpers');
const { Op } = require('sequelize');

// Lấy danh sách phim
const getMovies = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const where = { isActive: true };
  const include = [
    { 
      model: Genre, 
      as: 'genres', 
      attributes: ['id', 'name', 'slug'],
      through: { attributes: [] }
    },
    { 
      model: Country, 
      as: 'countries', 
      attributes: ['id', 'name', 'slug'],
      through: { attributes: [] }
    }
  ];

  // Filter theo thể loại
  if (req.query.genre) {
    include[0].where = { slug: req.query.genre };
    include[0].required = true;
  }

  // Filter theo quốc gia
  if (req.query.country) {
    include[1].where = { slug: req.query.country };
    include[1].required = true;
  }

  // Filter theo năm
  if (req.query.year) {
    where.releaseYear = req.query.year;
  }

  // Filter theo loại phim
  if (req.query.type) {
    where.type = req.query.type;
  }

  // Filter theo chất lượng
  if (req.query.quality) {
    where.quality = req.query.quality;
  }

  // Filter theo trạng thái
  if (req.query.status) {
    where.status = req.query.status;
  }

  // Tìm kiếm
  if (req.query.search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${req.query.search}%` } },
      { originalTitle: { [Op.like]: `%${req.query.search}%` } }
    ];
  }

  // Sắp xếp
  let order = [];
  switch (req.query.sort) {
    case 'latest':
      order = [['createdAt', 'DESC']];
      break;
    case 'popular':
      order = [['viewCount', 'DESC']];
      break;
    case 'rating':
      order = [['ratingAverage', 'DESC'], ['ratingCount', 'DESC']];
      break;
    case 'title_asc':
      order = [['title', 'ASC']];
      break;
    case 'title_desc':
      order = [['title', 'DESC']];
      break;
    case 'year_desc':
      order = [['releaseYear', 'DESC']];
      break;
    case 'year_asc':
      order = [['releaseYear', 'ASC']];
      break;
    default:
      order = [['createdAt', 'DESC']];
  }

  const { count, rows: movies } = await Movie.findAndCountAll({
    where,
    include,
    order,
    limit,
    offset,
    distinct: true
  });

  const pagination = getPagination(page, limit, count);
  
  successResponse(res, {
    movies: formatMoviesResponse(movies, req),
    pagination
  });
});

// Lấy chi tiết phim
const getMovieDetail = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const movie = await Movie.findOne({
    where: { slug, isActive: true },
    include: [
      { 
        model: Genre, 
        as: 'genres', 
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] }
      },
      { 
        model: Country, 
        as: 'countries', 
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] }
      },
      { 
        model: Director, 
        as: 'directors', 
        attributes: ['id', 'name', 'slug', 'avatar'],
        through: { attributes: [] }
      },
      { 
        model: Actor, 
        as: 'actors', 
        attributes: ['id', 'name', 'slug', 'avatar'],
        through: { attributes: [] }
      }
    ]
  });

  if (!movie) {
    return next(new AppError('Không tìm thấy phim', 404));
  }

  // Lấy danh sách tập
  const episodes = await Episode.findAll({
    where: { movieId: movie.id, isActive: true },
    order: [['episodeNumber', 'ASC']]
  });

  // Lấy đánh giá của user
  let userRating = null;
  if (req.user) {
    const rating = await Rating.findOne({
      where: { userId: req.user.id, movieId: movie.id }
    });
    userRating = rating ? rating.score : null;
  }

  // Lấy phim liên quan
  const movieGenres = await sequelize.models.MovieGenre.findAll({
    where: { movieId: movie.id },
    attributes: ['genreId']
  });
  const genreIds = movieGenres.map(mg => mg.genreId);

  const relatedMovies = await Movie.findAll({
    where: {
      id: { [Op.ne]: movie.id },
      isActive: true
    },
    include: [
      { 
        model: Genre, 
        as: 'genres', 
        where: { id: { [Op.in]: genreIds } },
        through: { attributes: [] },
        required: true
      }
    ],
    limit: 6,
    distinct: true
  });

  const movieData = formatMovieResponse(movie, req);
  successResponse(res, {
    ...movieData,
    episodes,
    userRating,
    relatedMovies: formatMoviesResponse(relatedMovies, req)
  });
});

// Tăng lượt xem
const incrementViewCount = catchAsync(async (req, res, next) => {
  const { movieId } = req.params;

  const movie = await Movie.findByPk(movieId);
  if (!movie) {
    return next(new AppError('Không tìm thấy phim', 404));
  }

  movie.viewCount += 1;
  await movie.save();

  successResponse(res, { viewCount: movie.viewCount });
});

// Lấy phim hot
const getPopularMovies = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const movies = await Movie.findAll({
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
    limit
  });

  successResponse(res, { movies: formatMoviesResponse(movies, req) });
});

// Lấy phim mới nhất
const getLatestMovies = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const movies = await Movie.findAll({
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
    limit
  });

  successResponse(res, { movies: formatMoviesResponse(movies, req) });
});

// Lấy phim đề cử
const getFeaturedMovies = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const movies = await Movie.findAll({
    where: { isActive: true, isFeatured: true },
    include: [
      { 
        model: Genre, 
        as: 'genres', 
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] }
      }
    ],
    order: [['createdAt', 'DESC']],
    limit
  });

  successResponse(res, { movies: formatMoviesResponse(movies, req) });
});

module.exports = {
  getMovies,
  getMovieDetail,
  incrementViewCount,
  getPopularMovies,
  getLatestMovies,
  getFeaturedMovies
};