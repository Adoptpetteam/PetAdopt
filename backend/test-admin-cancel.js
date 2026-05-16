const axios = require('axios');

// Test admin cancel order API
async function testAdminCancel() {
  try {
    // 1. Login as admin
    console.log('1. Logging in as admin...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@petadopt.com',
      password: 'Admin123'
    });
    
    const token = loginRes.data.token;
    console.log('✓ Login successful, token:', token.substring(0, 20) + '...');

    // 2. Get all orders
    console.log('\n2. Getting all orders...');
    const ordersRes = await axios.get('http://localhost:5000/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const orders = ordersRes.data.data;
    console.log(`✓ Found ${orders.length} orders`);
    
    if (orders.length === 0) {
      console.log('✗ No orders found to test');
      return;
    }

    // 3. Find a cancellable order
    const cancellableOrder = orders.find(o => {
      const status = o.orderStatus || o.status;
      return !['delivered', 'cancelled', 'completed'].includes(status);
    });

    if (!cancellableOrder) {
      console.log('✗ No cancellable orders found');
      console.log('Order statuses:', orders.map(o => o.orderStatus || o.status));
      return;
    }

    console.log(`\n3. Found cancellable order: ${cancellableOrder._id}`);
    console.log(`   Status: ${cancellableOrder.orderStatus || cancellableOrder.status}`);
    console.log(`   Payment: ${cancellableOrder.paymentMethod}`);
    console.log(`   Payment Status: ${cancellableOrder.paymentStatus}`);

    // 4. Test cancel order
    console.log('\n4. Testing cancel order API...');
    const cancelRes = await axios.post(
      `http://localhost:5000/api/orders/${cancellableOrder._id}/admin-cancel`,
      { reason: 'Test hủy đơn - Sản phẩm hết hàng' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✓ Cancel successful!');
    console.log('Response:', cancelRes.data);

  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('URL:', error.config?.url);
    }
  }
}

testAdminCancel();
