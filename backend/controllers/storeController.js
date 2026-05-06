const Shopkeeper = require('../models/Shopkeeper');

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

module.exports = { getNearbyStores };
