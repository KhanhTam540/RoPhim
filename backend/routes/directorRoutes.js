const express = require('express');
const router = express.Router();
const directorController = require('../controllers/directorController');

router.get('/', directorController.getDirectors);
router.get('/:slug', directorController.getDirectorBySlug);

module.exports = router;