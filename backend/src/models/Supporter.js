const mongoose = require('mongoose');

const supporterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên người ủng hộ là bắt buộc'],
    trim: true
  },
  
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    trim: true,
    lowercase: true
  },
  
  phone: {
    type: String,
    trim: true
  },
  
  amount: {
    type: Number,
    required: [true, 'Số tiền ủng hộ là bắt buộc'],
    min: [1000, 'Số tiền tối thiểu là 1,000 VND']
  },
  
  message: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  paymentMethod: {
    type: String,
    enum: ['vnpay', 'bank_transfer', 'cash'],
    default: 'vnpay'
  },
  
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  
  vnpayData: {
    orderId: String,
    responseCode: String,
    transactionNo: String,
    bankCode: String,
    cardType: String,
    payDate: String
  },
  
  isAnonymous: {
    type: Boolean,
    default: false
  },
  
  displayName: {
    type: String,
    trim: true
  }
  
}, {
  timestamps: true
});

// Index để tìm kiếm và sắp xếp
supporterSchema.index({ createdAt: -1 });
supporterSchema.index({ amount: -1 });
supporterSchema.index({ status: 1 });
supporterSchema.index({ email: 1 });

// Virtual để hiển thị tên (ẩn danh hoặc thật)
supporterSchema.virtual('publicName').get(function() {
  if (this.isAnonymous) {
    return 'Người ủng hộ ẩn danh';
  }
  return this.displayName || this.name;
});

supporterSchema.set('toJSON', { virtuals: true });
supporterSchema.set('toObject', { virtuals: true });

const Supporter = mongoose.model('Supporter', supporterSchema);

module.exports = Supporter;
