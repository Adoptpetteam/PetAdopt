const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    description: { type: String, trim: true },
    category: { type: String, trim: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text' });

module.exports = mongoose.model('Product', productSchema);

