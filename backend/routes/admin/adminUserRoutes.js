const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminUserController = require('../../controllers/admin/adminUserController');
const { protect, restrictToAdmin } = require('../../middleware/authMiddleware');
const validate = require('../../middleware/validateMiddleware');

router.use(protect, restrictToAdmin);

const userValidation = [
  body('username').optional().isLength({ min: 3 }).withMessage('Username phải có ít nhất 3 ký tự'),
  body('email').optional().isEmail().withMessage('Email không hợp lệ'),
  body('fullName').optional(),
  body('role').optional().isIn(['user', 'admin']).withMessage('Role không hợp lệ')
];

const createUserValidation = [
  body('username').notEmpty().isLength({ min: 3 }).withMessage('Username phải có ít nhất 3 ký tự'),
  body('email').notEmpty().isEmail().withMessage('Email không hợp lệ'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('fullName').notEmpty().withMessage('Họ tên không được để trống')
];

router.get('/', adminUserController.getAllUsers);
router.get('/:userId', adminUserController.getUserById);
router.post('/', createUserValidation, validate, adminUserController.createUser);
router.put('/:userId', userValidation, validate, adminUserController.updateUser);
router.delete('/:userId', adminUserController.deleteUser);
router.patch('/:userId/toggle-status', adminUserController.toggleUserStatus);
router.post('/:userId/reset-password', adminUserController.resetPassword);

module.exports = router;