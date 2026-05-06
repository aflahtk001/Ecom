const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shopkeeperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper' }, // A cart is typically tied to one shop to checkout
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
