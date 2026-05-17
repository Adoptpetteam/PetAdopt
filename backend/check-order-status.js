require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');

async function checkOrderStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Lấy tất cả đơn hàng
    const allOrders = await Order.find({}).select('_id status orderStatus paymentStatus paymentMethod totals createdAt').lean();
    
    console.log(`📦 Tổng số đơn hàng: ${allOrders.length}\n`);

    if (allOrders.length === 0) {
      console.log('❌ Không có đơn hàng nào trong database!');
      process.exit(0);
    }

    // Thống kê theo status
    const statusCount = {};
    const orderStatusCount = {};
    const paymentStatusCount = {};

    allOrders.forEach(order => {
      // Count status
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
      
      // Count orderStatus
      if (order.orderStatus) {
        orderStatusCount[order.orderStatus] = (orderStatusCount[order.orderStatus] || 0) + 1;
      }
      
      // Count paymentStatus
      if (order.paymentStatus) {
        paymentStatusCount[order.paymentStatus] = (paymentStatusCount[order.paymentStatus] || 0) + 1;
      }
    });

    console.log('📊 Thống kê theo STATUS:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} đơn`);
    });

    console.log('\n📊 Thống kê theo ORDER_STATUS:');
    Object.entries(orderStatusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} đơn`);
    });

    console.log('\n📊 Thống kê theo PAYMENT_STATUS:');
    Object.entries(paymentStatusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} đơn`);
    });

    // Hiển thị 5 đơn mới nhất
    console.log('\n📋 5 đơn hàng mới nhất:');
    const recentOrders = allOrders.slice(-5).reverse();
    recentOrders.forEach(order => {
      console.log(`\n   ID: ${order._id.toString().slice(-8).toUpperCase()}`);
      console.log(`   status: ${order.status}`);
      console.log(`   orderStatus: ${order.orderStatus || 'null'}`);
      console.log(`   paymentStatus: ${order.paymentStatus || 'null'}`);
      console.log(`   paymentMethod: ${order.paymentMethod}`);
      console.log(`   total: ${order.totals.total.toLocaleString('vi-VN')}đ`);
      console.log(`   createdAt: ${new Date(order.createdAt).toLocaleString('vi-VN')}`);
    });

    // Kiểm tra đơn nào được tính vào statistics
    console.log('\n\n🔍 Kiểm tra filter statistics:');
    const statsFilter = { status: { $in: ['paid', 'completed'] } };
    const statsOrders = await Order.find(statsFilter).countDocuments();
    console.log(`   Filter: status in ['paid', 'completed']`);
    console.log(`   Kết quả: ${statsOrders} đơn`);

    if (statsOrders === 0) {
      console.log('\n⚠️  KHÔNG CÓ ĐƠN NÀO MATCH FILTER STATISTICS!');
      console.log('   Nguyên nhân: Đơn hàng không có status = "paid" hoặc "completed"');
      console.log('\n💡 Giải pháp:');
      console.log('   1. Tạo đơn VNPay đã thanh toán (status="paid")');
      console.log('   2. Hoặc tạo đơn COD đã giao hàng (status="completed")');
      console.log('   3. Hoặc sửa filter trong statisticsController.js');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkOrderStatus();
