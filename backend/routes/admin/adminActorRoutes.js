const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminActorController = require('../../controllers/admin/adminActorController');
const { protect, restrictToAdmin } = require('../../middleware/authMiddleware');
const { uploadSingle } = require('../../middleware/uploadMiddleware');
const validate = require('../../middleware/validateMiddleware');

router.use(protect, restrictToAdmin);

const actorValidation = [
  body('name').notEmpty().withMessage('Tên diễn viên không được để trống'),
  body('nationality').optional(),
  body('bio').optional()
];

router.get('/', adminActorController.getAllActors);
router.get('/:actorId', adminActorController.getActorById);
router.post('/', uploadSingle('avatar'), actorValidation, validate, adminActorController.createActor);
router.put('/:actorId', uploadSingle('avatar'), actorValidation, validate, adminActorController.updateActor);
router.delete('/:actorId', adminActorController.deleteActor);
router.patch('/:actorId/toggle-status', adminActorController.toggleActorStatus);

module.exports = router;