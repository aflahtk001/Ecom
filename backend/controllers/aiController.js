const { getLocalSuggestions } = require('../services/suggestionService');
const Shopkeeper = require('../models/Shopkeeper');

/**
 * Provides intelligent business suggestions to shopkeepers.
 * Switched from Gemini LLM to Local Rule-based engine for speed and reliability.
 */
const getShopSuggestions = async (req, res) => {
  try {
    const shopkeeper = await Shopkeeper.findById(req.user.id).populate('category');
    const categoryName = shopkeeper?.category?.name || 'general store';

    // Local engine is instant and doesn't hit API limits
    const suggestions = await getLocalSuggestions(categoryName);
    
    res.json({ 
      success: true,
      suggestions,
      engine: 'GramaBazaar Local Intelligence'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getShopSuggestions };
