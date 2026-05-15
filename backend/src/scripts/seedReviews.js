require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Pet = require('../models/Pet');
const Product = require('../models/Product');
const User = require('../models/User');
const AdoptionRequest = require('../models/AdoptionRequest');
const Order = require('../models/Order');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGO_URI or MONGODB_URI not found in .env');
    }
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedReviews = async () => {
  try {
    await connectDB();

    // Clear existing reviews
    await Review.deleteMany({});
    console.log('🗑️  Cleared existing reviews');

    // Get users
    const users = await User.find({ role: 'user' }).limit(5);
    if (users.length === 0) {
      console.log('❌ No users found. Please seed users first.');
      process.exit(1);
    }

    // Get pets with approved adoptions
    const adoptions = await AdoptionRequest.find({ status: 'approved' })
      .populate('pet')
      .populate('user')
      .limit(5);

    // Get completed orders
    const orders = await Order.find({ status: 'completed' })
      .populate('user')
      .limit(5);

    const reviews = [];

    // Create pet reviews
    for (const adoption of adoptions) {
      if (adoption.pet && adoption.user) {
        const petReviews = [
          {
            reviewType: 'pet',
            pet: adoption.pet._id,
            user: adoption.user._id,
            rating: 5,
            comment: `${adoption.pet.name} thật tuyệt vời! Rất thân thiện và dễ thương. Cảm ơn trung tâm đã giúp tôi tìm được người bạn đồng hành tuyệt vời này! 🐾❤️`,
            verifiedAdoption: true,
            status: 'approved',
            helpfulCount: Math.floor(Math.random() * 20)
          },
          {
            reviewType: 'pet',
            pet: adoption.pet._id,
            user: adoption.user._id,
            rating: 4,
            comment: `Bé ${adoption.pet.name} rất ngoan và dễ chăm sóc. Đã thích nghi tốt với gia đình. Chỉ hơi nhút nhát lúc đầu nhưng giờ đã vui vẻ hơn nhiều!`,
            verifiedAdoption: true,
            status: 'approved',
            helpfulCount: Math.floor(Math.random() * 15)
          }
        ];
        reviews.push(petReviews[Math.floor(Math.random() * petReviews.length)]);
      }
    }

    // Create product reviews
    for (const order of orders) {
      if (order.items && order.items.length > 0 && order.user) {
        const item = order.items[0];
        const productReviews = [
          {
            reviewType: 'product',
            product: item.product,
            user: order.user._id,
            rating: 5,
            comment: 'Sản phẩm chất lượng tuyệt vời! Thú cưng của tôi rất thích. Giao hàng nhanh, đóng gói cẩn thận. Sẽ mua lại! 👍',
            verifiedPurchase: true,
            status: 'approved',
            helpfulCount: Math.floor(Math.random() * 25)
          },
          {
            reviewType: 'product',
            product: item.product,
            user: order.user._id,
            rating: 4,
            comment: 'Sản phẩm tốt, đúng như mô tả. Giá cả hợp lý. Chỉ có điều giao hàng hơi lâu một chút nhưng nhìn chung vẫn hài lòng.',
            verifiedPurchase: true,
            status: 'approved',
            helpfulCount: Math.floor(Math.random() * 18)
          },
          {
            reviewType: 'product',
            product: item.product,
            user: order.user._id,
            rating: 5,
            comment: 'Chất lượng xuất sắc! Thú cưng nhà tôi rất thích. Đóng gói đẹp, giao hàng nhanh. Giá cả phải chăng. Highly recommended! ⭐⭐⭐⭐⭐',
            verifiedPurchase: true,
            status: 'approved',
            helpfulCount: Math.floor(Math.random() * 30)
          },
          {
            reviewType: 'product',
            product: item.product,
            user: order.user._id,
            rating: 3,
            comment: 'Sản phẩm ổn, không có gì đặc biệt. Chất lượng trung bình so với giá tiền. Có thể cải thiện thêm về bao bì.',
            verifiedPurchase: true,
            status: 'approved',
            helpfulCount: Math.floor(Math.random() * 10)
          }
        ];
        reviews.push(productReviews[Math.floor(Math.random() * productReviews.length)]);
      }
    }

    // Insert reviews
    if (reviews.length > 0) {
      const createdReviews = await Review.insertMany(reviews);
      console.log(`✅ Created ${createdReviews.length} reviews`);

      // Update average ratings
      const petIds = [...new Set(reviews.filter(r => r.reviewType === 'pet').map(r => r.pet))];
      const productIds = [...new Set(reviews.filter(r => r.reviewType === 'product').map(r => r.product))];

      for (const petId of petIds) {
        const stats = await Review.aggregate([
          { $match: { pet: petId, status: 'approved' } },
          {
            $group: {
              _id: null,
              avgRating: { $avg: '$rating' },
              totalReviews: { $sum: 1 }
            }
          }
        ]);

        if (stats[0]) {
          await Pet.findByIdAndUpdate(petId, {
            averageRating: stats[0].avgRating,
            totalReviews: stats[0].totalReviews
          });
        }
      }

      for (const productId of productIds) {
        const stats = await Review.aggregate([
          { $match: { product: productId, status: 'approved' } },
          {
            $group: {
              _id: null,
              avgRating: { $avg: '$rating' },
              totalReviews: { $sum: 1 }
            }
          }
        ]);

        if (stats[0]) {
          await Product.findByIdAndUpdate(productId, {
            averageRating: stats[0].avgRating,
            totalReviews: stats[0].totalReviews
          });
        }
      }

      console.log('✅ Updated average ratings for pets and products');
    } else {
      console.log('⚠️  No reviews created. Make sure you have approved adoptions and completed orders.');
    }

    console.log('✅ Seed reviews completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding reviews:', error);
    process.exit(1);
  }
};

seedReviews();
