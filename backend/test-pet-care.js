const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test token (replace with actual token)
const TEST_TOKEN = 'your_test_token_here';

async function testPetCareSystem() {
  console.log('🧪 Testing Pet Care System...\n');

  try {
    // Test 1: Get user's adopted pets
    console.log('1. Testing adopted pets fetch...');
    const adoptionsResponse = await axios.get(`${API_URL}/adoption/my-requests`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    console.log('✅ Adoptions API working');

    // Test 2: Get health records
    console.log('2. Testing health records...');
    const healthResponse = await axios.get(`${API_URL}/health-records/pet/test-pet-id`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    console.log('✅ Health records API working');

    // Test 3: Get vaccinations
    console.log('3. Testing vaccinations...');
    const vaccinationsResponse = await axios.get(`${API_URL}/vaccinations/me`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    console.log('✅ Vaccinations API working');

    // Test 4: Get notifications
    console.log('4. Testing notifications...');
    const notificationsResponse = await axios.get(`${API_URL}/notifications/recent`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    console.log('✅ Notifications API working');

    console.log('\n🎉 All Pet Care APIs are working correctly!');

  } catch (error) {
    console.error('❌ Error testing APIs:', error.response?.data || error.message);
  }
}

// Run test if token is provided
if (process.argv[2]) {
  const token = process.argv[2];
  testPetCareSystem();
} else {
  console.log('Usage: node test-pet-care.js <your_jwt_token>');
  console.log('Example: node test-pet-care.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
}