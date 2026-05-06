const express = require('express');
const router = express.Router();
const { getShopSuggestions } = require('../controllers/aiController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/suggestions', protect, authorizeRoles('shopkeeper'), getShopSuggestions);

module.exports = router;
