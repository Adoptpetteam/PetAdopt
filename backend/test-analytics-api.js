require('dotenv').config();
const axios = require('axios');

async function testAnalyticsAPI() {
  try {
    console.log('🧪 Testing Analytics API...\n');

    // Login admin
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@petadopt.com',
      password: 'admin123'
    });

    const token = loginRes.data.token;
    console.log('✅ Admin login thành công\n');

    const headers = { Authorization: `Bearer ${token}` };

    // Test Analytics API
    console.log('📊 Test: GET /api/admin/analytics');
    const analyticsRes = await axios.get('http://localhost:5000/api/admin/analytics', { headers });
    
    console.log('   Response:', JSON.stringify(analyticsRes.data, null, 2));
    
    const data = analyticsRes.data.data;
    console.log(`\n   ✅ Doanh thu 7 ngày: ${data.revenueData.length} điểm dữ liệu`);
    console.log(`   ✅ Top sản phẩm: ${data.topProducts.length} sản phẩm`);
    console.log(`   ✅ Tăng trưởng user: ${data.userGrowth.length} tháng`);

    if (data.revenueData.length > 0) {
      console.log('\n   📈 Sample doanh thu:', data.revenueData[0]);
    }

    if (data.topProducts.length > 0) {
      console.log('   🏆 Top 1 sản phẩm:', data.topProducts[0]);
    }

    console.log('\n✅ API hoạt động tốt!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAnalyticsAPI();
