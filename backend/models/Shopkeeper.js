const mongoose = require('mongoose');

const shopkeeperSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'shopkeeper' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  storeImage: { type: String },
  isApproved: { type: Boolean, default: false },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  }
}, { timestamps: true });

shopkeeperSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Shopkeeper', shopkeeperSchema);
