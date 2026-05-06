const { numberMap, unitMap } = require('../utils/malayalamDictionary');

/**
 * Intelligent parser that extracts quantity and unit from Malayalam text
 * and returns the remaining text for fuzzy product matching.
 */
const parseVoiceText = (text) => {
  let quantity = 1;
  let unit = 'piece';
  let cleanedText = text.toLowerCase().trim();

  // 1. Try to extract numeric quantity (e.g., "2 kg")
  const numericMatch = cleanedText.match(/(\d+(\.\d+)?)/);
  if (numericMatch) {
    quantity = parseFloat(numericMatch[0]);
    cleanedText = cleanedText.replace(numericMatch[0], '').trim();
  } else {
    // Try to extract quantity using dictionary (e.g., "രണ്ട്")
    for (const [key, value] of Object.entries(numberMap)) {
      if (cleanedText.includes(key)) {
        quantity = value;
        cleanedText = cleanedText.replace(key, '').trim();
        break;
      }
    }
  }

  // 2. Try to extract unit using dictionary (supports ml and en)
  // We sort keys by length to match "kg" before "g" etc.
  const sortedUnitKeys = Object.keys(unitMap).sort((a, b) => b.length - a.length);
  for (const key of sortedUnitKeys) {
    const value = unitMap[key];
    // Match whole word for short units like "kg", "l", "g"
    const isShort = key.length <= 2;
    const regex = isShort ? new RegExp(`\\b${key}\\b`, 'i') : new RegExp(key, 'i');
    
    if (regex.test(cleanedText)) {
      unit = value;
      cleanedText = cleanedText.replace(regex, '').trim();
      break;
    }
  }

  // 3. Clean up common connector words
  const noiseWords = ['എനിക്ക്', 'വേണം', 'ഓർഡർ', 'ചെയ്യണം', 'please', 'add', 'to', 'cart'];
  noiseWords.forEach(word => {
    cleanedText = cleanedText.replace(word, '').trim();
  });

  return {
    quantity,
    unit,
    productQuery: cleanedText || text, // The "core" product name like "അരി"
    originalText: text
  };
};

module.exports = { parseVoiceText };
