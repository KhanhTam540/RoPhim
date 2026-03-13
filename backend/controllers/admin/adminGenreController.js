const { Genre, Movie } = require('../../models');
const AppError = require('../../utils/AppError');
const catchAsync = require('../../utils/catchAsync');
const { successResponse } = require('../../utils/responseHandler');
const { getPagination } = require('../../utils/helpers');
const { Op } = require('sequelize');

// Lấy danh sách thể loại
const getAllGenres = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const where = {};
  
  if (req.query.search) {
    where.name = { [Op.like]: `%${req.query.search}%` };
  }

  const { count, rows: genres } = await Genre.findAndCountAll({
    where,
    order: [['name', 'ASC']],
    limit,
    offset
  });

  const pagination = getPagination(page, limit, count);

  successResponse(res, {
    genres,
    pagination
  });
});

// Lấy chi tiết thể loại
const getGenreById = catchAsync(async (req, res, next) => {
  const { genreId } = req.params;

  const genre = await Genre.findByPk(genreId);
  if (!genre) {
    return next(new AppError('Không tìm thấy thể loại', 404));
  }

  successResponse(res, { genre });
});

// Tạo thể loại mới
const createGenre = catchAsync(async (req, res, next) => {
  const { name, description, icon } = req.body;

  const existing = await Genre.findOne({ where: { name } });
  if (existing) {
    return next(new AppError('Tên thể loại đã tồn tại', 400));
  }

  const genre = await Genre.create({
    name,
    description,
    icon
  });

  successResponse(res, { genre }, 'Tạo thể loại thành công', 201);
});

// Cập nhật thể loại
const updateGenre = catchAsync(async (req, res, next) => {
  const { genreId } = req.params;
  const updateData = req.body;

  const genre = await Genre.findByPk(genreId);
  if (!genre) {
    return next(new AppError('Không tìm thấy thể loại', 404));
  }

  await genre.update(updateData);

  successResponse(res, { genre }, 'Cập nhật thể loại thành công');
});

// Xóa thể loại
const deleteGenre = catchAsync(async (req, res, next) => {
  const { genreId } = req.params;

  const genre = await Genre.findByPk(genreId);
  if (!genre) {
    return next(new AppError('Không tìm thấy thể loại', 404));
  }

  const movieCount = await genre.countMovies();
  if (movieCount > 0) {
    return next(new AppError('Không thể xóa vì thể loại đang có phim', 400));
  }

  await genre.destroy();

  successResponse(res, null, 'Xóa thể loại thành công');
});

// Kích hoạt/ vô hiệu hóa thể loại
const toggleGenreStatus = catchAsync(async (req, res, next) => {
  const { genreId } = req.params;
  const { isActive } = req.body;

  const genre = await Genre.findByPk(genreId);
  if (!genre) {
    return next(new AppError('Không tìm thấy thể loại', 404));
  }

  genre.isActive = isActive;
  await genre.save();

  successResponse(res, { genre }, isActive ? 'Đã kích hoạt thể loại' : 'Đã vô hiệu hóa thể loại');
});

module.exports = {
  getAllGenres,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre,
  toggleGenreStatus
};