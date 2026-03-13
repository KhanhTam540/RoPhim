const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validateMiddleware');
const { updateProfileValidation, changePasswordValidation } = require('../validations/userValidation');

router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', updateProfileValidation, validate, userController.updateProfile);
router.post('/change-password', changePasswordValidation, validate, userController.changePassword);
router.post('/avatar', uploadSingle('avatar'), userController.uploadAvatar);
router.get('/history', userController.getHistory);
router.get('/favorites', userController.getFavorites);

module.exports = router;