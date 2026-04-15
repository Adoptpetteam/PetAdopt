const mongoose = require('mongoose');

const reminderSentSchema = new mongoose.Schema(
  {
    before_7: { type: Boolean, default: false },
    before_3: { type: Boolean, default: false },
    before_1: { type: Boolean, default: false },
    due_day: { type: Boolean, default: false },
    overdue: { type: Boolean, default: false }
  },
  { _id: false }
);

const vaccinationScheduleSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true
    },
    petNameSnapshot: {
      type: String,
      trim: true,
      default: ''
    },
    ownerName: {
      type: String,
      required: true,
      trim: true
    },
    ownerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    ownerPhone: {
      type: String,
      trim: true,
      default: ''
    },
    vaccineName: {
      type: String,
      required: true,
      trim: true
    },
    doseNumber: {
      type: Number,
      min: 1,
      default: 1
    },
    scheduledAt: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'missed', 'cancelled'],
      default: 'scheduled'
    },
    /** Gửi nhắc trước X ngày — mặc định hệ thống [7,3,1] nếu rỗng */
    reminderOffsetsDays: {
      type: [Number],
      default: [7, 3, 1]
    },
    reminderSent: {
      type: reminderSentSchema,
      default: () => ({})
    },
    isReminderSent: {
      type: Boolean,
      default: false
    },
    lastReminderAt: {
      type: Date
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

vaccinationScheduleSchema.index({ scheduledAt: 1, status: 1 });
vaccinationScheduleSchema.index({ ownerEmail: 1 });
vaccinationScheduleSchema.index({ pet: 1 });

module.exports = mongoose.model('VaccinationSchedule', vaccinationScheduleSchema);
