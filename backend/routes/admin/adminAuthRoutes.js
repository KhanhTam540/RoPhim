const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminAuthController = require('../../controllers/admin/adminAuthController');
const { protect, restrictToAdmin } = require('../../middleware/authMiddleware');
const validate = require('../../middleware/validateMiddleware');

const loginValidation = [
  body('username').notEmpty().withMessage('Username không được để trống'),
  body('password').notEmpty().withMessage('Mật khẩu không được để trống')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Mật khẩu hiện tại không được để trống'),
  body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
];

router.post('/login', loginValidation, validate, adminAuthController.adminLogin);
router.get('/me', protect, restrictToAdmin, adminAuthController.getMe);
router.post('/change-password', protect, restrictToAdmin, changePasswordValidation, validate, adminAuthController.changePassword);

module.exports = router;