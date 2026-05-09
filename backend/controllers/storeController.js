const Shopkeeper = require('../models/Shopkeeper');
const Order = require('../models/Order');
const Payout = require('../models/Payout');

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

module.exports = { getNearbyStores, getStoreLedger };
