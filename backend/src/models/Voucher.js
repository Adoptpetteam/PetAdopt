const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    type: {
      type: String,
      enum: ['percent', 'fixed'],
      required: true,
    },

    value: {
      type: Number,
      required: true,
      min: 0,
    },

    // Chỉ áp dụng cho type=percent: giảm tối đa bao nhiêu đồng
    maxDiscount: {
      type: Number,
      default: 0, // 0 = không giới hạn
    },

    // Đơn hàng tối thiểu để dùng voucher
    minOrder: {
      type: Number,
      default: 0,
    },

    // Tổng số lần voucher được dùng (0 = không giới hạn)
    usageLimit: {
      type: Number,
      default: 0,
    },

    // Đã dùng bao nhiêu lần
    usedCount: {
      type: Number,
      default: 0,
    },

    // Mỗi user dùng tối đa bao nhiêu lần (0 = không giới hạn)
    userLimit: {
      type: Number,
      default: 1,
    },

    // Danh sách user đã dùng: [{ userId, usedAt }]
    usedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        usedAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// unique: true ở field definition đã tạo index rồi, không cần khai báo thêm
// voucherSchema.index({ code: 1 });

module.exports = mongoose.model('Voucher', voucherSchema);
