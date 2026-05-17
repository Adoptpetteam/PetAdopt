require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');

async function checkOrder() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Lấy order từ notification
    const orderId = '6a08a22a03e56fdf2d8cf851';
    
    const order = await Order.findById(orderId).populate('user', 'name email');
    
    if (!order) {
      console.log('❌ Không tìm thấy order!');
      process.exit(1);
    }

    console.log('📦 ORDER DETAIL:');
    console.log('='.repeat(80));
    console.log(`Order ID: ${order._id}`);
    console.log(`User: ${order.user?.name} (${order.user?.email})`);
    console.log(`Payment Method: ${order.paymentMethod}`);
    console.log(`Payment Status: ${order.paymentStatus || 'N/A'}`);
    console.log(`Order Status (old): ${order.status}`);
    console.log(`Order Status (new): ${order.orderStatus || 'N/A'}`);
    console.log(`Total: ${order.totals.total.toLocaleString()}đ`);
    console.log(`Created At: ${order.createdAt}`);
    console.log(`Updated At: ${order.updatedAt}`);
    console.log('');

    // Kiểm tra điều kiện VNPay paid
    const isVNPayPaid = order.paymentMethod === 'vnpay' && 
                        (order.paymentStatus === 'paid' || order.status === 'paid');
    
    console.log('🔍 KIỂM TRA ĐIỀU KIỆN:');
    console.log('='.repeat(80));
    console.log(`paymentMethod === 'vnpay': ${order.paymentMethod === 'vnpay'}`);
    console.log(`paymentStatus === 'paid': ${order.paymentStatus === 'paid'}`);
    console.log(`status === 'paid': ${order.status === 'paid'}`);
    console.log(`=> isVNPayPaid: ${isVNPayPaid}`);
    console.log('');

    if (isVNPayPaid) {
      console.log('✅ Đơn này PHẢI tạo RefundRequest!');
    } else {
      console.log('❌ Đơn này KHÔNG tạo RefundRequest (COD hoặc chưa thanh toán)');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err);
    process.exit(1);
  }
}

checkOrder();
