const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Loại review: pet hoặc product
  reviewType: {
    type: String,
    enum: ['pet', 'product'],
    required: true
  },
  
  // Reference đến Pet hoặc Product
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: function() { return this.reviewType === 'pet'; }
  },
  
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: function() { return this.reviewType === 'product'; }
  },
  
  // Người review
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Đánh giá
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  // Nội dung review
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // Hình ảnh đính kèm (tùy chọn)
  images: [{
    type: String
  }],
  
  // Trạng thái
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved' // Auto approve, có thể đổi thành pending nếu muốn duyệt
  },
  
  // Helpful votes (người khác vote review này có hữu ích không)
  helpfulCount: {
    type: Number,
    default: 0
  },
  
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Admin response (nếu có)
  adminResponse: {
    comment: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  
  // Verified purchase (chỉ cho product)
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  
  // Verified adoption (chỉ cho pet)
  verifiedAdoption: {
    type: Boolean,
    default: false
  }
  
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ pet: 1, user: 1 });
reviewSchema.index({ product: 1, user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });

// Compound index để prevent duplicate reviews
reviewSchema.index({ pet: 1, user: 1 }, { unique: true, sparse: true });
reviewSchema.index({ product: 1, user: 1 }, { unique: true, sparse: true });

// Virtual để lấy tên người review
reviewSchema.virtual('userName').get(function() {
  return this.user?.name || 'Anonymous';
});

reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
