const express = require('express');
const router = express.Router();
const actorController = require('../controllers/actorController');

router.get('/', actorController.getActors);
router.get('/:slug', actorController.getActorBySlug);

module.exports = router;