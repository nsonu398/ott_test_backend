// routes/stream.routes.js
const router = require('express').Router();
const streamController = require('../controllers/stream.controller');

// Stream a video by ID
router.get('/:id', streamController.streamVideo);

module.exports = router;