const mongoose = require('mongoose');

const adoptionRequestSchema = new mongoose.Schema(
  {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: [true, 'Pet ID là bắt buộc']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    name: {
      type: String,
      required: [true, 'Họ tên là bắt buộc'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    address: {
      type: String,
      required: [true, 'Địa chỉ là bắt buộc'],
      trim: true
    },
    reason: {
      type: String,
      required: [true, 'Lý do nhận nuôi là bắt buộc'],
      maxlength: 1000,
      trim: true
    },
    petName: {
      type: String,
      trim: true,
      default: ''
    },
    donationType: {
      type: String,
      trim: true,
      default: ''
    },
    certificateType: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['submitted', 'pending_payment', 'paid', 'approved', 'rejected', 'cancelled'],
      default: 'submitted'
    },
    adminNote: {
      type: String,
      maxlength: 1000,
      default: ''
    },
    processedAt: {
      type: Date,
      default: null
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

adoptionRequestSchema.index({ user: 1, status: 1 });
adoptionRequestSchema.index({ petId: 1, status: 1 });
adoptionRequestSchema.index({ createdAt: -1 });

adoptionRequestSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('AdoptionRequest', adoptionRequestSchema);
