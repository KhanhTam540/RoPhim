// backend/controllers/admin/adminDirectorController.js
const { Director, Movie } = require('../../models');
const AppError = require('../../utils/AppError');
const catchAsync = require('../../utils/catchAsync');
const { successResponse } = require('../../utils/responseHandler');
const { deleteFile, getPagination } = require('../../utils/helpers');
const { Op } = require('sequelize');

// Lấy danh sách đạo diễn
const getAllDirectors = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const where = {};
  
  if (req.query.search) {
    where.name = { [Op.like]: `%${req.query.search}%` };
  }

  if (req.query.nationality) {
    where.nationality = { [Op.like]: `%${req.query.nationality}%` };
  }

  const { count, rows: directors } = await Director.findAndCountAll({
    where,
    order: [['name', 'ASC']],
    limit,
    offset,
    distinct: true
  });

  // Đếm số phim cho mỗi đạo diễn
  const directorsWithCount = await Promise.all(
    directors.map(async (director) => {
      const movieCount = await director.countMovies();
      return {
        ...director.toJSON(),
        movieCount
      };
    })
  );

  const pagination = getPagination(page, limit, count);

  successResponse(res, {
    directors: directorsWithCount,
    pagination
  });
});

// Lấy chi tiết đạo diễn
const getDirectorById = catchAsync(async (req, res, next) => {
  const { directorId } = req.params;

  const director = await Director.findByPk(directorId, {
    include: [
      {
        model: Movie,
        as: 'movies',
        attributes: ['id', 'title', 'slug', 'poster', 'releaseYear'],
        through: { attributes: [] },
        required: false
      }
    ]
  });

  if (!director) {
    return next(new AppError('Không tìm thấy đạo diễn', 404));
  }

  successResponse(res, { director });
});

// Tạo đạo diễn mới
const createDirector = catchAsync(async (req, res, next) => {
  const directorData = req.body;

  if (!directorData.name) {
    return next(new AppError('Tên đạo diễn không được để trống', 400));
  }

  if (req.file) {
    directorData.avatar = req.file.path.replace(/\\/g, '/').replace(/^.*?uploads/, 'uploads');
  }

  const director = await Director.create(directorData);

  successResponse(res, { director }, 'Tạo đạo diễn thành công', 201);
});

// Cập nhật đạo diễn
const updateDirector = catchAsync(async (req, res, next) => {
  const { directorId } = req.params;
  const updateData = req.body;

  const director = await Director.findByPk(directorId);
  if (!director) {
    return next(new AppError('Không tìm thấy đạo diễn', 404));
  }

  if (req.file) {
    if (director.avatar) {
      deleteFile(director.avatar);
    }
    updateData.avatar = req.file.path.replace(/\\/g, '/').replace(/^.*?uploads/, 'uploads');
  }

  await director.update(updateData);

  const updatedDirector = await Director.findByPk(directorId, {
    include: [
      {
        model: Movie,
        as: 'movies',
        attributes: ['id', 'title', 'slug'],
        through: { attributes: [] }
      }
    ]
  });

  successResponse(res, { director: updatedDirector }, 'Cập nhật đạo diễn thành công');
});

// Xóa đạo diễn
const deleteDirector = catchAsync(async (req, res, next) => {
  const { directorId } = req.params;

  const director = await Director.findByPk(directorId);
  if (!director) {
    return next(new AppError('Không tìm thấy đạo diễn', 404));
  }

  const movieCount = await director.countMovies();
  if (movieCount > 0) {
    return next(new AppError('Không thể xóa vì đạo diễn đang có phim', 400));
  }

  if (director.avatar) {
    deleteFile(director.avatar);
  }

  await director.destroy();

  successResponse(res, null, 'Xóa đạo diễn thành công');
});

// Kích hoạt/ vô hiệu hóa đạo diễn
const toggleDirectorStatus = catchAsync(async (req, res, next) => {
  const { directorId } = req.params;
  const { isActive } = req.body;

  const director = await Director.findByPk(directorId);
  if (!director) {
    return next(new AppError('Không tìm thấy đạo diễn', 404));
  }

  director.isActive = isActive;
  await director.save();

  successResponse(res, { director }, isActive ? 'Đã kích hoạt đạo diễn' : 'Đã vô hiệu hóa đạo diễn');
});

module.exports = {
  getAllDirectors,
  getDirectorById,
  createDirector,
  updateDirector,
  deleteDirector,
  toggleDirectorStatus
};