const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        'order_cancelled',
        'order_refund_required',
        'order_status_update',
        'refund_approved',
        'refund_completed',
        'voucher_received',
        'general',
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Liên kết tới đơn hàng (nếu có)
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },

    // Liên kết tới refund request (nếu có)
    refundRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RefundRequest',
      default: null,
    },

    // Đã đọc chưa
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    // Metadata bổ sung (lý do hủy, số tiền, ...)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Action buttons (vd: "Cập nhật thông tin hoàn tiền")
    actionUrl: {
      type: String,
      default: null,
    },

    actionLabel: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
