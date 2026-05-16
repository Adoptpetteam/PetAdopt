const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['pet', 'product'],
    required: true,
    default: 'product'
  },
  image: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Tự động tạo createdAt và updatedAt
});

// Index for better performance
categorySchema.index({ type: 1, isActive: 1 });
categorySchema.index({ name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);