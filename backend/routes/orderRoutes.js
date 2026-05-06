const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getShopkeeperOrders, updateOrderStatus, getUserOrders } = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/shopkeeper', protect, authorizeRoles('shopkeeper'), getShopkeeperOrders);
router.get('/my', protect, authorizeRoles('user'), getUserOrders);
router.put('/:id/status', protect, authorizeRoles('shopkeeper'), updateOrderStatus);

module.exports = router;

