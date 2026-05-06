/**
 * Advanced Local Suggestion Engine for GramaBazaar
 * Provides highly category-specific and seasonal business advice.
 */

const categoryMatrix = {
  grocery: {
    monsoon: [
      { product: 'Dry Provisions', reason: 'Customers stock up on staples to avoid rain travel.' },
      { product: 'Ayurvedic Wellness Herbs', reason: 'High demand for health-boosting spices during rain.' },
      { product: 'Battery & Torches', reason: 'Monsoon power outages drive demand for lighting.' }
    ],
    summer: [
      { product: 'Cold Drinks & Sherbets', reason: 'High demand for hydration during Kerala heat.' },
      { product: 'Vishu Sadhya Kits', reason: 'Pre-packaged ingredients for the Vishu festival.' },
      { product: 'Ice Cream & Curd', reason: 'Dairy cooling products sell 40% more in summer.' }
    ],
    harvest: [
      { product: 'Premium Feast Rice', reason: 'Onam Sadhya requires high-quality long grain rice.' },
      { product: 'Vegetable Oil Buckets', reason: 'High frying volume during festival cooking.' },
      { product: 'Jaggery & Coconut', reason: 'Essential for traditional Payasam preparation.' }
    ],
    general: [
      { product: 'Coconut Oil (Refined)', reason: 'A daily staple for every Kerala kitchen.' },
      { product: 'Tea & Coffee Packs', reason: 'Consistent high-turnover morning essentials.' },
      { product: 'Pulses & Lentils', reason: 'Core protein source with steady daily sales.' }
    ]
  },
  bakery: {
    monsoon: [
      { product: 'Hot Tea-time Snacks', reason: 'Pazham Pori and Vada demand peaks in rainy weather.' },
      { product: 'Fresh Breads & Rusk', reason: 'Comfort food during damp monsoon evenings.' }
    ],
    summer: [
      { product: 'Fresh Fruit Juices', reason: 'Natural cooling drinks are preferred over sodas.' },
      { product: 'Light Pastries', reason: 'Customers prefer lighter cream during hot months.' }
    ],
    harvest: [
      { product: 'Onam Special Sweets', reason: 'Traditional sweets for gifting and feasting.' },
      { product: 'Gift Hampers', reason: 'Ready-made snack boxes for festival visits.' }
    ],
    general: [
      { product: 'Birthday Cakes', reason: 'Steady year-round demand for celebrations.' },
      { product: 'Cookies & Biscuits', reason: 'High-margin items with long shelf life.' }
    ]
  },
  stationery: {
    monsoon: [
      { product: 'Umbrellas & Raincoats', reason: 'School/Office season starting in June with rains.' },
      { product: 'Waterproof Bag Covers', reason: 'Protection for books and laptops during downpours.' }
    ],
    summer: [
      { product: 'Summer Vacation Books', reason: 'Activity books for children during holidays.' },
      { product: 'Arts & Crafts Kits', reason: 'Creative indoor projects during peak heat.' }
    ],
    general: [
      { product: 'Notebooks & Pens', reason: 'Daily essentials for students and local offices.' },
      { product: 'Mobile Recharge/Services', reason: 'Drives footfall for other stationery sales.' }
    ]
  },
  textile: {
    monsoon: [
      { product: 'Heavy Cotton Wear', reason: 'Comfortable and warm for the cooler rainy season.' }
    ],
    summer: [
      { product: 'Light Linen & Cotton', reason: 'Essential for the humid Kerala summer heat.' },
      { product: 'Vishu Mundu & Sarees', reason: 'Traditional wear for the new year festival.' }
    ],
    harvest: [
      { product: 'Onam Kasavu Collection', reason: 'Peak season for traditional Kerala sarees and mundu.' },
      { product: 'Festive Gift Sets', reason: 'Ready-to-wear clothing for family gifting.' }
    ],
    general: [
      { product: 'Daily Wear Items', reason: 'Casual clothing for consistent weekly revenue.' }
    ]
  }
};

const getLocalSuggestions = async (categoryName) => {
  const month = new Date().getMonth(); // 0-11
  let season = 'general';
  
  if (month >= 5 && month <= 7) season = 'monsoon';
  else if (month >= 7 && month <= 8) season = 'harvest';
  else if (month >= 2 && month <= 4) season = 'summer';

  // Normalize category name
  const cat = categoryName.toLowerCase();
  let key = 'grocery'; // Default
  
  if (cat.includes('bakery')) key = 'bakery';
  else if (cat.includes('stationery')) key = 'stationery';
  else if (cat.includes('textile') || cat.includes('fashion')) key = 'textile';
  else if (cat.includes('grocery')) key = 'grocery';

  const categoryData = categoryMatrix[key];
  const suggestions = categoryData[season] || categoryData['general'];

  // If seasonal is too short, pad with general items
  if (suggestions.length < 3) {
    const general = categoryData['general'].filter(g => !suggestions.includes(g));
    return [...suggestions, ...general].slice(0, 3);
  }

  return suggestions.slice(0, 3);
};

module.exports = { getLocalSuggestions };
