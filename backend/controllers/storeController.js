const Shopkeeper = require('../models/Shopkeeper');
const Order = require('../models/Order');
const Payout = require('../models/Payout');
const Product = require('../models/Product');

const getNearbyStores = async (req, res) => {
  try {
    const { lat, lng, distance = 10000 } = req.query; // Default max distance 10km

    if (!lat || !lng) return res.status(400).json({ message: 'Please provide lat and lng query params' });

    const stores = await Shopkeeper.find({
      location: {
        $near: {
          $maxDistance: parseInt(distance),
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          }
        }
      },
      isApproved: true
    }).select('-password').populate('category');

    res.json(stores);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get store's financial ledger (total sales, payouts, pending)
// @route   GET /api/stores/ledger
const getStoreLedger = async (req, res) => {
  try {
    const shopId = req.user.id;
    const orders = await Order.find({ shopkeeperId: shopId, paymentStatus: 'completed' });
    const payouts = await Payout.find({ shopkeeperId: shopId }).sort({ createdAt: -1 });

    const totalSales = orders.reduce((acc, order) => acc + order.totalAmount, 0);
    const totalPaid = payouts.reduce((acc, payout) => acc + payout.amount, 0);
    const pendingBalance = totalSales - totalPaid;

    res.json({
      totalSales,
      totalPaid,
      pendingBalance,
      payouts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get shopkeeper dashboard stats
// @route   GET /api/stores/stats
const getShopkeeperStats = async (req, res) => {
  try {
    const shopId = req.user.id;
    
    const productCount = await Product.countDocuments({ shopkeeperId: shopId });
    const lowStockProducts = await Product.find({ 
      shopkeeperId: shopId, 
      stockQuantity: { $lte: 10 } 
    }).select('name stockQuantity unit');

    const activeOrders = await Order.countDocuments({ 
      shopkeeperId: shopId, 
      orderStatus: { $ne: 'delivered' },
      paymentStatus: 'completed' 
    });
    
    const completedOrders = await Order.find({ 
      shopkeeperId: shopId, 
      paymentStatus: 'completed' 
    }).populate('products.productId', 'name');

    const totalSales = completedOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
    const revenue = totalSales * 0.95; // 95% of sales (5% platform fee)

    // --- Chart Data ---
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      last6Months.push({ month: d.getMonth(), year: d.getFullYear() });
    }

    const salesData = last6Months.map(m => {
      return completedOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === m.month && d.getFullYear() === m.year;
      }).reduce((acc, order) => acc + (order.totalAmount || 0), 0);
    });

    const revenueData = salesData.map(val => val * 0.95);

    // Top Products
    const productSalesMap = {};
    completedOrders.forEach(order => {
      order.products.forEach(item => {
        const name = item.productId?.name || 'Unknown Product';
        productSalesMap[name] = (productSalesMap[name] || 0) + item.quantity;
      });
    });

    const topProducts = Object.entries(productSalesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    res.json({
      totalSales,
      activeOrders,
      productCount,
      lowStockProducts,
      revenue,
      charts: {
        sales: salesData,
        revenue: revenueData,
        topProducts: {
          labels: topProducts.map(tp => tp[0]),
          data: topProducts.map(tp => tp[1])
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNearbyStores, getStoreLedger, getShopkeeperStats };
