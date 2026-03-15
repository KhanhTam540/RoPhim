const { 
  Movie, 
  Genre, 
  Country, 
  Director, 
  Actor, 
  Episode, 
  Rating,
  MovieGenre,  // Import trực tiếp junction model
  MovieCountry,
  sequelize 
} = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/responseHandler');
const { formatMovieResponse, formatMoviesResponse, getPagination } = require('../utils/helpers');
const { Op } = require('sequelize');

// KIỂM TRA MODEL
console.log('🔍 MovieController - Checking models:', {
  Movie: !!Movie,
  Genre: !!Genre,
  Country: !!Country,
  MovieGenre: !!MovieGenre,
  MovieCountry: !!MovieCountry,
  sequelize: !!sequelize
});

// Lấy danh sách phim
const getMovies = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  // Điều kiện where cơ bản
  const where = { is_active: true };
  
  // Log request
  console.log('🔍 ===== MOVIE API CALL =====');
  console.log('🔍 Request query:', req.query);

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

  // FILTER THEO THỂ LOẠI
  if (req.query.genre) {
    console.log('🎬 Filtering by genre slug:', req.query.genre);
    
    // Tìm genre theo slug
    const genre = await Genre.findOne({ 
      where: { slug: req.query.genre, is_active: true }
    });
    
    if (genre) {
      console.log('✅ Found genre:', { id: genre.id, name: genre.name });
      
      // Dùng MovieGenre model đã import
      const movieGenres = await MovieGenre.findAll({
        where: { genre_id: genre.id },
        attributes: ['movie_id']
      });
      
      console.log(`📊 Found ${movieGenres.length} movie-genre relations`);
      
      if (movieGenres.length > 0) {
        const movieIds = movieGenres.map(mg => mg.movie_id);
        where.id = { [Op.in]: movieIds };
        console.log(`🎬 Found ${movieIds.length} movies with this genre`);
      } else {
        console.log('🎬 No movies found with this genre');
        return successResponse(res, {
          movies: [],
          pagination: getPagination(page, limit, 0)
        });
      }
    } else {
      console.log('❌ Genre not found with slug:', req.query.genre);
      return successResponse(res, {
        movies: [],
        pagination: getPagination(page, limit, 0)
      });
    }
  }

  // FILTER THEO QUỐC GIA
  if (req.query.country) {
    console.log('🌍 Filtering by country slug:', req.query.country);
    
    const country = await Country.findOne({ 
      where: { slug: req.query.country, is_active: true }
    });
    
    if (country) {
      console.log('✅ Found country:', { id: country.id, name: country.name });
      
      // Dùng MovieCountry model đã import
      const movieCountries = await MovieCountry.findAll({
        where: { country_id: country.id },
        attributes: ['movie_id']
      });
      
      console.log(`📊 Found ${movieCountries.length} movie-country relations`);
      
      if (movieCountries.length > 0) {
        const countryMovieIds = movieCountries.map(mc => mc.movie_id);
        
        // Kết hợp với điều kiện genre nếu có
        if (where.id && where.id[Op.in]) {
          // Lấy giao của 2 mảng
          const genreMovieIds = where.id[Op.in];
          const intersection = genreMovieIds.filter(id => countryMovieIds.includes(id));
          
          if (intersection.length > 0) {
            where.id = { [Op.in]: intersection };
          } else {
            return successResponse(res, {
              movies: [],
              pagination: getPagination(page, limit, 0)
            });
          }
        } else {
          where.id = { [Op.in]: countryMovieIds };
        }
      } else {
        return successResponse(res, {
          movies: [],
          pagination: getPagination(page, limit, 0)
        });
      }
    } else {
      return successResponse(res, {
        movies: [],
        pagination: getPagination(page, limit, 0)
      });
    }
  }

  // FILTER THEO NĂM
  if (req.query.year) {
    where.release_year = req.query.year;
    console.log('📅 Filtering by year:', req.query.year);
  }

  // FILTER THEO LOẠI PHIM
  if (req.query.type) {
    where.type = req.query.type;
    console.log('🎬 Filtering by type:', req.query.type);
  }

  // FILTER THEO CHẤT LƯỢNG
  if (req.query.quality) {
    where.quality = req.query.quality;
    console.log('✨ Filtering by quality:', req.query.quality);
  }

  // FILTER THEO TRẠNG THÁI
  if (req.query.status) {
    where.status = req.query.status;
    console.log('📊 Filtering by status:', req.query.status);
  }

  // TÌM KIẾM
  if (req.query.search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${req.query.search}%` } },
      { original_title: { [Op.like]: `%${req.query.search}%` } }
    ];
    console.log('🔍 Searching for:', req.query.search);
  }

  // SẮP XẾP
  let order = [];
  switch (req.query.sort) {
    case 'latest':
      order = [['created_at', 'DESC']];
      break;
    case 'popular':
      order = [['view_count', 'DESC']];
      break;
    case 'rating':
      order = [['rating_average', 'DESC'], ['rating_count', 'DESC']];
      break;
    case 'title_asc':
      order = [['title', 'ASC']];
      break;
    case 'title_desc':
      order = [['title', 'DESC']];
      break;
    case 'year_desc':
      order = [['release_year', 'DESC']];
      break;
    case 'year_asc':
      order = [['release_year', 'ASC']];
      break;
    default:
      order = [['created_at', 'DESC']];
  }

  console.log('📊 WHERE clause:', JSON.stringify(where, null, 2));
  console.log('📊 ORDER:', order);

  // THỰC HIỆN QUERY
  try {
    const { count, rows: movies } = await Movie.findAndCountAll({
      where,
      include,
      order,
      limit,
      offset,
      distinct: true
    });

    console.log(`📊 Found ${movies.length} movies (total: ${count})`);
    
    if (movies.length > 0) {
      console.log('🎬 First movie:', movies[0].title);
    } else {
      console.log('⚠️ No movies found with criteria');
    }

    const pagination = getPagination(page, limit, count);
    
    successResponse(res, {
      movies: formatMoviesResponse(movies, req),
      pagination
    });
  } catch (error) {
    console.error('❌ Error in getMovies:', error);
    throw error;
  }
});

// Lấy chi tiết phim
const getMovieDetail = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const movie = await Movie.findOne({
    where: { slug, is_active: true },
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
    where: { movie_id: movie.id, is_active: true },
    order: [['episode_number', 'ASC']]
  });

  // Lấy đánh giá của user
  let userRating = null;
  if (req.user) {
    const rating = await Rating.findOne({
      where: { user_id: req.user.id, movie_id: movie.id }
    });
    userRating = rating ? rating.score : null;
  }

  // Lấy phim liên quan
  const movieGenres = await MovieGenre.findAll({
    where: { movie_id: movie.id },
    attributes: ['genre_id']
  });
  
  const genreIds = movieGenres.map(mg => mg.genre_id);

  let relatedMovies = [];
  if (genreIds.length > 0) {
    relatedMovies = await Movie.findAll({
      where: {
        id: { [Op.ne]: movie.id },
        is_active: true
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
  }

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

  movie.view_count += 1;
  await movie.save();

  successResponse(res, { viewCount: movie.view_count });
});

// Lấy phim hot
const getPopularMovies = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const movies = await Movie.findAll({
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
    limit
  });

  successResponse(res, { movies: formatMoviesResponse(movies, req) });
});

// Lấy phim mới nhất
const getLatestMovies = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const movies = await Movie.findAll({
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
    limit
  });

  successResponse(res, { movies: formatMoviesResponse(movies, req) });
});

// Lấy phim đề cử
const getFeaturedMovies = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const movies = await Movie.findAll({
    where: { is_active: true, is_featured: true },
    include: [
      { 
        model: Genre, 
        as: 'genres', 
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] }
      }
    ],
    order: [['created_at', 'DESC']],
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