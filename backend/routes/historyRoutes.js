const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', historyController.getHistory);
router.post('/', historyController.addToHistory);
router.delete('/:historyId', historyController.removeFromHistory);
router.delete('/', historyController.clearHistory);

module.exports = router;