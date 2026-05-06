const express = require('express');
const router = express.Router();
const { getShopProducts, createProduct, deleteProduct } = require('../controllers/productController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/shop/:shopId', getShopProducts);
router.post('/', protect, authorizeRoles('shopkeeper'), upload.single('image'), createProduct);
router.delete('/:id', protect, authorizeRoles('shopkeeper'), deleteProduct);

module.exports = router;
