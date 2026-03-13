const { User } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/responseHandler');
const { generateToken } = require('../utils/helpers');
const { Op } = require('sequelize');
const crypto = require('crypto');

// Đăng ký
const register = catchAsync(async (req, res, next) => {
  const { username, email, password, fullName } = req.body;

  // Kiểm tra username/email đã tồn tại
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
      return next(new AppError('Email đã được sử dụng', 400));
    }
  }

  // Tạo user mới
  const user = await User.create({
    username,
    email,
    password,
    fullName: fullName || username
  });

  // Tạo token
  const token = generateToken(user.id);

  successResponse(res, {
    user,
    token
  }, 'Đăng ký thành công', 201);
});

// Đăng nhập
const login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  // Tìm user
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { username },
        { email: username }
      ]
    }
  });

  if (!user) {
    return next(new AppError('Username hoặc mật khẩu không đúng', 401));
  }

  // Kiểm tra password
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new AppError('Username hoặc mật khẩu không đúng', 401));
  }

  // Kiểm tra active
  if (!user.isActive) {
    return next(new AppError('Tài khoản của bạn đã bị khóa', 403));
  }

  // Cập nhật last login
  user.lastLogin = new Date();
  await user.save();

  // Tạo token
  const token = generateToken(user.id);

  successResponse(res, {
    user,
    token
  }, 'Đăng nhập thành công');
});

// Đăng xuất
const logout = catchAsync(async (req, res) => {
  successResponse(res, null, 'Đăng xuất thành công');
});

// Lấy thông tin user hiện tại
const getMe = catchAsync(async (req, res) => {
  successResponse(res, { user: req.user }, 'Lấy thông tin thành công');
});

// Quên mật khẩu
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return next(new AppError('Không tìm thấy email trong hệ thống', 404));
  }

  // Tạo reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 phút

  await user.save();

  // TODO: Gửi email reset password
  // const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  successResponse(res, {
    message: 'Vui lòng kiểm tra email để đặt lại mật khẩu'
  });
});

// Reset mật khẩu
const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    where: {
      resetPasswordToken,
      resetPasswordExpire: { [Op.gt]: Date.now() }
    }
  });

  if (!user) {
    return next(new AppError('Token không hợp lệ hoặc đã hết hạn', 400));
  }

  // Cập nhật password
  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save();

  successResponse(res, null, 'Đặt lại mật khẩu thành công');
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword
};