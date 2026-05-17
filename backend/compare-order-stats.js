require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');

async function compareStats() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Lấy tất cả đơn hàng
    const allOrders = await Order.find({}).select('_id status orderStatus paymentStatus paymentMethod totals createdAt').lean();
    
    console.log(`📦 Tổng số đơn hàng: ${allOrders.length}\n`);

    // Filter giống trang Order
    const orderPageFilter = allOrders.filter(o => 
      (o.orderStatus === "delivered" || o.status === "completed") ||
      (o.paymentStatus === "paid" || o.status === "paid")
    );

    const orderPageRevenue = orderPageFilter.reduce((sum, o) => sum + o.totals.total, 0);

    console.log('📊 LOGIC TRANG ORDER:');
    console.log(`   Filter: (orderStatus='delivered' OR status='completed') OR (paymentStatus='paid' OR status='paid')`);
    console.log(`   Số đơn: ${orderPageFilter.length}`);
    console.log(`   Doanh thu: ${orderPageRevenue.toLocaleString('vi-VN')}đ\n`);

    console.log('📋 Danh sách đơn được tính:');
    orderPageFilter.forEach(o => {
      console.log(`   - ${o._id.toString().slice(-8).toUpperCase()}: ${o.totals.total.toLocaleString('vi-VN')}đ`);
      console.log(`     status=${o.status}, orderStatus=${o.orderStatus || 'null'}, paymentStatus=${o.paymentStatus || 'null'}`);
    });

    console.log('\n\n🔍 So sánh với trang Order hiện tại:');
    console.log(`   Trang Order hiển thị: 4.145.000đ`);
    console.log(`   Script tính được: ${orderPageRevenue.toLocaleString('vi-VN')}đ`);
    console.log(`   Chênh lệch: ${Math.abs(orderPageRevenue - 4145000).toLocaleString('vi-VN')}đ`);

    if (orderPageRevenue === 4145000) {
      console.log('\n✅ KHỚP HOÀN TOÀN!');
    } else {
      console.log('\n⚠️  CÓ CHÊNH LỆCH!');
      console.log('   Nguyên nhân có thể:');
      console.log('   1. Trang Order đang filter theo date range');
      console.log('   2. Có đơn mới được tạo sau khi chụp ảnh');
      console.log('   3. Có đơn bị xóa/cập nhật');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

compareStats();
