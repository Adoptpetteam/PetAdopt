require('dotenv').config();
const mongoose = require('mongoose');
const RefundRequest = require('./src/models/RefundRequest');
const Notification = require('./src/models/Notification');
const Order = require('./src/models/Order');
const User = require('./src/models/User');

async function checkRefundData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // 1. Kiểm tra RefundRequest
    console.log('📋 REFUND REQUESTS:');
    console.log('='.repeat(80));
    const refunds = await RefundRequest.find().populate('user', 'name email').populate('order').sort({ createdAt: -1 });
    
    if (refunds.length === 0) {
      console.log('❌ Không có RefundRequest nào trong database!\n');
    } else {
      console.log(`Tổng số: ${refunds.length}\n`);
      
      refunds.forEach((r, i) => {
        console.log(`${i + 1}. RefundRequest ID: ${r._id}`);
        console.log(`   Order ID: ${r.order?._id || 'N/A'}`);
        console.log(`   User: ${r.user?.name} (${r.user?.email})`);
        console.log(`   Amount: ${r.amount.toLocaleString()}đ`);
        console.log(`   Status: ${r.status}`);
        console.log(`   Cancel Reason: ${r.cancelReason}`);
        console.log(`   Bank Info:`);
        console.log(`     - Bank: ${r.bankInfo?.bankName || 'Chưa có'}`);
        console.log(`     - Account: ${r.bankInfo?.accountNumber || 'Chưa có'}`);
        console.log(`     - Holder: ${r.bankInfo?.accountHolder || 'Chưa có'}`);
        console.log(`     - QR: ${r.bankInfo?.qrCodeImage ? 'Có' : 'Không'}`);
        console.log(`   Submitted At: ${r.submittedAt || 'Chưa submit'}`);
        console.log(`   Created At: ${r.createdAt}`);
        console.log('');
      });
    }

    // 2. Thống kê theo status
    console.log('\n📊 THỐNG KÊ THEO STATUS:');
    console.log('='.repeat(80));
    const statuses = ['awaiting_info', 'pending', 're_enter_info', 'processing', 'completed', 'rejected'];
    for (const status of statuses) {
      const count = await RefundRequest.countDocuments({ status });
      console.log(`${status.padEnd(20)}: ${count}`);
    }

    // 3. Kiểm tra Notifications liên quan
    console.log('\n\n🔔 NOTIFICATIONS (order_refund_required):');
    console.log('='.repeat(80));
    const notifications = await Notification.find({ 
      type: 'order_refund_required' 
    }).populate('user', 'name email').sort({ createdAt: -1 }).limit(10);
    
    if (notifications.length === 0) {
      console.log('❌ Không có notification nào!\n');
    } else {
      console.log(`Tổng số: ${notifications.length}\n`);
      
      notifications.forEach((n, i) => {
        console.log(`${i + 1}. Notification ID: ${n._id}`);
        console.log(`   User: ${n.user?.name} (${n.user?.email})`);
        console.log(`   Title: ${n.title}`);
        console.log(`   Order: ${n.order}`);
        console.log(`   RefundRequest: ${n.refundRequest}`);
        console.log(`   Is Read: ${n.isRead}`);
        console.log(`   Metadata:`);
        console.log(`     - requiresRefundInfo: ${n.metadata?.requiresRefundInfo}`);
        console.log(`     - submitted: ${n.metadata?.submitted}`);
        console.log(`     - refundRequestId: ${n.metadata?.refundRequestId}`);
        console.log(`   Created At: ${n.createdAt}`);
        console.log('');
      });
    }

    // 4. Kiểm tra Orders bị hủy
    console.log('\n\n📦 ORDERS BỊ HỦY (cancelled):');
    console.log('='.repeat(80));
    const cancelledOrders = await Order.find({ 
      $or: [
        { status: 'cancelled' },
        { orderStatus: 'cancelled' }
      ]
    }).populate('user', 'name email').sort({ updatedAt: -1 }).limit(10);
    
    if (cancelledOrders.length === 0) {
      console.log('❌ Không có đơn hàng bị hủy!\n');
    } else {
      console.log(`Tổng số: ${cancelledOrders.length}\n`);
      
      cancelledOrders.forEach((o, i) => {
        console.log(`${i + 1}. Order ID: ${o._id}`);
        console.log(`   User: ${o.user?.name || o.customer?.name}`);
        console.log(`   Payment Method: ${o.paymentMethod}`);
        console.log(`   Payment Status: ${o.paymentStatus || 'N/A'}`);
        console.log(`   Order Status: ${o.orderStatus || o.status}`);
        console.log(`   Total: ${o.totals.total.toLocaleString()}đ`);
        console.log(`   Updated At: ${o.updatedAt}`);
        console.log('');
      });
    }

    // 5. Tìm các RefundRequest chưa có bankInfo
    console.log('\n\n⚠️  REFUND REQUESTS CHƯA CÓ BANK INFO:');
    console.log('='.repeat(80));
    const noBankInfo = await RefundRequest.find({
      $or: [
        { 'bankInfo.accountNumber': { $exists: false } },
        { 'bankInfo.accountNumber': '' },
        { 'bankInfo.accountNumber': null }
      ]
    }).populate('user', 'name email');
    
    if (noBankInfo.length === 0) {
      console.log('✅ Tất cả RefundRequest đều có bank info\n');
    } else {
      console.log(`Có ${noBankInfo.length} RefundRequest chưa có bank info:\n`);
      noBankInfo.forEach((r, i) => {
        console.log(`${i + 1}. ID: ${r._id}`);
        console.log(`   User: ${r.user?.name}`);
        console.log(`   Status: ${r.status}`);
        console.log(`   Amount: ${r.amount.toLocaleString()}đ`);
        console.log('');
      });
    }

    console.log('\n✅ Hoàn thành kiểm tra!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err);
    process.exit(1);
  }
}

checkRefundData();
