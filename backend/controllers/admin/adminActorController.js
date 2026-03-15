// backend/controllers/admin/adminActorController.js
const { Actor, Movie } = require('../../models');
const AppError = require('../../utils/AppError');
const catchAsync = require('../../utils/catchAsync');
const { successResponse } = require('../../utils/responseHandler');
const { deleteFile, getPagination } = require('../../utils/helpers');
const { Op } = require('sequelize');

// Lấy danh sách diễn viên
const getAllActors = catchAsync(async (req, res) => {
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

  const { count, rows: actors } = await Actor.findAndCountAll({
    where,
    order: [['name', 'ASC']],
    limit,
    offset,
    distinct: true
  });

  // Đếm số phim cho mỗi diễn viên
  const actorsWithCount = await Promise.all(
    actors.map(async (actor) => {
      const movieCount = await actor.countMovies();
      return {
        ...actor.toJSON(),
        movieCount
      };
    })
  );

  const pagination = getPagination(page, limit, count);

  successResponse(res, {
    actors: actorsWithCount,
    pagination
  });
});

// Lấy chi tiết diễn viên
const getActorById = catchAsync(async (req, res, next) => {
  const { actorId } = req.params;

  const actor = await Actor.findByPk(actorId, {
    include: [
      {
        model: Movie,
        as: 'movies',  // Phải khớp với tên trong model
        attributes: ['id', 'title', 'slug', 'poster', 'releaseYear'],
        through: { attributes: [] },
        required: false
      }
    ]
  });

  if (!actor) {
    return next(new AppError('Không tìm thấy diễn viên', 404));
  }

  successResponse(res, { actor });
});

// Tạo diễn viên mới
const createActor = catchAsync(async (req, res, next) => {
  const actorData = req.body;

  // Kiểm tra tên diễn viên
  if (!actorData.name) {
    return next(new AppError('Tên diễn viên không được để trống', 400));
  }

  const actor = await Actor.create(actorData);

  successResponse(res, { actor }, 'Tạo diễn viên thành công', 201);
});

// Cập nhật diễn viên
const updateActor = catchAsync(async (req, res, next) => {
  const { actorId } = req.params;
  const updateData = req.body;

  const actor = await Actor.findByPk(actorId);
  if (!actor) {
    return next(new AppError('Không tìm thấy diễn viên', 404));
  }

  // Xử lý avatar nếu có
  if (req.file) {
    if (actor.avatar) {
      deleteFile(actor.avatar);
    }
    updateData.avatar = req.file.path.replace(/\\/g, '/').replace(/^.*?uploads/, 'uploads');
  }

  await actor.update(updateData);

  // Lấy lại thông tin actor sau khi cập nhật
  const updatedActor = await Actor.findByPk(actorId, {
    include: [
      {
        model: Movie,
        as: 'movies',
        attributes: ['id', 'title', 'slug'],
        through: { attributes: [] }
      }
    ]
  });

  successResponse(res, { actor: updatedActor }, 'Cập nhật diễn viên thành công');
});

// Xóa diễn viên
const deleteActor = catchAsync(async (req, res, next) => {
  const { actorId } = req.params;

  const actor = await Actor.findByPk(actorId);
  if (!actor) {
    return next(new AppError('Không tìm thấy diễn viên', 404));
  }

  // Kiểm tra diễn viên có đang được sử dụng không
  const movieCount = await actor.countMovies();
  if (movieCount > 0) {
    return next(new AppError('Không thể xóa vì diễn viên đang có phim', 400));
  }

  // Xóa avatar nếu có
  if (actor.avatar) {
    deleteFile(actor.avatar);
  }

  await actor.destroy();

  successResponse(res, null, 'Xóa diễn viên thành công');
});

// Kích hoạt/ vô hiệu hóa diễn viên
const toggleActorStatus = catchAsync(async (req, res, next) => {
  const { actorId } = req.params;
  const { isActive } = req.body;

  const actor = await Actor.findByPk(actorId);
  if (!actor) {
    return next(new AppError('Không tìm thấy diễn viên', 404));
  }

  actor.isActive = isActive;
  await actor.save();

  successResponse(res, { actor }, isActive ? 'Đã kích hoạt diễn viên' : 'Đã vô hiệu hóa diễn viên');
});

module.exports = {
  getAllActors,
  getActorById,
  createActor,
  updateActor,
  deleteActor,
  toggleActorStatus
};