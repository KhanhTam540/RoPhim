const { verifyToken } = require('../utils/helpers');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * Protect routes - require authentication
 */
const protect = catchAsync(async (req, res, next) => {
  let token;

  // Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục', 401));
  }

  // Verify token
  const decoded = verifyToken(token);
  if (!decoded) {
    return next(new AppError('Token không hợp lệ hoặc đã hết hạn', 401));
  }

  // Check if user still exists
  const user = await User.findByPk(decoded.id, {
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    return next(new AppError('Người dùng không tồn tại', 401));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Tài khoản của bạn đã bị khóa', 403));
  }

  req.user = user;
  next();
});

/**
 * Restrict to admin only
 */
const restrictToAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Bạn không có quyền truy cập tính năng này', 403));
  }
  next();
};

module.exports = {
  protect,
  restrictToAdmin
};