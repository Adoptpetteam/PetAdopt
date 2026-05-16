require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const User = require('./src/models/User');
const Product = require('./src/models/Product');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

async function seedOrders() {
  try {
    // Lấy user và product mẫu
    const users = await User.find().limit(3);
    const products = await Product.find().limit(5);

    if (users.length === 0 || products.length === 0) {
      console.log('❌ Cần có user và product trước. Chạy seed khác trước!');
      process.exit(1);
    }

    // Xóa đơn hàng cũ
    await Order.deleteMany({});
    console.log('🗑️  Đã xóa đơn hàng cũ');

    const orders = [];
    const statuses = ['completed', 'completed', 'completed', 'shipping', 'pending', 'confirmed'];

    // Tạo 20 đơn hàng trong 7 ngày qua
    for (let i = 0; i < 20; i++) {
      const daysAgo = Math.floor(Math.random() * 7); // 0-6 ngày trước
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);
      orderDate.setHours(Math.floor(Math.random() * 24));

      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 sản phẩm
      const items = [];
      let totalAmount = 0;

      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = product.price || 100000;
        
        items.push({
          product: product._id,
          name: product.name,
          price: price,
          quantity: quantity,
          image: product.image
        });

        totalAmount += price * quantity;
      }

      orders.push({
        user: users[Math.floor(Math.random() * users.length)]._id,
        items: items,
        totals: {
          subtotal: totalAmount,
          discount: 0,
          total: totalAmount
        },
        customer: {
          name: 'Nguyễn Văn A',
          phone: '0123456789',
          address: '123 Đường ABC, Phường 1, Quận 1, TP.HCM'
        },
        paymentMethod: Math.random() > 0.5 ? 'cod' : 'vnpay',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: orderDate,
        updatedAt: orderDate
      });
    }

    await Order.insertMany(orders);
    console.log(`✅ Đã tạo ${orders.length} đơn hàng mẫu trong 7 ngày qua`);

    // Thống kê
    const total = await Order.countDocuments();
    const completed = await Order.countDocuments({ status: 'completed' });
    const revenue = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totals.total' } } }
    ]);

    console.log('\n📊 Thống kê:');
    console.log(`   Tổng đơn: ${total}`);
    console.log(`   Hoàn thành: ${completed}`);
    console.log(`   Doanh thu: ${(revenue[0]?.total || 0).toLocaleString('vi-VN')} đ`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

seedOrders();
