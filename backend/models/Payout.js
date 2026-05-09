const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  shopkeeperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper', required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  transactionReference: { type: String }, // Optional manual reference
  status: { type: String, enum: ['pending', 'completed'], default: 'completed' }
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);
