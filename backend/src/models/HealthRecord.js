const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['vaccination', 'checkup', 'treatment', 'other'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  veterinarian: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  nextCheckup: {
    type: Date
  },
  weight: {
    type: Number
  },
  temperature: {
    type: Number
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
