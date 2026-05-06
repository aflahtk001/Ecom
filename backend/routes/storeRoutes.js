const express = require('express');
const router = express.Router();
const { getNearbyStores } = require('../controllers/storeController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/nearby', protect, getNearbyStores);

module.exports = router;
