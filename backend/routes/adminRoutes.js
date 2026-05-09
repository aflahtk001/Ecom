const express = require('express');
const router = express.Router();
const { getPendingStores, updateStoreStatus, getPlatformStats, getAllStores, getAllUsers, deleteUser, getLedger, createPayout } = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

// All admin routes must be protected and restricted to 'admin' role
router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/stores/pending', getPendingStores);
router.get('/stores', getAllStores);
router.put('/stores/:id/status', updateStoreStatus);
router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/ledger', getLedger);
router.post('/payouts', createPayout);

module.exports = router;
