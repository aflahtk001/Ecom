const express = require('express');
const router = express.Router();
const { getShopOffers, createOffer, deleteOffer } = require('../controllers/offerController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/shop/:shopId', getShopOffers);
router.post('/', protect, authorizeRoles('shopkeeper'), createOffer);
router.delete('/:id', protect, authorizeRoles('shopkeeper'), deleteOffer);

module.exports = router;
