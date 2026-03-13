const { body } = require('express-validator');

const updateProfileValidation = [
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Họ tên phải từ 2-100 ký tự'),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences phải là object')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mật khẩu hiện tại không được để trống'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
];

module.exports = {
  updateProfileValidation,
  changePasswordValidation
};