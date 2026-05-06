const numberMap = {
  'ഒന്ന്': 1, 'ഒരു': 1, 'രണ്ട്': 2, 'രണ്ടു': 2, 'മൂന്ന്': 3, 'നാല്': 4, 'അഞ്ച്': 5,
  'ആറ്': 6, 'ഏഴ്': 7, 'എട്ട്': 8, 'ഒൻപത്': 9, 'പത്ത്': 10, 'അര': 0.5, 'കാൽ': 0.25, 'മുക്കാൽ': 0.75
};

const unitMap = {
  'കിലോ': 'kg', 'kg': 'kg', 'kilo': 'kg', 'kilogram': 'kg',
  'ഗ്രാം': 'g', 'gram': 'g', 'g': 'g',
  'ലിറ്റർ': 'liter', 'liter': 'liter', 'l': 'liter', 'litre': 'liter',
  'മില്ലി': 'ml', 'ml': 'ml', 'milliliter': 'ml',
  'പാക്കറ്റ്': 'packet', 'packet': 'packet', 'pkt': 'packet',
  'എണ്ണം': 'pieces', 'pieces': 'pieces', 'pcs': 'pieces', 'piece': 'pieces', 'nos': 'pieces'
};

const productMap = {
  'അരി': 'rice', 'പാൽ': 'milk', 'പഞ്ചസാര': 'sugar', 'ചായപ്പൊടി': 'tea powder', 'കാപ്പിപ്പൊടി': 'coffee powder',
  'ഉപ്പ്': 'salt', 'വെളിച്ചെണ്ണ': 'coconut oil', 'ഉള്ളി': 'onion', 'തക്കാളി': 'tomato', 'മുളക്': 'chilli'
};

module.exports = { numberMap, unitMap, productMap };
