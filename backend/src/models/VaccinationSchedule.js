const mongoose = require('mongoose');

const vaccinationScheduleSchema = new mongoose.Schema({
  // Thông tin thú cưng
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  petName: {
    type: String,
    required: true
  },
  
  // Thông tin chủ nuôi
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  ownerEmail: {
    type: String,
    required: true
  },
  ownerPhone: {
    type: String,
    default: ''
  },
  
  // Thông tin vaccine
  vaccineName: {
    type: String,
    required: true
  },
  vaccineType: {
    type: String,
    enum: ['basic', 'rabies', 'combo', 'other'],
    default: 'basic'
  },
  description: {
    type: String,
    default: ''
  },
  
  // Lịch tiêm
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date,
    default: null
  },
  
  // Trạng thái
  status: {
    type: String,
    enum: ['scheduled', 'reminded', 'completed', 'missed', 'cancelled'],
    default: 'scheduled'
  },
  
  // Thông báo
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: {
    type: Date,
    default: null
  },
  
  // Ghi chú
  notes: {
    type: String,
    default: ''
  },
  
  // Thông tin bác sĩ thú y
  veterinarian: {
    name: String,
    clinic: String,
    phone: String
  },
  
  // Liều tiêm (cho vaccine nhiều liều)
  doseNumber: {
    type: Number,
    default: 1
  },
  totalDoses: {
    type: Number,
    default: 1
  },
  
  // Liên kết với adoption request
  adoptionRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdoptionRequest',
    default: null
  }
}, {
  timestamps: true
});

// Index để tìm kiếm nhanh
vaccinationScheduleSchema.index({ owner: 1, scheduledDate: 1 });
vaccinationScheduleSchema.index({ pet: 1, scheduledDate: 1 });
vaccinationScheduleSchema.index({ status: 1, scheduledDate: 1 });
vaccinationScheduleSchema.index({ reminderSent: 1, scheduledDate: 1 });

// Virtual để tính số ngày còn lại
vaccinationScheduleSchema.virtual('daysUntilVaccination').get(function() {
  if (!this.scheduledDate) return null;
  const today = new Date();
  const scheduled = new Date(this.scheduledDate);
  const diffTime = scheduled - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method để kiểm tra có cần nhắc nhở không
vaccinationScheduleSchema.methods.needsReminder = function() {
  if (this.reminderSent || this.status !== 'scheduled') return false;
  
  const daysUntil = this.daysUntilVaccination;
  // Nhắc nhở trước 3 ngày và 1 ngày
  return daysUntil <= 3 && daysUntil >= 0;
};

// Static method để tìm các lịch cần nhắc nhở
vaccinationScheduleSchema.statics.findSchedulesNeedingReminder = function() {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.find({
    status: 'scheduled',
    reminderSent: false,
    scheduledDate: {
      $gte: today,
      $lte: threeDaysFromNow
    }
  }).populate('pet owner');
};

module.exports = mongoose.model('VaccinationSchedule', vaccinationScheduleSchema);
