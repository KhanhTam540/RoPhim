const { User, Comment, Rating, History, Favorite, Movie } = require('../../models');
const AppError = require('../../utils/AppError');
const catchAsync = require('../../utils/catchAsync');
const { successResponse } = require('../../utils/responseHandler');
const { getPagination } = require('../../utils/helpers');
const { Op } = require('sequelize');

// Lấy danh sách người dùng
// backend/controllers/admin/adminUserController.js
// Đảm bảo hàm getAllUsers trả về đúng cấu trúc

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

  if (req.query.isActive !== undefined && req.query.isActive !== '') { // Thêm kiểm tra chuỗi rỗng
  where.isActive = req.query.isActive === 'true';
  }

  console.log('📊 Where clause:', where); // Thêm log

  const { count, rows: users } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire', 'emailVerifyToken', 'emailVerifyExpire'] },
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });

  console.log('📊 Found users:', users.length); // Thêm log
  console.log('📊 Total count:', count); // Thêm log

  // Đếm số lượng comments, ratings, favorites cho mỗi user
  const usersWithStats = await Promise.all(
    users.map(async (user) => {
      const commentCount = await Comment.count({ where: { userId: user.id } });
      const ratingCount = await Rating.count({ where: { userId: user.id } });
      const favoriteCount = await Favorite.count({ where: { userId: user.id } });
      const historyCount = await History.count({ where: { userId: user.id } });
      
      return {
        ...user.toJSON(),
        stats: {
          comments: commentCount,
          ratings: ratingCount,
          favorites: favoriteCount,
          history: historyCount
        }
      };
    })
  );

  const pagination = getPagination(page, limit, count);

  console.log('📊 Sending response with users:', usersWithStats.length); // Thêm log

  successResponse(res, {
    users: usersWithStats,
    pagination
  });
});

// Lấy chi tiết người dùng
const getUserById = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire', 'emailVerifyToken', 'emailVerifyExpire'] },
    include: [
      {
        model: Comment,
        as: 'comments',
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Movie,
            as: 'movie',
            attributes: ['id', 'title', 'slug']
          }
        ]
      },
      {
        model: Rating,
        as: 'ratings',
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Movie,
            as: 'movie',
            attributes: ['id', 'title', 'slug']
          }
        ]
      },
      {
        model: Favorite,
        as: 'favorites',
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Movie,
            as: 'movie',
            attributes: ['id', 'title', 'slug', 'poster']
          }
        ]
      },
      {
        model: History,
        as: 'histories',
        limit: 10,
        order: [['watchedAt', 'DESC']],
        include: [
          {
            model: Movie,
            as: 'movie',
            attributes: ['id', 'title', 'slug', 'poster']
          },
          {
            model: require('../../models/Episode'),
            as: 'episode',
            attributes: ['id', 'episodeNumber', 'title']
          }
        ]
      }
    ]
  });

  if (!user) {
    return next(new AppError('Không tìm thấy người dùng', 404));
  }

  // Đếm số lượng
  const commentCount = await Comment.count({ where: { userId } });
  const ratingCount = await Rating.count({ where: { userId } });
  const favoriteCount = await Favorite.count({ where: { userId } });
  const historyCount = await History.count({ where: { userId } });

  successResponse(res, {
    user,
    stats: {
      comments: commentCount,
      ratings: ratingCount,
      favorites: favoriteCount,
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

  // Lấy user không kèm password
  const createdUser = await User.findByPk(user.id, {
    attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire', 'emailVerifyToken', 'emailVerifyExpire'] }
  });

  successResponse(res, { user: createdUser }, 'Tạo người dùng thành công', 201);
});

// Cập nhật người dùng
const updateUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const updateData = req.body;

  const user = await User.findByPk(userId);
  if (!user) {
    return next(new AppError('Không tìm thấy người dùng', 404));
  }

  // Kiểm tra email/username đã tồn tại nếu cập nhật
  if (updateData.email || updateData.username) {
    const whereConditions = [];
    if (updateData.email) {
      whereConditions.push({ email: updateData.email, id: { [Op.ne]: userId } });
    }
    if (updateData.username) {
      whereConditions.push({ username: updateData.username, id: { [Op.ne]: userId } });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: whereConditions
      }
    });

    if (existingUser) {
      if (existingUser.email === updateData.email) {
        return next(new AppError('Email đã tồn tại', 400));
      }
      if (existingUser.username === updateData.username) {
        return next(new AppError('Username đã tồn tại', 400));
      }
    }
  }

  // Không cho phép cập nhật password qua đây
  delete updateData.password;

  await user.update(updateData);

  // Lấy user đã cập nhật
  const updatedUser = await User.findByPk(userId, {
    attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire', 'emailVerifyToken', 'emailVerifyExpire'] }
  });

  successResponse(res, { user: updatedUser }, 'Cập nhật người dùng thành công');
});

// Xóa người dùng
const deleteUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findByPk(userId);
  if (!user) {
    return next(new AppError('Không tìm thấy người dùng', 404));
  }

  // Không cho xóa admin cuối cùng
  if (user.role === 'admin') {
    const adminCount = await User.count({ where: { role: 'admin' } });
    if (adminCount <= 1) {
      return next(new AppError('Không thể xóa admin cuối cùng', 400));
    }
  }

  // Xóa các dữ liệu liên quan
  await Comment.destroy({ where: { userId } });
  await Rating.destroy({ where: { userId } });
  await Favorite.destroy({ where: { userId } });
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

  // Không cho khóa admin nếu là admin cuối cùng
  if (user.role === 'admin' && !isActive) {
    const adminCount = await User.count({ where: { role: 'admin' } });
    if (adminCount <= 1) {
      return next(new AppError('Không thể khóa admin cuối cùng', 400));
    }
  }

  user.isActive = isActive;
  await user.save();

  successResponse(res, { user }, isActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
});

// Đặt lại mật khẩu
const resetPassword = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return next(new AppError('Mật khẩu mới phải có ít nhất 6 ký tự', 400));
  }

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