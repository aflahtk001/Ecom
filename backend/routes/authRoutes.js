const express = require('express');
const router = express.Router();
const { registerUser, loginUser, registerShopkeeper, loginShopkeeper, loginAdmin } = require('../controllers/authController');

router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.post('/shopkeeper/register', registerShopkeeper);
router.post('/shopkeeper/login', loginShopkeeper);
router.post('/admin/login', loginAdmin);

module.exports = router;
