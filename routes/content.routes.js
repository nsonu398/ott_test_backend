// routes/content.routes.js
const router = require('express').Router();
const contentController = require('../controllers/content.controller');

// Get all videos
router.get('/', contentController.getAllVideos);

// Get a specific video by ID
router.get('/:id', contentController.getVideoById);

module.exports = router;