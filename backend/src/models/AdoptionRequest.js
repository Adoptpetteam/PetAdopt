const mongoose = require('mongoose');

const adoptionRequestSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: [true, 'Pet ID là bắt buộc']
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID là bắt buộc']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },

  fullName: {
    type: String,
    required: [true, 'Họ tên là bắt buộc'],
    trim: true
  },
  
  phone: {
    type: String,
    required: [true, 'Số điện thoại là bắt buộc'],
    trim: true
  },
  
  address: {
    type: String,
    required: [true, 'Địa chỉ là bắt buộc'],
    trim: true
  },

  reason: {
    type: String,
    required: [true, 'Lý do nhận nuôi là bắt buộc'],
    maxlength: 1000
  },

  experience: {
    type: String,
    enum: ['none', 'beginner', 'intermediate', 'expert'],
    default: 'none'
  },
  
  experienceDetails: {
    type: String,
    maxlength: 1000
  },

  housingType: {
    type: String,
    enum: ['apartment', 'house', 'farm', 'other'],
    required: [true, 'Loại nhà ở là bắt buộc']
  },
  
  hasYard: {
    type: Boolean,
    default: false
  },
  
  familyMembers: {
    type: Number,
    min: 1,
    required: [true, 'Số thành viên gia đình là bắt buộc']
  },
  
  hasChildren: {
    type: Boolean,
    default: false
  },
  
  childrenAges: {
    type: String,
    trim: true
  },
  
  hasOtherPets: {
    type: Boolean,
    default: false
  },
  
  otherPetsDetails: {
    type: String,
    maxlength: 500
  },
  
  monthlyIncome: {
    type: String,
    enum: ['under_5m', '5m_10m', '10m_20m', 'over_20m'],
    required: [true, 'Thu nhập hàng tháng là bắt buộc']
  },
  
  commitment: {
    type: Boolean,
    default: false,
    required: [true, 'Phải đồng ý cam kết']
  },

  adminNote: {
    type: String,
    maxlength: 1000
  },
  
  processedAt: {
    type: Date
  },
  
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, {
  timestamps: true
});

adoptionRequestSchema.index({ user: 1, status: 1 });
adoptionRequestSchema.index({ pet: 1, status: 1 });
adoptionRequestSchema.index({ createdAt: -1 });

adoptionRequestSchema.virtual('petDetails', {
  ref: 'Pet',
  localField: 'pet',
  foreignField: '_id',
  justOne: true
});

adoptionRequestSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

adoptionRequestSchema.set('toJSON', { virtuals: true });
adoptionRequestSchema.set('toObject', { virtuals: true });

const AdoptionRequest = mongoose.model('AdoptionRequest', adoptionRequestSchema);

module.exports = AdoptionRequest;
