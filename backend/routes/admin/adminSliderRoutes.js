const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminSliderController = require('../../controllers/admin/adminSliderController');
const { protect, restrictToAdmin } = require('../../middleware/authMiddleware');
const { uploadSingle } = require('../../middleware/uploadMiddleware');
const validate = require('../../middleware/validateMiddleware');

// Tất cả routes đều cần auth và admin
router.use(protect, restrictToAdmin);

const sliderValidation = [
  body('title').optional().trim(),
  body('order').optional().isInt().withMessage('Thứ tự phải là số'),
  body('movieId').optional().isInt().withMessage('ID phim không hợp lệ'),
  body('link').optional().isURL().withMessage('Link không hợp lệ').optional({ nullable: true }),
  body('description').optional().trim(),
  body('buttonText').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('Trạng thái không hợp lệ')
];

// GET all sliders
router.get('/', adminSliderController.getAllSliders);

// GET single slider
router.get('/:sliderId', adminSliderController.getSliderById);

// POST create slider
router.post('/', 
  uploadSingle('image'), 
  sliderValidation, 
  validate, 
  adminSliderController.createSlider
);

// PUT update slider
router.put('/:sliderId', 
  uploadSingle('image'), 
  sliderValidation, 
  validate, 
  adminSliderController.updateSlider
);

// DELETE slider
router.delete('/:sliderId', adminSliderController.deleteSlider);

// POST reorder sliders
router.post('/reorder', adminSliderController.reorderSliders);

// PATCH toggle status
router.patch('/:sliderId/toggle-status', adminSliderController.toggleSliderStatus);

module.exports = router;