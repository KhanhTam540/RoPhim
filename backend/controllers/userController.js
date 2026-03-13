const { User, History, Favorite, Movie } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/responseHandler');
const { deleteFile, getPagination, formatMoviesResponse } = require('../utils/helpers');

// Lấy profile
const getProfile = catchAsync(async (req, res) => {
  successResponse(res, { user: req.user });
});

// Cập nhật profile
const updateProfile = catchAsync(async (req, res, next) => {
  const { fullName, preferences } = req.body;

  const user = await User.findByPk(req.user.id);

  if (fullName) user.fullName = fullName;
  if (preferences) user.preferences = { ...user.preferences, ...preferences };

  await user.save();

  successResponse(res, { user }, 'Cập nhật profile thành công');
});

// Đổi mật khẩu
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findByPk(req.user.id);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new AppError('Mật khẩu hiện tại không đúng', 400));
  }

  user.password = newPassword;
  await user.save();

  successResponse(res, null, 'Đổi mật khẩu thành công');
});

// Upload avatar
const uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Vui lòng chọn file ảnh', 400));
  }

  const user = await User.findByPk(req.user.id);

  // Xóa avatar cũ
  if (user.avatar && !user.avatar.includes('default-avatar')) {
    deleteFile(user.avatar);
  }

  const avatarPath = req.file.path.replace(/\\/g, '/').replace(/^.*?uploads/, 'uploads');
  user.avatar = avatarPath;
  await user.save();

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  successResponse(res, { 
    avatar: `${baseUrl}/${avatarPath}`
  }, 'Upload avatar thành công');
});

// Lấy lịch sử xem
const getHistory = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const { count, rows: histories } = await History.findAndCountAll({
    where: { userId: req.user.id },
    include: [
      { 
        model: Movie, 
        as: 'movie',
        attributes: ['id', 'title', 'slug', 'poster', 'type']
      }
    ],
    order: [['watchedAt', 'DESC']],
    limit,
    offset,
    distinct: true
  });

  const historyList = histories.map(h => ({
    id: h.id,
    movie: formatMoviesResponse([h.movie], req)[0],
    progress: h.progress,
    completed: h.completed,
    watchedAt: h.watchedAt
  }));

  const pagination = getPagination(page, limit, count);

  successResponse(res, {
    history: historyList,
    pagination
  });
});

// Lấy danh sách yêu thích
const getFavorites = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const { count, rows: favorites } = await Favorite.findAndCountAll({
    where: { userId: req.user.id },
    include: [
      { 
        model: Movie, 
        as: 'movie',
        where: { isActive: true },
        include: ['genres']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    distinct: true
  });

  const movies = favorites.map(f => f.movie).filter(m => m);
  const pagination = getPagination(page, limit, count);

  successResponse(res, {
    movies: formatMoviesResponse(movies, req),
    pagination
  });
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  getHistory,
  getFavorites
};