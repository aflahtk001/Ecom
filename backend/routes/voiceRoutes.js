const express = require('express');
const router = express.Router();
const { processVoiceOrder } = require('../controllers/voiceController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/process', protect, processVoiceOrder);

module.exports = router;
