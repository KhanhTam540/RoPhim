const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminDirectorController = require('../../controllers/admin/adminDirectorController');
const { protect, restrictToAdmin } = require('../../middleware/authMiddleware');
const { uploadSingle } = require('../../middleware/uploadMiddleware');
const validate = require('../../middleware/validateMiddleware');

router.use(protect, restrictToAdmin);

const directorValidation = [
  body('name').notEmpty().withMessage('Tên đạo diễn không được để trống'),
  body('nationality').optional(),
  body('bio').optional()
];

router.get('/', adminDirectorController.getAllDirectors);
router.get('/:directorId', adminDirectorController.getDirectorById);
router.post('/', uploadSingle('avatar'), directorValidation, validate, adminDirectorController.createDirector);
router.put('/:directorId', uploadSingle('avatar'), directorValidation, validate, adminDirectorController.updateDirector);
router.delete('/:directorId', adminDirectorController.deleteDirector);
router.patch('/:directorId/toggle-status', adminDirectorController.toggleDirectorStatus);

module.exports = router;