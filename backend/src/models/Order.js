const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // Thông tin biến thể (nếu có)
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    
    variantName: {
      type: String,
      trim: true // Ví dụ: "1kg - Vị gà"
    },
    
    variantAttributes: {
      size: String,
      weight: String,
      flavor: String,
      color: String,
      age: String
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: [
        'pending', 
        'confirmed', 
        'paid', 
        'shipping', 
        'completed', 
        'cancelled',
        'refund_pending',
        'refund_processing', 
        'refund_completed',
        'return_requested',
        'return_shipping',
        'return_received',
        'exchange_requested',
        'exchange_shipping',
        'exchange_completed'
      ],
      default: 'pending',
    },

    statusHistory: [
      {
        status: { type: String },
        changedAt: { type: Date, default: Date.now },
        note: { type: String, default: '' },
        _id: false,
      },
    ],
    paymentMethod: {
      type: String,
      enum: ['cod', 'vnpay'],
      required: true,
    },

    vnpayTxnRef: {
      type: String,
      index: true,
    },

    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },

      reason: {
        type: String,
        trim: true,
      },
    },

    items: {
      type: [orderItemSchema],
      default: [],
    },

    totals: {
      subtotal: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      discount: {
        type: Number,
        default: 0,
        min: 0,
      },

      total: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
    },

    voucher: {
      code: { type: String, default: null },
      discount: { type: Number, default: 0 },
    },

    // Thông tin hoàn trả/đổi hàng
    refund: {
      reason: { type: String, trim: true },
      requestedAt: { type: Date },
      requestedBy: { 
        type: String, 
        enum: ['user', 'admin'],
      },
      bankAccount: { type: String, trim: true },
      bankName: { type: String, trim: true },
      accountHolder: { type: String, trim: true },
      qrCodeImage: { type: String }, // URL ảnh QR code
      processedAt: { type: Date },
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      amount: { type: Number, min: 0 },
      note: { type: String, trim: true }
    },

    returnExchange: {
      type: { 
        type: String, 
        enum: ['return', 'exchange'],
      },
      reason: { type: String, trim: true },
      requestedAt: { type: Date },
      images: [{ type: String }], // Ảnh chứng minh sản phẩm lỗi
      trackingNumber: { type: String, trim: true }, // Mã vận đơn trả hàng
      receivedAt: { type: Date },
      inspectionNote: { type: String, trim: true }, // Ghi chú kiểm tra hàng
      newOrderId: { // Đơn hàng mới khi đổi hàng
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      }
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
