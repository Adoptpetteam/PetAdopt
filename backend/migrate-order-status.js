require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');

/**
 * Migration Script: Chuyển đổi từ status cũ sang 3 trạng thái mới
 * - orderStatus: Trạng thái đơn hàng
 * - paymentStatus: Trạng thái thanh toán
 * - returnStatus: Trạng thái hoàn trả
 */

// Mapping từ status cũ sang status mới
const STATUS_MAPPING = {
  // Đơn hàng bình thường
  'pending': {
    orderStatus: 'pending',
    paymentStatus: 'unpaid',  // COD chưa thanh toán
    returnStatus: null
  },
  'confirmed': {
    orderStatus: 'confirmed',
    paymentStatus: 'unpaid',  // COD đã xác nhận nhưng chưa thu tiền
    returnStatus: null
  },
  'paid': {
    orderStatus: 'confirmed',
    paymentStatus: 'paid',    // VNPay đã thanh toán
    returnStatus: null
  },
  'shipping': {
    orderStatus: 'shipping',
    paymentStatus: null,      // Giữ nguyên payment status hiện tại
    returnStatus: null
  },
  'completed': {
    orderStatus: 'completed',
    paymentStatus: 'paid',    // Đã giao = đã thu tiền
    returnStatus: null
  },
  'cancelled': {
    orderStatus: 'cancelled',
    paymentStatus: null,      // Giữ nguyên payment status
    returnStatus: null
  },
  
  // Hoàn tiền
  'refund_pending': {
    orderStatus: 'cancelled',
    paymentStatus: 'refunding',
    returnStatus: 'requested'
  },
  'refund_processing': {
    orderStatus: 'cancelled',
    paymentStatus: 'refunding',
    returnStatus: 'approved'
  },
  'refund_completed': {
    orderStatus: 'cancelled',
    paymentStatus: 'refunded',
    returnStatus: 'completed'
  },
  
  // Trả hàng
  'return_requested': {
    orderStatus: 'completed',
    paymentStatus: 'refunding',
    returnStatus: 'requested'
  },
  'return_shipping': {
    orderStatus: 'completed',
    paymentStatus: 'refunding',
    returnStatus: 'shipping'
  },
  'return_received': {
    orderStatus: 'completed',
    paymentStatus: 'refunding',
    returnStatus: 'received'
  },
  
  // Đổi hàng
  'exchange_requested': {
    orderStatus: 'completed',
    paymentStatus: 'paid',
    returnStatus: 'requested'
  },
  'exchange_shipping': {
    orderStatus: 'completed',
    paymentStatus: 'paid',
    returnStatus: 'shipping'
  },
  'exchange_completed': {
    orderStatus: 'completed',
    paymentStatus: 'paid',
    returnStatus: 'completed'
  }
};

async function migrateOrderStatus() {
  try {
    console.log('🔄 Starting Order Status Migration...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Lấy tất cả orders
    const orders = await Order.find({});
    console.log(`📊 Found ${orders.length} orders to migrate\n`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const order of orders) {
      try {
        // Nếu đã có orderStatus, skip
        if (order.orderStatus && order.orderStatus !== 'pending') {
          console.log(`⏭️  Skip order ${order._id} - Already migrated`);
          skippedCount++;
          continue;
        }
        
        const oldStatus = order.status;
        const mapping = STATUS_MAPPING[oldStatus];
        
        if (!mapping) {
          console.log(`⚠️  Unknown status: ${oldStatus} for order ${order._id}`);
          errorCount++;
          continue;
        }
        
        // Xác định paymentStatus dựa trên paymentMethod và status hiện tại
        let paymentStatus = mapping.paymentStatus;
        
        if (paymentStatus === null) {
          // Giữ nguyên hoặc suy luận từ context
          if (order.paymentMethod === 'vnpay') {
            paymentStatus = ['paid', 'shipping', 'completed'].includes(oldStatus) ? 'paid' : 'pending';
          } else {
            // COD
            paymentStatus = oldStatus === 'completed' ? 'paid' : 'unpaid';
          }
        }
        
        // Update order
        order.orderStatus = mapping.orderStatus;
        order.paymentStatus = paymentStatus;
        order.returnStatus = mapping.returnStatus;
        
        await order.save();
        
        console.log(`✅ Migrated order ${order._id}`);
        console.log(`   Old: ${oldStatus}`);
        console.log(`   New: orderStatus=${order.orderStatus}, paymentStatus=${order.paymentStatus}, returnStatus=${order.returnStatus}`);
        console.log('');
        
        migratedCount++;
      } catch (err) {
        console.error(`❌ Error migrating order ${order._id}:`, err.message);
        errorCount++;
      }
    }
    
    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Migrated: ${migratedCount} orders`);
    console.log(`   ⏭️  Skipped: ${skippedCount} orders`);
    console.log(`   ❌ Errors: ${errorCount} orders`);
    console.log(`   📊 Total: ${orders.length} orders`);
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Test the new status fields in your application');
    console.log('   2. Update controllers to use new fields');
    console.log('   3. Update frontend to display new statuses');
    console.log('   4. After confirming everything works, you can remove the old "status" field');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run migration
migrateOrderStatus();
