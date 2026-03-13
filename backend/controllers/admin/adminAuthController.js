const { User } = require('../../models');
const AppError = require('../../utils/AppError');
const catchAsync = require('../../utils/catchAsync');
const { successResponse } = require('../../utils/responseHandler');
const { generateToken } = require('../../utils/helpers');
const { Op } = require('sequelize');

// Admin đăng nhập
const adminLogin = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({
    where: {
      [Op.or]: [{ username }, { email: username }],
      role: 'admin'
    }
  });

  if (!user) {
    return next(new AppError('Thông tin đăng nhập không đúng', 401));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new AppError('Thông tin đăng nhập không đúng', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Tài khoản admin đã bị khóa', 403));
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user.id);

  successResponse(res, {
    user,
    token
  }, 'Đăng nhập admin thành công');
});

// Lấy thông tin admin hiện tại
const getMe = catchAsync(async (req, res) => {
  successResponse(res, { user: req.user });
});

// Đổi mật khẩu admin
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

module.exports = {
  adminLogin,
  getMe,
  changePassword
};