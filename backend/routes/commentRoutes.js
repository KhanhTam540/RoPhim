const express = require('express');
const router = express.Router({ mergeParams: true });
const { body } = require('express-validator');
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const commentValidation = [
  body('content').notEmpty().isLength({ min: 1, max: 1000 }).withMessage('Nội dung bình luận không hợp lệ')
];

router.get('/', commentController.getComments);
router.post('/', protect, commentValidation, validate, commentController.addComment);
router.put('/:commentId', protect, commentValidation, validate, commentController.updateComment);
router.delete('/:commentId', protect, commentController.deleteComment);
router.post('/:commentId/like', protect, commentController.likeComment);

module.exports = router;