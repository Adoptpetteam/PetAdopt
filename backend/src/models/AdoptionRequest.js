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
    enum: ['none', 'basic', 'experienced', 'expert'],
    default: 'none'
  },
  
  experienceDetails: {
    type: String,
    maxlength: 1000
  },

  housingType: {
    type: String,
    enum: ['apartment', 'house', 'dorm', 'farm', 'other'],
    required: [true, 'Loại nhà ở là bắt buộc']
  },
  
  hasYard: {
    type: Boolean,
    default: false
  },
  
  familyMembers: {
    type: String,
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
  },

  // Thêm trường theo dõi trạng thái
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Thêm trường đánh giá
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  feedback: {
    type: String,
    maxlength: 1000
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