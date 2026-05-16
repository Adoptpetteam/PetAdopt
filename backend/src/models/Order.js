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
      enum: ['pending', 'confirmed', 'paid', 'shipping', 'completed', 'cancelled'],
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
