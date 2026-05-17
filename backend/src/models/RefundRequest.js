const mongoose = require('mongoose');

const refundRequestSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    cancelReason: { type: String, required: true, trim: true },
    originalPaymentMethod: {
      type: String,
      enum: ['cod', 'vnpay'],
      required: true,
    },
    bankInfo: {
      bankName:      { type: String, trim: true, default: '' },
      accountNumber: { type: String, trim: true, default: '' },
      accountHolder: { type: String, trim: true, default: '' },
      qrCodeImage:   { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['awaiting_info', 'pending', 're_enter_info', 'processing', 'completed', 'rejected'],
      default: 'awaiting_info',
      index: true,
    },
    submittedAt:  { type: Date, default: null },
    processedAt:  { type: Date, default: null },
    processedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    adminNote:    { type: String, trim: true, default: '' },
    transactionRef: { type: String, trim: true, default: '' },
    billImage:    { type: String, default: '' },
  },
  { timestamps: true }
);

refundRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('RefundRequest', refundRequestSchema);
