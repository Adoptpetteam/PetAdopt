const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, default: '', trim: true },
    price: { type: Number, required: true, min: [0, 'Giá không hợp lệ'] },
    quantity: { type: Number, required: true, min: [1, 'Số lượng không hợp lệ'] },
  },
  { _id: false }
);

const productOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['momo', 'zalopay'],
    },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      reason: { type: String, required: true, trim: true, maxlength: 1000 },
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [arr => Array.isArray(arr) && arr.length > 0, 'Order items is required'],
    },
    subtotal: { type: Number, required: true, min: [0, 'Subtotal không hợp lệ'] },
    total: { type: Number, required: true, min: [0, 'Total không hợp lệ'] },
    status: {
      type: String,
      required: true,
      enum: ['paid', 'pending', 'cancelled'],
      default: 'paid',
    },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

productOrderSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

productOrderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ProductOrder', productOrderSchema);

