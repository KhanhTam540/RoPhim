const { User, Comment, Rating, History } = require('../../models');
const AppError = require('../../utils/AppError');
const catchAsync = require('../../utils/catchAsync');
const { successResponse } = require('../../utils/responseHandler');
const { getPagination } = require('../../utils/helpers');
const { Op } = require('sequelize');

// Lấy danh sách người dùng
const getAllUsers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const where = {};

  if (req.query.search) {
    where[Op.or] = [
      { username: { [Op.like]: `%${req.query.search}%` } },
      { email: { [Op.like]: `%${req.query.search}%` } },
      { fullName: { [Op.like]: `%${req.query.search}%` } }
    ];
  }

  if (req.query.role) {
    where.role = req.query.role;
  }

  if (req.query.isActive !== undefined) {
    where.isActive = req.query.isActive === 'true';
  }

  const { count, rows: users } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });

  const pagination = getPagination(page, limit, count);

  successResponse(res, {
    users,
    pagination
  });
});

// Lấy chi tiết người dùng
const getUserById = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
    include: [
      {
        model: Comment,
        as: 'comments',
        limit: 10,
        order: [['createdAt', 'DESC']]
      },
      {
        model: Rating,
        as: 'ratings',
        limit: 10,
        order: [['createdAt', 'DESC']]
      },
      {
        model: History,
        as: 'histories',
        limit: 10,
        order: [['watchedAt', 'DESC']]
      }
    ]
  });

  if (!user) {
    return next(new AppError('Không tìm thấy người dùng', 404));
  }

  // Đếm số lượng
  const commentCount = await Comment.count({ where: { userId } });
  const ratingCount = await Rating.count({ where: { userId } });
  const historyCount = await History.count({ where: { userId } });

  successResponse(res, {
    user,
    stats: {
      comments: commentCount,
      ratings: ratingCount,
      history: historyCount
    }
  });
});

// Tạo người dùng mới (bởi admin)
const createUser = catchAsync(async (req, res, next) => {
  const { username, email, password, fullName, role, isActive } = req.body;

  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ username }, { email }]
    }
  });

  if (existingUser) {
    if (existingUser.username === username) {
      return next(new AppError('Username đã tồn tại', 400));
    }
    if (existingUser.email === email) {
      return next(new AppError('Email đã tồn tại', 400));
    }
  }

  const user = await User.create({
    username,
    email,
    password,
    fullName,
    role: role || 'user',
    isActive: isActive !== undefined ? isActive : true,
    emailVerified: true
  });

  successResponse(res, { user }, 'Tạo người dùng thành công', 201);
});

// Cập nhật người dùng
const updateUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const updateData = req.body;

  const user = await User.findByPk(userId);
  if (!user) {
    return next(new AppError('Không tìm thấy người dùng', 404));
  }

  // Không cho phép cập nhật password qua đây
  delete updateData.password;

  await user.update(updateData);

  successResponse(res, { user }, 'Cập nhật người dùng thành công');
});

// Xóa người dùng
const deleteUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findByPk(userId);
  if (!user) {
    return next(new AppError('Không tìm thấy người dùng', 404));
  }

  // Xóa các dữ liệu liên quan
  await Comment.destroy({ where: { userId } });
  await Rating.destroy({ where: { userId } });
  await History.destroy({ where: { userId } });
  await user.destroy();

  successResponse(res, null, 'Xóa người dùng thành công');
});

// Khóa/Mở khóa người dùng
const toggleUserStatus = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  const user = await User.findByPk(userId);
  if (!user) {
    return next(new AppError('Không tìm thấy người dùng', 404));
  }

  user.isActive = isActive;
  await user.save();

  successResponse(res, { user }, isActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
});

// Đặt lại mật khẩu
const resetPassword = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { newPassword } = req.body;

  const user = await User.findByPk(userId);
  if (!user) {
    return next(new AppError('Không tìm thấy người dùng', 404));
  }

  user.password = newPassword;
  await user.save();

  successResponse(res, null, 'Đặt lại mật khẩu thành công');
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetPassword
};