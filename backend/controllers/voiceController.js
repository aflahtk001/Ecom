const { parseVoiceText } = require('../services/voiceParser');
const Product = require('../models/Product');
const Shopkeeper = require('../models/Shopkeeper');
const Fuse = require('fuse.js');

const processVoiceOrder = async (req, res) => {
  try {
    const { text, lat, lng } = req.body;
    
    if (!lat || !lng) return res.status(400).json({ message: 'Location is required to find nearby products' });
    if (!text) return res.status(400).json({ message: 'Voice text is required' });

    // 1. Parse quantity/unit and get the "core" product name
    const parsedData = parseVoiceText(text);

    // 2. Find nearby stores (within 5km)
    const stores = await Shopkeeper.find({
      location: {
        $near: {
          $maxDistance: 5000,
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }
        }
      },
      isApproved: true
    }).select('_id');

    if (stores.length === 0) {
      return res.status(404).json({ message: 'No stores found within 5km of your location' });
    }

    const storeIds = stores.map(store => store._id);

    // 3. Fetch ALL products from these stores to do local fuzzy matching
    // (This is much more robust than a rigid database regex search)
    const allNearbyProducts = await Product.find({
      shopkeeperId: { $in: storeIds }
    }).populate('shopkeeperId', 'storeName');

    if (allNearbyProducts.length === 0) {
      return res.status(404).json({ message: 'No products found in nearby stores' });
    }

    // 4. Configure Fuse.js for intelligent matching
    const fuse = new Fuse(allNearbyProducts, {
      keys: [
        { name: 'malayalamName', weight: 0.7 }, // Prioritize Malayalam matching
        { name: 'name', weight: 0.3 }          // Then English
      ],
      threshold: 0.4, // Adjust for sensitivity (lower is stricter)
      includeScore: true
    });

    // 5. Search for the best match
    const results = fuse.search(parsedData.productQuery);

    if (results.length === 0) {
      return res.status(404).json({ 
        message: `Could not find "${parsedData.productQuery}" in nearby stores`,
        parsedData 
      });
    }

    // 6. Return all top matches sorted by price (best score first)
    // We filter to matches within 0.15 score of the best match to ensure quality
    const topMatchScore = results[0].score;
    const bestMatches = results
      .filter(r => (r.score - topMatchScore) < 0.15)
      .slice(0, 5) // Limit to 5 options for UI clarity
      .map(r => ({
        ...r.item,
        matchScore: r.score
      }));

    res.json({
      success: true,
      parsedData,
      matches: bestMatches
    });

  } catch (error) { 
    console.error('Voice Processing Error:', error);
    res.status(500).json({ message: 'Error processing voice command' }); 
  }
};

module.exports = { processVoiceOrder };
