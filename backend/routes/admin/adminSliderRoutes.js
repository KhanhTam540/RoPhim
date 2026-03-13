const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminSliderController = require('../../controllers/admin/adminSliderController');
const { protect, restrictToAdmin } = require('../../middleware/authMiddleware');
const { uploadSingle } = require('../../middleware/uploadMiddleware');
const validate = require('../../middleware/validateMiddleware');

router.use(protect, restrictToAdmin);

const sliderValidation = [
  body('title').optional(),
  body('order').optional().isInt().withMessage('Thứ tự phải là số'),
  body('movieId').optional().isInt().withMessage('ID phim không hợp lệ')
];

router.get('/', adminSliderController.getAllSliders);
router.get('/:sliderId', adminSliderController.getSliderById);
router.post('/', uploadSingle('image'), sliderValidation, validate, adminSliderController.createSlider);
router.put('/:sliderId', uploadSingle('image'), sliderValidation, validate, adminSliderController.updateSlider);
router.delete('/:sliderId', adminSliderController.deleteSlider);
router.post('/reorder', adminSliderController.reorderSliders);
router.patch('/:sliderId/toggle-status', adminSliderController.toggleSliderStatus);

module.exports = router;