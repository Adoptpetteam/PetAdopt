const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Lấy admin token từ localStorage hoặc tạo mới
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE'; // Thay bằng token thật

async function testCreateCategory() {
  console.log('🧪 Testing Create Category API...\n');

  try {
    // Test 1: Create product category
    console.log('1️⃣ Creating product category...');
    const newCategory = {
      name: 'Test Category ' + Date.now(),
      description: 'This is a test category',
      type: 'product'
    };

    const res = await axios.post(`${BASE_URL}/category`, newCategory, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success!');
    console.log('   Created:', res.data.data.name);
    console.log('   ID:', res.data.data._id);

    // Test 2: Try to create duplicate (should fail)
    console.log('\n2️⃣ Testing duplicate detection...');
    try {
      await axios.post(`${BASE_URL}/category`, newCategory, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Should have failed but succeeded!');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected duplicate:', error.response.data.message);
      } else {
        throw error;
      }
    }

    // Test 3: Create without required fields (should fail)
    console.log('\n3️⃣ Testing validation...');
    try {
      await axios.post(`${BASE_URL}/category`, { description: 'No name' }, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Should have failed but succeeded!');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected invalid data:', error.response.data.message);
      } else {
        throw error;
      }
    }

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    
    if (error.response?.status === 401) {
      console.log('\n💡 You need to update ADMIN_TOKEN in this script');
      console.log('   1. Login to admin panel');
      console.log('   2. Open DevTools (F12) → Console');
      console.log('   3. Type: localStorage.getItem("admin_token")');
      console.log('   4. Copy the token and paste it in this script');
    }
  }
}

testCreateCategory();
