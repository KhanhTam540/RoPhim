const { body } = require('express-validator');

const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username phải từ 3-50 ký tự')
    .isAlphanumeric()
    .withMessage('Username chỉ được chứa chữ và số'),
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Họ tên phải từ 2-100 ký tự')
];

const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username hoặc email không được để trống'),
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu không được để trống')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail()
];

const resetPasswordValidation = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
};