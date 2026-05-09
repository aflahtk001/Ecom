const express = require('express');
const router = express.Router();
const { getNearbyStores, getStoreLedger } = require('../controllers/storeController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/nearby', protect, getNearbyStores);
router.get('/ledger', protect, getStoreLedger);

module.exports = router;
