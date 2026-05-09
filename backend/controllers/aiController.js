const { generateSeasonalSuggestions } = require('../services/geminiService');
const Shopkeeper = require('../models/Shopkeeper');

/**
 * Provides intelligent business suggestions to shopkeepers using Google Gemini AI.
 */
const getShopSuggestions = async (req, res) => {
  try {
    const shopkeeper = await Shopkeeper.findById(req.user.id).populate('category');
    const categoryName = shopkeeper?.category?.name || 'general store';

    // Use Gemini AI for real-time, context-aware seasonal suggestions
    const suggestions = await generateSeasonalSuggestions(categoryName);
    
    res.json({ 
      success: true,
      suggestions,
      engine: 'Google Gemini 2.0 AI'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getShopSuggestions };
