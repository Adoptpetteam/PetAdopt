const mongoose = require('mongoose');

const volunteerApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Họ và tên là bắt buộc'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      trim: true
    },
    age: {
      type: Number,
      min: 0,
      max: 120
    },
    experience: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    },
    availability: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    reason: {
      type: String,
      required: [true, 'Lý do tham gia là bắt buộc'],
      maxlength: 1500,
      trim: true
    },

    // Trạng thái xét duyệt
    status: {
      type: String,
      enum: ['pending_review', 'approved', 'rejected'],
      default: 'pending_review'
    },

    // Ghi chú từ admin
    adminNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    },

    // Thông tin phỏng vấn
    interviewAt: {
      type: Date,
      default: null
    },
    interviewLocation: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },

    // Thời gian admin xử lý đơn
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

volunteerApplicationSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model(
  'VolunteerApplication',
  volunteerApplicationSchema
);