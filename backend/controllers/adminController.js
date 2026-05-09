const Shopkeeper = require('../models/Shopkeeper');
const User = require('../models/User');
const Order = require('../models/Order');
const Payout = require('../models/Payout');

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
    
    // Platform Revenue calculated as 1% of Total Payouts Disbursed
    const payouts = await Payout.find({});
    const totalPayouts = payouts.reduce((acc, p) => acc + (p.amount || 0), 0);
    const platformRevenue = totalPayouts * 0.01;

    // --- Chart Data Computations ---
    
    // User Distribution
    const ruralUsers = await User.countDocuments({ role: 'user' });
    const admins = await User.countDocuments({ role: 'admin' });
    const shopkeepersCount = await Shopkeeper.countDocuments();
    
    // Generate last 6 months list
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      last6Months.push({ month: d.getMonth(), year: d.getFullYear() });
    }

    const stores = await Shopkeeper.find({});
    
    const storeGrowthData = last6Months.map(m => {
      return stores.filter(s => {
        const d = new Date(s.createdAt);
        return d.getMonth() === m.month && d.getFullYear() === m.year;
      }).length;
    });

    const userOrdersData = last6Months.map(m => {
      return orders.filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === m.month && d.getFullYear() === m.year;
      }).reduce((acc, order) => acc + (order.totalAmount || 0), 0);
    });

    const shopkeeperRevenueData = userOrdersData.map(val => val * 0.95);

    res.json({
      totalUsers,
      totalStores,
      totalOrders,
      platformRevenue,
      charts: {
        userDistribution: [ruralUsers, shopkeepersCount, admins],
        storeGrowth: storeGrowthData,
        revenueTrends: {
          userOrders: userOrdersData,
          shopkeeperRevenue: shopkeeperRevenueData
        }
      }
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

// @desc    Get admin financial ledger (payments received & payouts)
// @route   GET /api/admin/ledger?period=day|month|year&date=...&month=...&year=...
const getLedger = async (req, res) => {
  try {
    const { period, date, month, year } = req.query;

    let periodStart, periodEnd;
    const now = new Date();

    if (period === 'day') {
      const d = date ? new Date(date) : now;
      periodStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      periodEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    } else if (period === 'month') {
      // month format: YYYY-MM
      let y, m;
      if (month) {
        [y, m] = month.split('-').map(Number);
      } else {
        y = now.getFullYear();
        m = now.getMonth() + 1;
      }
      periodStart = new Date(y, m - 1, 1);
      periodEnd = new Date(y, m, 0, 23, 59, 59, 999);
    } else if (period === 'year') {
      const y = year ? Number(year) : now.getFullYear();
      periodStart = new Date(y, 0, 1);
      periodEnd = new Date(y, 11, 31, 23, 59, 59, 999);
    }

    // 1. Fetch All Data to compute cumulative balance and period activity
    const orders = await Order.find({ paymentStatus: 'completed' }).populate('shopkeeperId', 'storeName ownerName');
    const payouts = await Payout.find({}).populate('shopkeeperId', 'storeName ownerName');
    const shopkeepers = await Shopkeeper.find({}).select('storeName ownerName');

    const storeLedgerMap = {};

    // Initialize map with all shopkeepers
    shopkeepers.forEach(s => {
      storeLedgerMap[s._id.toString()] = {
        shopkeeperId: s._id.toString(),
        storeName: s.storeName,
        ownerName: s.ownerName,
        totalSales: 0, // Period Specific
        totalPaid: 0,  // Period Specific
        totalSalesAllTime: 0,
        totalPaidAllTime: 0,
        pendingBalance: 0
      };
    });

    orders.forEach(order => {
      const shopId = order.shopkeeperId?._id?.toString();
      if (!shopId || !storeLedgerMap[shopId]) return;

      // Cumulative
      storeLedgerMap[shopId].totalSalesAllTime += order.totalAmount;

      // Period Specific
      if (!periodStart || (order.createdAt >= periodStart && order.createdAt <= periodEnd)) {
        storeLedgerMap[shopId].totalSales += order.totalAmount;
      }
    });

    payouts.forEach(payout => {
      const shopId = payout.shopkeeperId?._id?.toString();
      if (!shopId || !storeLedgerMap[shopId]) return;

      // Cumulative
      storeLedgerMap[shopId].totalPaidAllTime += payout.amount;

      // Period Specific
      if (!periodStart || (payout.createdAt >= periodStart && payout.createdAt <= periodEnd)) {
        storeLedgerMap[shopId].totalPaid += payout.amount;
      }
    });

    const storeLedger = Object.values(storeLedgerMap).map(store => {
      store.pendingBalance = store.totalSalesAllTime - store.totalPaidAllTime;
      return store;
    }).filter(s => s.totalSales > 0 || s.totalPaid > 0 || s.pendingBalance > 0);

    const totalReceivedInPeriod = storeLedger.reduce((acc, s) => acc + s.totalSales, 0);
    const totalPayoutsInPeriod = storeLedger.reduce((acc, s) => acc + s.totalPaid, 0);

    res.json({
      totalReceived: totalReceivedInPeriod,
      totalPayouts: totalPayoutsInPeriod,
      storeLedger,
      period: period || 'all',
      queryRange: { periodStart, periodEnd }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a payout to a shopkeeper
// @route   POST /api/admin/payouts
const createPayout = async (req, res) => {
  try {
    const { shopkeeperId, amount, transactionReference } = req.body;
    
    if (!shopkeeperId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid shopkeeper ID and amount are required' });
    }

    const payout = new Payout({
      shopkeeperId,
      amount,
      transactionReference,
      status: 'completed'
    });

    await payout.save();
    
    res.status(201).json({ message: 'Payout recorded successfully', payout });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPendingStores, updateStoreStatus, getPlatformStats, getAllStores, getAllUsers, deleteUser, getLedger, createPayout };
