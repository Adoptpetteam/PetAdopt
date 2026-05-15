const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    name: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    message: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    paymentMethod: { type: String, default: 'vnpay' },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', donationSchema);
