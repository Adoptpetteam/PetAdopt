const Review = require('../models/Review');
const Pet = require('../models/Pet');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AdoptionRequest = require('../models/AdoptionRequest');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer config for review images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/reviews';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)'));
    }
  }
}).array('images', 5); // Max 5 images

// @desc    Tạo review mới
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  // Handle file upload first
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Lỗi upload ảnh'
      });
    }

    try {
      const { reviewType, petId, productId, rating, comment } = req.body;
      const userId = req.user?.userId || req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập để đánh giá'
        });
      }

      // Validate
      if (!reviewType || !rating || !comment) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin'
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Đánh giá phải từ 1 đến 5 sao'
        });
      }

      // Get uploaded image paths
      const imagePaths = req.files ? req.files.map(file => `/uploads/reviews/${file.filename}`) : [];

      let reviewData = {
        reviewType,
        user: userId,
        rating,
        comment,
        images: imagePaths
      };

    // Review cho Pet
    if (reviewType === 'pet') {
      if (!petId) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn thú cưng'
        });
      }

      const pet = await Pet.findById(petId);
      if (!pet) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thú cưng'
        });
      }

      // Check if user already reviewed this pet
      const existingReview = await Review.findOne({
        pet: petId,
        user: userId
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'Bạn đã đánh giá thú cưng này rồi'
        });
      }

      // ✅ BẮT BUỘC: Check if user adopted this pet
      const adoption = await AdoptionRequest.findOne({
        pet: petId,
        user: userId,
        status: 'approved'
      });

      if (!adoption) {
        return res.status(403).json({
          success: false,
          message: 'Bạn cần nhận nuôi thú cưng này trước khi đánh giá'
        });
      }

      reviewData.pet = petId;
      reviewData.verifiedAdoption = true; // Luôn true vì đã check
    }

    // Review cho Product
    if (reviewType === 'product') {
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn sản phẩm'
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sản phẩm'
        });
      }

      // Check if user already reviewed this product
      const existingReview = await Review.findOne({
        product: productId,
        user: userId
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'Bạn đã đánh giá sản phẩm này rồi'
        });
      }

      // ✅ BẮT BUỘC: Check if user purchased this product
      const order = await Order.findOne({
        user: userId,
        'items.product': productId,
        status: 'completed'
      });

      if (!order) {
        return res.status(403).json({
          success: false,
          message: 'Bạn cần mua sản phẩm này trước khi đánh giá'
        });
      }

      reviewData.product = productId;
      reviewData.verifiedPurchase = true; // Luôn true vì đã check
    }

    const review = await Review.create(reviewData);

    // Populate user info
    await review.populate('user', 'name email');

    // Update average rating
    await updateAverageRating(reviewType, reviewType === 'pet' ? petId : productId);

    res.status(201).json({
      success: true,
      message: 'Đánh giá thành công!',
      data: review
    });

    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tạo đánh giá',
        error: error.message
      });
    }
  });
};

// @desc    Lấy reviews cho Pet hoặc Product
// @route   GET /api/reviews/:type/:id
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = {
      status: 'approved'
    };

    if (type === 'pet') {
      query.pet = id;
    } else if (type === 'product') {
      query.product = id;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Loại review không hợp lệ'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'name email')
        .populate('adminResponse.respondedBy', 'name')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(query)
    ]);

    // Calculate rating statistics
    const stats = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: reviews,
      statistics: stats[0] || {
        avgRating: 0,
        totalReviews: 0,
        rating5: 0,
        rating4: 0,
        rating3: 0,
        rating2: 0,
        rating1: 0
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy đánh giá'
    });
  }
};

// @desc    Lấy tất cả reviews (Admin)
// @route   GET /api/reviews/admin/all
// @access  Private (Admin)
exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 100, sort = '-createdAt' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('pet', 'name')
      .populate('product', 'name')
      .populate('adminResponse.respondedBy', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments();

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error getting all reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// @desc    Cập nhật review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, images } = req.body;
    const userId = req.user?.userId || req.user?.id;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    // Check ownership
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền sửa đánh giá này'
      });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (images) review.images = images;

    await review.save();

    // Update average rating
    await updateAverageRating(
      review.reviewType,
      review.reviewType === 'pet' ? review.pet : review.product
    );

    res.json({
      success: true,
      message: 'Cập nhật đánh giá thành công',
      data: review
    });

  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật đánh giá'
    });
  }
};

// @desc    Xóa review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || req.user?.id;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    // Check ownership or admin
    const isOwner = review.user.toString() === userId.toString();
    const isAdmin = req.user?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa đánh giá này'
      });
    }

    const reviewType = review.reviewType;
    const targetId = review.reviewType === 'pet' ? review.pet : review.product;

    await review.deleteOne();

    // Update average rating
    await updateAverageRating(reviewType, targetId);

    res.json({
      success: true,
      message: 'Xóa đánh giá thành công'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa đánh giá'
    });
  }
};

// @desc    Vote helpful cho review
// @route   POST /api/reviews/:id/helpful
// @access  Private
exports.voteHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || req.user?.id;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    // Check if already voted
    const alreadyVoted = review.helpfulBy.includes(userId);

    if (alreadyVoted) {
      // Remove vote
      review.helpfulBy = review.helpfulBy.filter(
        id => id.toString() !== userId.toString()
      );
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      // Add vote
      review.helpfulBy.push(userId);
      review.helpfulCount += 1;
    }

    await review.save();

    res.json({
      success: true,
      message: alreadyVoted ? 'Đã bỏ vote' : 'Đã vote hữu ích',
      data: {
        helpfulCount: review.helpfulCount,
        voted: !alreadyVoted
      }
    });

  } catch (error) {
    console.error('Error voting helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// @desc    Admin response to review
// @route   POST /api/reviews/:id/response
// @access  Private (Admin)
exports.adminResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const adminId = req.user?.userId || req.user?.id;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    review.adminResponse = {
      comment,
      respondedBy: adminId,
      respondedAt: new Date()
    };

    await review.save();
    await review.populate('adminResponse.respondedBy', 'name');

    res.json({
      success: true,
      message: 'Đã phản hồi đánh giá',
      data: review
    });

  } catch (error) {
    console.error('Error admin response:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Helper function to update average rating
async function updateAverageRating(type, id) {
  try {
    const query = type === 'pet' ? { pet: id } : { product: id };
    
    const stats = await Review.aggregate([
      { $match: { ...query, status: 'approved' } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const avgRating = stats[0]?.avgRating || 0;
    const totalReviews = stats[0]?.totalReviews || 0;

    if (type === 'pet') {
      await Pet.findByIdAndUpdate(id, {
        averageRating: avgRating,
        totalReviews: totalReviews
      });
    } else {
      await Product.findByIdAndUpdate(id, {
        averageRating: avgRating,
        totalReviews: totalReviews
      });
    }
  } catch (error) {
    console.error('Error updating average rating:', error);
  }
}

module.exports = exports;
