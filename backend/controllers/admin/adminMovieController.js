const { Movie, Genre, Country, Actor, Director, Episode, sequelize } = require('../../models');
const AppError = require('../../utils/AppError');
const catchAsync = require('../../utils/catchAsync');
const { successResponse } = require('../../utils/responseHandler');
const { deleteFile, getPagination, formatMoviesResponse } = require('../../utils/helpers');
const { Op } = require('sequelize');

// Lấy danh sách phim
const getAllMovies = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const where = {};
  
  if (req.query.search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${req.query.search}%` } },
      { originalTitle: { [Op.like]: `%${req.query.search}%` } }
    ];
  }

  if (req.query.type) {
    where.type = req.query.type;
  }

  if (req.query.status) {
    where.status = req.query.status;
  }

  if (req.query.quality) {
    where.quality = req.query.quality;
  }

  if (req.query.year) {
    where.releaseYear = req.query.year;
  }

  const include = [
    { model: Genre, as: 'genres', attributes: ['id', 'name'], through: { attributes: [] } },
    { model: Country, as: 'countries', attributes: ['id', 'name'], through: { attributes: [] } }
  ];

  if (req.query.genre) {
    include[0].where = { slug: req.query.genre };
    include[0].required = true;
  }

  if (req.query.country) {
    include[1].where = { slug: req.query.country };
    include[1].required = true;
  }

  const { count, rows: movies } = await Movie.findAndCountAll({
    where,
    include,
    order: [['createdAt', 'DESC']],
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
const getMovieById = catchAsync(async (req, res, next) => {
  const { movieId } = req.params;

  const movie = await Movie.findByPk(movieId, {
    include: [
      { model: Genre, as: 'genres', through: { attributes: [] } },
      { model: Country, as: 'countries', through: { attributes: [] } },
      { model: Actor, as: 'actors', through: { attributes: [] } },
      { model: Director, as: 'directors', through: { attributes: [] } },
      { model: Episode, as: 'episodes' }
    ]
  });

  if (!movie) {
    return next(new AppError('Không tìm thấy phim', 404));
  }

  successResponse(res, { movie });
});

// Tạo phim mới
const createMovie = catchAsync(async (req, res, next) => {
  const movieData = req.body;
  const { genreIds, countryIds, actorIds, directorIds } = req.body;

  if (req.files) {
    if (req.files.poster) {
      movieData.poster = req.files.poster[0].path.replace(/\\/g, '/').replace(/^.*?uploads/, 'uploads');
    }
    if (req.files.backdrop) {
      movieData.backdrop = req.files.backdrop[0].path.replace(/\\/g, '/').replace(/^.*?uploads/, 'uploads');
    }
  }

  // Tạo phim
  const movie = await Movie.create(movieData);

  // Thêm quan hệ
  if (genreIds && genreIds.length) {
    await movie.setGenres(genreIds);
  }
  if (countryIds && countryIds.length) {
    await movie.setCountries(countryIds);
  }
  if (actorIds && actorIds.length) {
    await movie.setActors(actorIds);
  }
  if (directorIds && directorIds.length) {
    await movie.setDirectors(directorIds);
  }

  successResponse(res, { movie }, 'Tạo phim thành công', 201);
});

// Cập nhật phim
const updateMovie = catchAsync(async (req, res, next) => {
  const { movieId } = req.params;
  const updateData = req.body;
  const { genreIds, countryIds, actorIds, directorIds } = req.body;

  const movie = await Movie.findByPk(movieId);
  if (!movie) {
    return next(new AppError('Không tìm thấy phim', 404));
  }

  if (req.files) {
    if (req.files.poster) {
      if (movie.poster) deleteFile(movie.poster);
      updateData.poster = req.files.poster[0].path.replace(/\\/g, '/').replace(/^.*?uploads/, 'uploads');
    }
    if (req.files.backdrop) {
      if (movie.backdrop) deleteFile(movie.backdrop);
      updateData.backdrop = req.files.backdrop[0].path.replace(/\\/g, '/').replace(/^.*?uploads/, 'uploads');
    }
  }

  await movie.update(updateData);

  // Cập nhật quan hệ
  if (genreIds) await movie.setGenres(genreIds);
  if (countryIds) await movie.setCountries(countryIds);
  if (actorIds) await movie.setActors(actorIds);
  if (directorIds) await movie.setDirectors(directorIds);

  successResponse(res, { movie }, 'Cập nhật phim thành công');
});

// Xóa phim
const deleteMovie = catchAsync(async (req, res, next) => {
  const { movieId } = req.params;

  const movie = await Movie.findByPk(movieId);
  if (!movie) {
    return next(new AppError('Không tìm thấy phim', 404));
  }

  // Xóa các tập phim
  await Episode.destroy({ where: { movieId } });

  // Xóa ảnh
  if (movie.poster) deleteFile(movie.poster);
  if (movie.backdrop) deleteFile(movie.backdrop);

  await movie.destroy();

  successResponse(res, null, 'Xóa phim thành công');
});

// Kích hoạt/ vô hiệu hóa phim
const toggleMovieStatus = catchAsync(async (req, res, next) => {
  const { movieId } = req.params;
  const { isActive } = req.body;

  const movie = await Movie.findByPk(movieId);
  if (!movie) {
    return next(new AppError('Không tìm thấy phim', 404));
  }

  movie.isActive = isActive;
  await movie.save();

  successResponse(res, { movie }, isActive ? 'Đã kích hoạt phim' : 'Đã vô hiệu hóa phim');
});

// Quản lý tập phim
const getEpisodes = catchAsync(async (req, res, next) => {
  const { movieId } = req.params;

  const episodes = await Episode.findAll({
    where: { movieId },
    order: [['episodeNumber', 'ASC']]
  });

  successResponse(res, { episodes });
});

const addEpisode = catchAsync(async (req, res, next) => {
  const { movieId } = req.params;
  const episodeData = req.body;

  const movie = await Movie.findByPk(movieId);
  if (!movie) {
    return next(new AppError('Không tìm thấy phim', 404));
  }

  if (movie.type !== 'series') {
    return next(new AppError('Chỉ có thể thêm tập cho phim bộ', 400));
  }

  const episode = await Episode.create({
    ...episodeData,
    movieId
  });

  successResponse(res, { episode }, 'Thêm tập phim thành công', 201);
});

const updateEpisode = catchAsync(async (req, res, next) => {
  const { episodeId } = req.params;
  const updateData = req.body;

  const episode = await Episode.findByPk(episodeId);
  if (!episode) {
    return next(new AppError('Không tìm thấy tập phim', 404));
  }

  await episode.update(updateData);

  successResponse(res, { episode }, 'Cập nhật tập phim thành công');
});

const deleteEpisode = catchAsync(async (req, res, next) => {
  const { episodeId } = req.params;

  const episode = await Episode.findByPk(episodeId);
  if (!episode) {
    return next(new AppError('Không tìm thấy tập phim', 404));
  }

  await episode.destroy();

  successResponse(res, null, 'Xóa tập phim thành công');
});

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  toggleMovieStatus,
  getEpisodes,
  addEpisode,
  updateEpisode,
  deleteEpisode
};