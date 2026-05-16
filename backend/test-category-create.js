const axios = require('axios');

// Test tạo category
async function testCreateCategory() {
  try {
    console.log('=== TEST CREATE CATEGORY ===\n');
    
    // Bước 1: Login admin để lấy token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@petadopt.com', // Thay bằng email admin của bạn
      password: 'admin123'          // Thay bằng password admin của bạn
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful!');
    console.log('Token:', token.substring(0, 20) + '...\n');
    
    // Bước 2: Tạo category mới
    console.log('2. Creating new category...');
    const categoryData = {
      name: 'Test Category ' + Date.now(),
      description: 'This is a test category',
      type: 'pet',
      icon: '🐕',
      color: '#6272B6',
      isActive: true
    };
    
    console.log('Category data:', categoryData);
    
    const createResponse = await axios.post(
      'http://localhost:5000/api/category',
      categoryData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Category created successfully!');
    console.log('Response:', createResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testCreateCategory();
