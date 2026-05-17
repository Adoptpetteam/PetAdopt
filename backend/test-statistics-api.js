require('dotenv').config();
const axios = require('axios');

async function testStatisticsAPI() {
  try {
    console.log('🧪 Testing Statistics API...\n');

    // Lấy admin token từ localStorage hoặc tạo mới
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@petadopt.com',
      password: 'admin123'
    });

    const token = loginRes.data.token;
    console.log('✅ Admin login thành công\n');

    const headers = { Authorization: `Bearer ${token}` };

    // Test 1: Overview
    console.log('📊 Test 1: GET /api/statistics/overview');
    const overviewRes = await axios.get('http://localhost:5000/api/statistics/overview', {
      headers,
      params: {
        startDate: '2026-05-01',
        endDate: '2026-05-31'
      }
    });
    console.log('   Response:', JSON.stringify(overviewRes.data, null, 2));
    console.log(`   ✅ Tổng đơn: ${overviewRes.data.data.totalOrders}`);
    console.log(`   ✅ Doanh thu: ${overviewRes.data.data.totalRevenue.toLocaleString('vi-VN')}đ\n`);

    // Test 2: Revenue by time
    console.log('📈 Test 2: GET /api/statistics/revenue-by-time');
    const revenueRes = await axios.get('http://localhost:5000/api/statistics/revenue-by-time', {
      headers,
      params: {
        period: 'day',
        startDate: '2026-05-01',
        endDate: '2026-05-31'
      }
    });
    console.log(`   ✅ Số điểm dữ liệu: ${revenueRes.data.data.length}`);
    if (revenueRes.data.data.length > 0) {
      console.log('   Sample:', JSON.stringify(revenueRes.data.data[0], null, 2));
    }
    console.log();

    // Test 3: Top products
    console.log('🏆 Test 3: GET /api/statistics/top-products');
    const topProductsRes = await axios.get('http://localhost:5000/api/statistics/top-products', {
      headers,
      params: {
        limit: 5,
        startDate: '2026-05-01',
        endDate: '2026-05-31'
      }
    });
    console.log(`   ✅ Số sản phẩm: ${topProductsRes.data.data.length}`);
    if (topProductsRes.data.data.length > 0) {
      console.log('   Top 1:', topProductsRes.data.data[0].productName);
    }
    console.log();

    // Test 4: Inventory
    console.log('📦 Test 4: GET /api/statistics/inventory');
    const inventoryRes = await axios.get('http://localhost:5000/api/statistics/inventory', {
      headers,
      params: { lowStockThreshold: 10 }
    });
    console.log(`   ✅ Tổng sản phẩm: ${inventoryRes.data.data.summary.totalProducts}`);
    console.log(`   ✅ Giá trị tồn kho: ${inventoryRes.data.data.summary.totalInventoryValue.toLocaleString('vi-VN')}đ\n`);

    console.log('✅ Tất cả API hoạt động tốt!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('\n💡 Lỗi 401: Token không hợp lệ hoặc không có quyền admin');
    }
  }
}

testStatisticsAPI();
