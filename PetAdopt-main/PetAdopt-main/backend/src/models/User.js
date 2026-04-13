const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  isBanned: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên!'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email!'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ!']
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu!'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  twoFAEnabled: {
    type: Boolean,
    default: false
  },
  twoFASecret: {
    type: String,
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  registrationOTP: {
    type: String,
    default: null,
    select: false
  },
  registrationOTPExpires: {
    type: Date,
    default: null,
    select: false
  },
  resetPasswordOTP: {
    type: String,
    default: null,
    select: false
  },
  resetPasswordOTPExpires: {
    type: Date,
    default: null,
    select: false
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);