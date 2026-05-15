const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testCategoryAPI() {
  console.log('🧪 Testing Category API...\n');

  try {
    // Test 1: Get all categories
    console.log('1️⃣ GET /api/category');
    const allRes = await axios.get(`${BASE_URL}/category`);
    console.log('✅ Success:', allRes.data.data.length, 'categories');
    console.log('   Sample:', allRes.data.data[0]?.name);

    // Test 2: Get pet categories
    console.log('\n2️⃣ GET /api/category?type=pet');
    const petRes = await axios.get(`${BASE_URL}/category?type=pet`);
    console.log('✅ Success:', petRes.data.data.length, 'pet categories');
    petRes.data.data.forEach(cat => {
      console.log('   -', cat.name);
    });

    // Test 3: Get product categories
    console.log('\n3️⃣ GET /api/category?type=product');
    const productRes = await axios.get(`${BASE_URL}/category?type=product`);
    console.log('✅ Success:', productRes.data.data.length, 'product categories');
    productRes.data.data.forEach(cat => {
      console.log('   -', cat.name);
    });

    // Test 4: Get active categories
    console.log('\n4️⃣ GET /api/category?isActive=true');
    const activeRes = await axios.get(`${BASE_URL}/category?isActive=true`);
    console.log('✅ Success:', activeRes.data.data.length, 'active categories');

    console.log('\n✅ All tests passed!');
    console.log('\n📊 Summary:');
    console.log('   Total categories:', allRes.data.data.length);
    console.log('   Pet categories:', petRes.data.data.length);
    console.log('   Product categories:', productRes.data.data.length);
    console.log('   Active categories:', activeRes.data.data.length);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

testCategoryAPI();
