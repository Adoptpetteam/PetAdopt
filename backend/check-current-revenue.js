require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');

async function checkCurrentRevenue() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Lấy tất cả đơn hàng
    const allOrders = await Order.find({}).select('_id status orderStatus paymentStatus paymentMethod totals createdAt').lean();
    
    console.log(`📦 Tổng số đơn hàng: ${allOrders.length}\n`);

    // Filter giống trang Order (KHÔNG loại trừ cancelled)
    const orderPageFilter = allOrders.filter(o => 
      (o.orderStatus === "delivered" || o.status === "completed") ||
      (o.paymentStatus === "paid" || o.status === "paid")
    );

    const orderPageRevenue = orderPageFilter.reduce((sum, o) => sum + o.totals.total, 0);

    console.log('📊 LOGIC TRANG ORDER (KHÔNG loại trừ cancelled):');
    console.log(`   Số đơn: ${orderPageFilter.length}`);
    console.log(`   Doanh thu: ${orderPageRevenue.toLocaleString('vi-VN')}đ\n`);

    // Filter giống Statistics (CÓ loại trừ cancelled)
    const statsFilter = allOrders.filter(o => {
      const isCancelled = o.orderStatus === 'cancelled' || o.status === 'cancelled';
      const matchesRevenue = (o.orderStatus === "delivered" || o.status === "completed") ||
                             (o.paymentStatus === "paid" || o.status === "paid");
      return matchesRevenue && !isCancelled;
    });

    const statsRevenue = statsFilter.reduce((sum, o) => sum + o.totals.total, 0);

    console.log('📊 LOGIC STATISTICS (CÓ loại trừ cancelled):');
    console.log(`   Số đơn: ${statsFilter.length}`);
    console.log(`   Doanh thu: ${statsRevenue.toLocaleString('vi-VN')}đ\n`);

    console.log('📋 Danh sách đơn được tính (trang Order):');
    orderPageFilter.forEach(o => {
      const isCancelled = o.orderStatus === 'cancelled' || o.status === 'cancelled';
      console.log(`   - ${o._id.toString().slice(-8).toUpperCase()}: ${o.totals.total.toLocaleString('vi-VN')}đ ${isCancelled ? '❌ CANCELLED' : '✅'}`);
      console.log(`     status=${o.status}, orderStatus=${o.orderStatus || 'null'}, paymentStatus=${o.paymentStatus || 'null'}`);
    });

    console.log('\n\n🔍 So sánh:');
    console.log(`   Trang Order hiển thị: 4.325.000đ`);
    console.log(`   Tính KHÔNG loại trừ cancelled: ${orderPageRevenue.toLocaleString('vi-VN')}đ`);
    console.log(`   Tính CÓ loại trừ cancelled: ${statsRevenue.toLocaleString('vi-VN')}đ`);

    if (orderPageRevenue === 4325000) {
      console.log('\n✅ Trang Order KHÔNG loại trừ đơn cancelled!');
      console.log('💡 Statistics cần sửa lại để KHÔNG loại trừ cancelled');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCurrentRevenue();
