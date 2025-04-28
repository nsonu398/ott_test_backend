// routes/index.js
const router = require('express').Router();
const contentRoutes = require('./content.routes');
const streamRoutes = require('./stream.routes');

router.use('/videos', contentRoutes);
router.use('/stream', streamRoutes);

module.exports = router;