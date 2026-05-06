const express = require('express');
const router = express.Router();
const { getCategories, addCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/', getCategories);
router.post('/', protect, authorizeRoles('admin'), addCategory);
router.delete('/:id', protect, authorizeRoles('admin'), deleteCategory);

module.exports = router;

