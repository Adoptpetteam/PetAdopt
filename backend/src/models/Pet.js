const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên thú cưng'],
      trim: true
    },
    age: {
      type: Number,
      min: [0, 'Tuổi không hợp lệ'],
      default: 0
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'unknown'],
      default: 'unknown',
      lowercase: true,
      trim: true
    },
    image: {
      type: String,
      trim: true,
      default: ''
    },

    // có thể giữ lại nếu bạn vẫn muốn lưu loại text
    type: {
      type: String,
      trim: true,
      default: ''
    },

    // thêm field category
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Vui lòng chọn danh mục']
    },

    sterilized: {
      type: Boolean,
      default: false
    },
    vaccinated: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['available', 'adopted', 'pending', 'reserved', 'rejected'],
      default: 'available'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    adminNote: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { timestamps: true }
);

petSchema.index({ name: 'text', color: 'text', description: 'text', type: 'text' });
petSchema.index({ category: 1, status: 1 });
petSchema.index({ createdAt: -1 });

petSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Pet', petSchema);
