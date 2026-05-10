const express = require('express');
const router = express.Router();
const { getShopProducts, createProduct, deleteProduct, updateProduct } = require('../controllers/productController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/shop/:shopId', getShopProducts);
router.post('/', protect, authorizeRoles('shopkeeper'), upload.single('image'), createProduct);
router.put('/:id', protect, authorizeRoles('shopkeeper'), upload.single('image'), updateProduct);
router.delete('/:id', protect, authorizeRoles('shopkeeper'), deleteProduct);

module.exports = router;
