const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  shopkeeperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper', required: true },
  name: { type: String, required: true },
  malayalamName: { type: String }, // Used for voice parsing matching
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String },
  image: { type: String }, // Cloudinary URL
  actualCost: { type: Number, required: true },
  sellingCost: { type: Number, required: true },
  stockQuantity: { type: Number, required: true },
  unit: { type: String, required: true }, // e.g., kg, liter, packet
  productImage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
