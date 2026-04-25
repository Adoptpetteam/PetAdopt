const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên thú cưng'],
    trim: true
  },
  species: {
    type: String,
    required: [true, 'Vui lòng chọn loại thú cưng'],
    enum: ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'other']
  },
  breed: {
    type: String,
    trim: true
  },
  age: {
    type: Number,
    min: 0
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'unknown']
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium'
  },
  color: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  healthStatus: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'needs_care'],
    default: 'good'
  },
  vaccinated: {
    type: Boolean,
    default: false
  },
  neutered: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['available', 'adopted', 'pending', 'reserved'],
    default: 'available'
  },
  adoptionFee: {
    type: Number,
    min: 0,
    default: 0
  },
  location: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

petSchema.index({ name: 'text', breed: 'text', description: 'text' });
petSchema.index({ species: 1, status: 1 });
petSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Pet', petSchema);
