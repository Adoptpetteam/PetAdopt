/**
 * Test script cho Refund/Return/Exchange Flow
 * 
 * Chạy: node test-refund-flow.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Thay đổi token và orderId theo môi trường của bạn
const USER_TOKEN = 'your_user_token_here';
const ADMIN_TOKEN = 'your_admin_token_here';
const ORDER_ID = 'your_order_id_here';

const userApi = axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: `Bearer ${USER_TOKEN}` }
});

const adminApi = axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
});

// ============================================
// TEST SCENARIOS
// ============================================

async function testUserCancelOrder() {
  console.log('\n🧪 TEST 1: User hủy đơn COD');
  console.log('=====================================');
  
  try {
    const response = await userApi.put(`/orders/me/${ORDER_ID}/cancel`);
    console.log('✅ Success:', response.data.message);
    console.log('📦 Status:', response.data.data.status);
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

async function testUserRequestRefund() {
  console.log('\n🧪 TEST 2: User yêu cầu hoàn tiền');
  console.log('=====================================');
  
  try {
    const response = await userApi.post(`/orders/${ORDER_ID}/request-refund`, {
      reason: 'Không còn nhu cầu sử dụng',
      bankAccount: '1234567890',
      bankName: 'Vietcombank',
      accountHolder: 'NGUYEN VAN A',
      qrCodeImage: 'https://example.com/qr-code.jpg'
    });
    console.log('✅ Success:', response.data.message);
    console.log('📦 Status:', response.data.data.status);
    console.log('💰 Refund info:', response.data.data.refund);
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

async function testAdminProcessRefund() {
  console.log('\n🧪 TEST 3: Admin xử lý hoàn tiền');
  console.log('=====================================');
  
  try {
    const response = await adminApi.post(`/orders/${ORDER_ID}/process-refund`, {
      status: 'refund_completed',
      note: 'Đã chuyển khoản thành công vào tài khoản khách hàng',
      bankAccount: '1234567890',
      bankName: 'Vietcombank',
      accountHolder: 'NGUYEN VAN A'
    });
    console.log('✅ Success:', response.data.message);
    console.log('📦 Status:', response.data.data.status);
    console.log('💰 Refund info:', response.data.data.refund);
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

async function testUserRequestReturn() {
  console.log('\n🧪 TEST 4: User yêu cầu trả hàng');
  console.log('=====================================');
  
  try {
    const response = await userApi.post(`/orders/${ORDER_ID}/request-return-exchange`, {
      type: 'return',
      reason: 'Sản phẩm bị rách, không đúng mô tả',
      images: [
        'https://example.com/product-defect-1.jpg',
        'https://example.com/product-defect-2.jpg'
      ]
    });
    console.log('✅ Success:', response.data.message);
    console.log('📦 Status:', response.data.data.status);
    console.log('📸 Return info:', response.data.data.returnExchange);
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

async function testAdminProcessReturn() {
  console.log('\n🧪 TEST 5: Admin xử lý trả hàng');
  console.log('=====================================');
  
  try {
    const response = await adminApi.post(`/orders/${ORDER_ID}/process-return`, {
      action: 'approve_refund',
      note: 'Chấp nhận trả hàng, vui lòng gửi hàng về kho',
      inspectionNote: 'Sản phẩm thực sự bị lỗi',
      bankAccount: '1234567890',
      bankName: 'Vietcombank',
      accountHolder: 'NGUYEN VAN A',
      qrCodeImage: 'https://example.com/qr-refund.jpg'
    });
    console.log('✅ Success:', response.data.message);
    console.log('📦 Status:', response.data.data.status);
    console.log('💰 Refund info:', response.data.data.refund);
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

async function testAdminUpdateReturnStatus() {
  console.log('\n🧪 TEST 6: Admin cập nhật trạng thái vận chuyển');
  console.log('=====================================');
  
  try {
    // Bước 1: Hàng đang ship về
    let response = await adminApi.post(`/orders/${ORDER_ID}/update-return-status`, {
      status: 'return_shipping',
      trackingNumber: 'VN123456789',
      note: 'Hàng đang trên đường về kho'
    });
    console.log('✅ Step 1 - Shipping:', response.data.message);
    console.log('📦 Status:', response.data.data.status);
    
    // Bước 2: Đã nhận hàng
    response = await adminApi.post(`/orders/${ORDER_ID}/update-return-status`, {
      status: 'return_received',
      note: 'Đã nhận hàng trả về, đang kiểm tra'
    });
    console.log('✅ Step 2 - Received:', response.data.message);
    console.log('📦 Status:', response.data.data.status);
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

async function testUserRequestExchange() {
  console.log('\n🧪 TEST 7: User yêu cầu đổi hàng');
  console.log('=====================================');
  
  try {
    const response = await userApi.post(`/orders/${ORDER_ID}/request-return-exchange`, {
      type: 'exchange',
      reason: 'Sản phẩm bị lỗi sản xuất, muốn đổi sản phẩm mới',
      images: [
        'https://example.com/defect-1.jpg',
        'https://example.com/defect-2.jpg'
      ]
    });
    console.log('✅ Success:', response.data.message);
    console.log('📦 Status:', response.data.data.status);
    console.log('🔄 Exchange info:', response.data.data.returnExchange);
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

async function testAdminProcessExchange() {
  console.log('\n🧪 TEST 8: Admin xử lý đổi hàng');
  console.log('=====================================');
  
  try {
    const response = await adminApi.post(`/orders/${ORDER_ID}/process-exchange`, {
      action: 'approve',
      note: 'Chấp nhận đổi hàng, đã tạo đơn mới',
      inspectionNote: 'Sản phẩm bị lỗi sản xuất, đủ điều kiện đổi',
      trackingNumber: 'VN987654321'
    });
    console.log('✅ Success:', response.data.message);
    console.log('📦 Original Order Status:', response.data.data.originalOrder.status);
    console.log('🆕 New Order ID:', response.data.data.newOrder._id);
    console.log('💰 New Order Total:', response.data.data.newOrder.totals.total, 'VND');
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

async function testCompleteReturnFlow() {
  console.log('\n🧪 TEST 9: Flow hoàn chỉnh - Trả hàng');
  console.log('=====================================');
  
  try {
    // Step 1: User request return
    console.log('\n📝 Step 1: User yêu cầu trả hàng...');
    let response = await userApi.post(`/orders/${ORDER_ID}/request-return-exchange`, {
      type: 'return',
      reason: 'Sản phẩm không đúng mô tả',
      images: ['https://example.com/img.jpg']
    });
    console.log('✅', response.data.message);
    
    // Step 2: Admin approve
    console.log('\n📝 Step 2: Admin chấp nhận trả hàng...');
    response = await adminApi.post(`/orders/${ORDER_ID}/process-return`, {
      action: 'approve_refund',
      bankAccount: '1234567890',
      bankName: 'Vietcombank',
      accountHolder: 'NGUYEN VAN A'
    });
    console.log('✅', response.data.message);
    
    // Step 3: Update shipping
    console.log('\n📝 Step 3: Cập nhật trạng thái vận chuyển...');
    response = await adminApi.post(`/orders/${ORDER_ID}/update-return-status`, {
      status: 'return_shipping',
      trackingNumber: 'VN123456'
    });
    console.log('✅', response.data.message);
    
    // Step 4: Received
    console.log('\n📝 Step 4: Đã nhận hàng...');
    response = await adminApi.post(`/orders/${ORDER_ID}/update-return-status`, {
      status: 'return_received'
    });
    console.log('✅', response.data.message);
    
    // Step 5: Complete refund
    console.log('\n📝 Step 5: Hoàn tiền...');
    response = await adminApi.post(`/orders/${ORDER_ID}/process-refund`, {
      status: 'refund_completed',
      note: 'Đã hoàn tiền thành công'
    });
    console.log('✅', response.data.message);
    console.log('\n🎉 Flow hoàn chỉnh thành công!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

async function testCompleteExchangeFlow() {
  console.log('\n🧪 TEST 10: Flow hoàn chỉnh - Đổi hàng');
  console.log('=====================================');
  
  try {
    // Step 1: User request exchange
    console.log('\n📝 Step 1: User yêu cầu đổi hàng...');
    let response = await userApi.post(`/orders/${ORDER_ID}/request-return-exchange`, {
      type: 'exchange',
      reason: 'Sản phẩm bị lỗi',
      images: ['https://example.com/img.jpg']
    });
    console.log('✅', response.data.message);
    
    // Step 2: Admin approve and create new order
    console.log('\n📝 Step 2: Admin chấp nhận và tạo đơn mới...');
    response = await adminApi.post(`/orders/${ORDER_ID}/process-exchange`, {
      action: 'approve',
      note: 'Đã tạo đơn mới giá 0đ'
    });
    console.log('✅', response.data.message);
    console.log('🆕 New Order ID:', response.data.data.newOrder._id);
    console.log('\n🎉 Flow hoàn chỉnh thành công!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

// ============================================
// MENU
// ============================================

async function showMenu() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   TEST REFUND/RETURN/EXCHANGE FLOW    ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('\n📝 Chọn test scenario:');
  console.log('1.  User hủy đơn COD');
  console.log('2.  User yêu cầu hoàn tiền');
  console.log('3.  Admin xử lý hoàn tiền');
  console.log('4.  User yêu cầu trả hàng');
  console.log('5.  Admin xử lý trả hàng');
  console.log('6.  Admin cập nhật trạng thái vận chuyển');
  console.log('7.  User yêu cầu đổi hàng');
  console.log('8.  Admin xử lý đổi hàng');
  console.log('9.  Flow hoàn chỉnh - Trả hàng');
  console.log('10. Flow hoàn chỉnh - Đổi hàng');
  console.log('0.  Thoát');
  console.log('\n⚠️  Nhớ cập nhật USER_TOKEN, ADMIN_TOKEN, ORDER_ID trong file!');
}

async function main() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuestion = (query) => new Promise((resolve) => readline.question(query, resolve));

  while (true) {
    await showMenu();
    const choice = await askQuestion('\n👉 Nhập lựa chọn: ');

    switch (choice.trim()) {
      case '1':
        await testUserCancelOrder();
        break;
      case '2':
        await testUserRequestRefund();
        break;
      case '3':
        await testAdminProcessRefund();
        break;
      case '4':
        await testUserRequestReturn();
        break;
      case '5':
        await testAdminProcessReturn();
        break;
      case '6':
        await testAdminUpdateReturnStatus();
        break;
      case '7':
        await testUserRequestExchange();
        break;
      case '8':
        await testAdminProcessExchange();
        break;
      case '9':
        await testCompleteReturnFlow();
        break;
      case '10':
        await testCompleteExchangeFlow();
        break;
      case '0':
        console.log('\n👋 Tạm biệt!');
        readline.close();
        process.exit(0);
      default:
        console.log('\n❌ Lựa chọn không hợp lệ!');
    }

    await askQuestion('\n⏸️  Nhấn Enter để tiếp tục...');
  }
}

// Chạy nếu được gọi trực tiếp
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testUserCancelOrder,
  testUserRequestRefund,
  testAdminProcessRefund,
  testUserRequestReturn,
  testAdminProcessReturn,
  testAdminUpdateReturnStatus,
  testUserRequestExchange,
  testAdminProcessExchange,
  testCompleteReturnFlow,
  testCompleteExchangeFlow
};
