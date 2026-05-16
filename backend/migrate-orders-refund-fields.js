/**
 * Migration script: Thêm fields refund và returnExchange cho các đơn hàng cũ
 * 
 * Chạy: node migrate-orders-refund-fields.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');

async function migrateOrders() {
  try {
    console.log('🔌 Đang kết nối MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/petadopt');
    console.log('✅ Đã kết nối MongoDB');

    console.log('\n📊 Đang kiểm tra các đơn hàng...');
    
    // Đếm tổng số đơn hàng
    const totalOrders = await Order.countDocuments();
    console.log(`📦 Tổng số đơn hàng: ${totalOrders}`);

    // Đếm số đơn hàng chưa có fields mới
    const ordersWithoutRefund = await Order.countDocuments({ refund: { $exists: false } });
    const ordersWithoutReturnExchange = await Order.countDocuments({ returnExchange: { $exists: false } });
    
    console.log(`🔍 Đơn hàng chưa có field 'refund': ${ordersWithoutRefund}`);
    console.log(`🔍 Đơn hàng chưa có field 'returnExchange': ${ordersWithoutReturnExchange}`);

    if (ordersWithoutRefund === 0 && ordersWithoutReturnExchange === 0) {
      console.log('\n✅ Tất cả đơn hàng đã có đầy đủ fields mới!');
      console.log('💡 Không cần migration.');
      await mongoose.connection.close();
      return;
    }

    console.log('\n🔧 Bắt đầu migration...');

    // Update tất cả đơn hàng chưa có fields mới
    const result = await Order.updateMany(
      {
        $or: [
          { refund: { $exists: false } },
          { returnExchange: { $exists: false } }
        ]
      },
      {
        $set: {
          refund: {
            reason: null,
            requestedAt: null,
            requestedBy: null,
            bankAccount: null,
            bankName: null,
            accountHolder: null,
            qrCodeImage: null,
            processedAt: null,
            processedBy: null,
            amount: null,
            note: null
          },
          returnExchange: {
            type: null,
            reason: null,
            requestedAt: null,
            images: [],
            trackingNumber: null,
            receivedAt: null,
            inspectionNote: null,
            newOrderId: null
          }
        }
      }
    );

    console.log(`\n✅ Migration hoàn thành!`);
    console.log(`📝 Đã cập nhật ${result.modifiedCount} đơn hàng`);

    // Verify
    console.log('\n🔍 Đang verify...');
    const ordersAfter = await Order.countDocuments({
      refund: { $exists: true },
      returnExchange: { $exists: true }
    });
    console.log(`✅ Số đơn hàng có đầy đủ fields: ${ordersAfter}/${totalOrders}`);

    if (ordersAfter === totalOrders) {
      console.log('\n🎉 Migration thành công 100%!');
    } else {
      console.log('\n⚠️  Có một số đơn hàng chưa được cập nhật, vui lòng kiểm tra lại.');
    }

    await mongoose.connection.close();
    console.log('\n👋 Đã đóng kết nối MongoDB');

  } catch (error) {
    console.error('\n❌ Lỗi migration:', error);
    process.exit(1);
  }
}

// Chạy migration
if (require.main === module) {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   MIGRATION: REFUND & RETURN FIELDS   ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  migrateOrders()
    .then(() => {
      console.log('\n✅ Script hoàn thành!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script thất bại:', error);
      process.exit(1);
    });
}

module.exports = { migrateOrders };
