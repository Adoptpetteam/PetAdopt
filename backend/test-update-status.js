require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Thay token admin của bạn vào đây
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE';

// Thay order ID của bạn vào đây
const ORDER_ID = 'YOUR_ORDER_ID_HERE';

async function testUpdateOrderStatus() {
  console.log('🧪 Testing Order Status Update API...\n');
  
  try {
    // Test 1: Cập nhật orderStatus
    console.log('📝 Test 1: Cập nhật orderStatus sang "confirmed"');
    const response1 = await axios.put(
      `${API_URL}/orders/${ORDER_ID}/status`,
      {
        orderStatus: 'confirmed',
        note: 'Test update orderStatus'
      },
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Response:', {
      success: response1.data.success,
      orderStatus: response1.data.data.orderStatus,
      paymentStatus: response1.data.data.paymentStatus,
      returnStatus: response1.data.data.returnStatus
    });
    console.log('');
    
    // Test 2: Cập nhật paymentStatus
    console.log('📝 Test 2: Cập nhật paymentStatus sang "paid"');
    const response2 = await axios.put(
      `${API_URL}/orders/${ORDER_ID}/status`,
      {
        paymentStatus: 'paid',
        note: 'Test update paymentStatus'
      },
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Response:', {
      success: response2.data.success,
      orderStatus: response2.data.data.orderStatus,
      paymentStatus: response2.data.data.paymentStatus,
      returnStatus: response2.data.data.returnStatus
    });
    console.log('');
    
    // Test 3: Lấy thông tin đơn hàng
    console.log('📝 Test 3: Lấy thông tin đơn hàng');
    const response3 = await axios.get(
      `${API_URL}/orders`,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        },
        params: {
          limit: 1
        }
      }
    );
    
    const order = response3.data.data[0];
    console.log('✅ Order info:', {
      _id: order._id,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      returnStatus: order.returnStatus,
      oldStatus: order.status
    });
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Hướng dẫn sử dụng
console.log('📋 HƯỚNG DẪN SỬ DỤNG:');
console.log('1. Lấy admin token từ localStorage hoặc đăng nhập admin');
console.log('2. Lấy order ID từ database hoặc trang admin');
console.log('3. Thay ADMIN_TOKEN và ORDER_ID trong file này');
console.log('4. Chạy: node test-update-status.js\n');

if (ADMIN_TOKEN === 'YOUR_ADMIN_TOKEN_HERE' || ORDER_ID === 'YOUR_ORDER_ID_HERE') {
  console.log('⚠️  Vui lòng cập nhật ADMIN_TOKEN và ORDER_ID trước khi chạy!\n');
} else {
  testUpdateOrderStatus();
}
