const express = require('express');
const router = express.Router();
const { getNearbyStores, getStoreLedger, getShopkeeperStats } = require('../controllers/storeController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/nearby', protect, getNearbyStores);
router.get('/ledger', protect, getStoreLedger);
router.get('/stats', protect, getShopkeeperStats);

module.exports = router;
