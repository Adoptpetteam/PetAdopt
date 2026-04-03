const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên danh mục là bắt buộc'],
      trim: true,
      unique: true,
      maxlength: 100
    },
    status: {
      type: String,
      enum: ['on', 'off'],
      default: 'on'
    }
  },
  { timestamps: true }
);

categorySchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Category', categorySchema);
