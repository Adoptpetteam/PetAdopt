require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const Product = require('./src/models/Product');
const User = require('./src/models/User');
const RefundRequest = require('./src/models/RefundRequest');
const Notification = require('./src/models/Notification');

async function testAdminCancelVNPay() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // 1. Tìm user
    const user = await User.findOne({ email: { $regex: '@', $options: 'i' } });
    if (!user) {
      console.log('❌ Không tìm thấy user!');
      process.exit(1);
    }
    console.log(`✅ User: ${user.name} (${user.email})\n`);

    // 2. Tìm product
    const product = await Product.findOne({ quantity: { $gt: 0 } });
    if (!product) {
      console.log('❌ Không tìm thấy product!');
      process.exit(1);
    }
    console.log(`✅ Product: ${product.name} (${product.quantity} available)\n`);

    // 3. Tạo đơn VNPay đã thanh toán
    console.log('📦 Tạo đơn hàng VNPay...');
    const order = await Order.create({
      user: user._id,
      status: 'paid',
      orderStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'vnpay',
      customer: {
        name: user.name,
        phone: '0123456789',
        address: '123 Test Street',
      },
      items: [{
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: 1,
      }],
      totals: {
        subtotal: product.price,
        discount: 0,
        total: product.price,
      },
      voucher: { code: null, discount: 0 },
    });
    console.log(`✅ Order created: ${order._id}\n`);

    // 4. Simulate admin cancel
    console.log('🚫 Admin hủy đơn...');
    const reason = 'Test admin cancel - Sản phẩm hết hàng';
    
    // Hoàn kho
    product.quantity += 1;
    await product.save();
    
    // Cập nhật order
    order.orderStatus = 'cancelled';
    order.status = 'cancelled';
    order.paymentStatus = 'refunding';
    await order.save();
    
    // Tạo RefundRequest
    const refund = await RefundRequest.create({
      order: order._id,
      user: user._id,
      amount: order.totals.total,
      cancelReason: reason,
      originalPaymentMethod: 'vnpay',
      status: 'awaiting_info',
    });
    console.log(`✅ RefundRequest created: ${refund._id}\n`);
    
    // Tạo Notification
    const orderCode = order._id.toString().slice(-8).toUpperCase();
    const notification = await Notification.create({
      user: user._id,
      type: 'order_refund_required',
      title: `Đơn hàng #${orderCode} đã bị hủy - Cần cập nhật thông tin hoàn tiền`,
      message: `Lý do hủy: ${reason}\n\nĐơn hàng của bạn đã được thanh toán qua VNPay. Vui lòng cập nhật thông tin ngân hàng để chúng tôi hoàn tiền cho bạn.`,
      order: order._id,
      refundRequest: refund._id,
      metadata: {
        reason,
        cancelReason: reason,
        orderCode,
        amount: order.totals.total,
        refundAmount: order.totals.total,
        paymentMethod: 'vnpay',
        requiresRefundInfo: true,
        refundRequestId: refund._id.toString(),
      },
      actionUrl: `/refund/${refund._id}`,
      actionLabel: 'Điền thông tin hoàn tiền'
    });
    console.log(`✅ Notification created: ${notification._id}\n`);

    // 5. Kiểm tra kết quả
    console.log('🔍 KIỂM TRA KẾT QUẢ:');
    console.log('='.repeat(80));
    
    const checkRefund = await RefundRequest.findById(refund._id);
    console.log(`RefundRequest exists: ${!!checkRefund}`);
    console.log(`RefundRequest status: ${checkRefund?.status}`);
    console.log(`RefundRequest amount: ${checkRefund?.amount.toLocaleString()}đ`);
    console.log('');
    
    const checkNotif = await Notification.findById(notification._id);
    console.log(`Notification exists: ${!!checkNotif}`);
    console.log(`Notification refundRequest: ${checkNotif?.refundRequest}`);
    console.log(`Notification metadata.refundRequestId: ${checkNotif?.metadata?.refundRequestId}`);
    console.log('');

    console.log('✅ Test hoàn tất!');
    console.log('\n📝 Bây giờ bạn có thể:');
    console.log(`1. Login user: ${user.email}`);
    console.log(`2. Vào /notifications`);
    console.log(`3. Click "Cập nhật thông tin hoàn tiền"`);
    console.log(`4. Điền form và submit`);
    console.log(`5. Admin vào /admin/refund-management để xem`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err);
    process.exit(1);
  }
}

testAdminCancelVNPay();
