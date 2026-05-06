const Shopkeeper = require('../models/Shopkeeper');
const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Get all pending store approvals
// @route   GET /api/admin/stores/pending
const getPendingStores = async (req, res) => {
  try {
    const pendingStores = await Shopkeeper.find({ isApproved: false })
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(pendingStores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or reject a store
// @route   PUT /api/admin/stores/:id/status
const updateStoreStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'approve' or 'reject'
    const store = await Shopkeeper.findById(req.params.id);

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    if (status === 'approve') {
      store.isApproved = true;
      await store.save();
      res.json({ message: 'Store approved successfully', store });
    } else if (status === 'reject') {
      await store.deleteOne(); // Or flag it as rejected based on your business logic
      res.json({ message: 'Store application rejected' });
    } else {
      res.status(400).json({ message: 'Invalid status action' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get platform statistics
// @route   GET /api/admin/stats
const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStores = await Shopkeeper.countDocuments({ isApproved: true });
    const totalOrders = await Order.countDocuments();
    
    // Simple revenue aggregation
    const orders = await Order.find({ paymentStatus: 'completed' });
    const platformRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0) * 0.05; // Assuming 5% platform fee

    res.json({
      totalUsers,
      totalStores,
      totalOrders,
      platformRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all stores (approved)
// @route   GET /api/admin/stores
const getAllStores = async (req, res) => {
  try {
    const stores = await Shopkeeper.find({})
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .select('-password');
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPendingStores, updateStoreStatus, getPlatformStats, getAllStores, getAllUsers, deleteUser };
