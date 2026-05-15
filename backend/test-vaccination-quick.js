const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Use admin credentials for testing
const adminUser = {
  email: 'admin@petadopt.com',
  password: 'admin123'
};

let authToken = '';

async function quickVaccinationTest() {
  try {
    console.log('🧪 Quick Vaccination API Test...\n');

    // 1. Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, adminUser);
    
    if (loginResponse.data.success && loginResponse.data.token) {
      authToken = loginResponse.data.token;
      console.log('✅ Admin login successful');
    } else {
      throw new Error('Admin login failed');
    }

    // 2. Test vaccination endpoints
    console.log('\n2. Testing vaccination endpoints...');
    
    // Test GET /api/vaccinations/me
    try {
      const myVaccinationsResponse = await axios.get(`${API_URL}/vaccinations/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ GET /vaccinations/me - Status: ${myVaccinationsResponse.status}`);
      console.log(`   Found ${myVaccinationsResponse.data.data?.length || 0} vaccinations`);
    } catch (error) {
      console.log(`❌ GET /vaccinations/me failed - Status: ${error.response?.status}`);
      console.log(`   Error: ${error.response?.data?.message}`);
    }

    // Test GET /api/vaccinations/upcoming
    try {
      const upcomingResponse = await axios.get(`${API_URL}/vaccinations/upcoming`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ GET /vaccinations/upcoming - Status: ${upcomingResponse.status}`);
      console.log(`   Found ${upcomingResponse.data.data?.length || 0} upcoming vaccinations`);
    } catch (error) {
      console.log(`❌ GET /vaccinations/upcoming failed - Status: ${error.response?.status}`);
      console.log(`   Error: ${error.response?.data?.message}`);
    }

    // Test admin endpoints
    console.log('\n3. Testing admin vaccination endpoints...');
    
    try {
      const allVaccinationsResponse = await axios.get(`${API_URL}/vaccinations/admin/all`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ GET /vaccinations/admin/all - Status: ${allVaccinationsResponse.status}`);
      console.log(`   Found ${allVaccinationsResponse.data.data?.length || 0} total vaccinations`);
    } catch (error) {
      console.log(`❌ GET /vaccinations/admin/all failed - Status: ${error.response?.status}`);
      console.log(`   Error: ${error.response?.data?.message}`);
    }

    // 4. Test pets endpoint to see available pets
    console.log('\n4. Checking available pets...');
    try {
      const petsResponse = await axios.get(`${API_URL}/pets`);
      console.log(`✅ GET /pets - Status: ${petsResponse.status}`);
      console.log(`   Found ${petsResponse.data.data?.length || 0} pets`);
      
      if (petsResponse.data.data && petsResponse.data.data.length > 0) {
        const firstPet = petsResponse.data.data[0];
        console.log(`   First pet: ${firstPet.name} (ID: ${firstPet._id})`);
        console.log(`   Images: ${firstPet.images?.length || 0} images`);
      }
    } catch (error) {
      console.log(`❌ GET /pets failed - Status: ${error.response?.status}`);
    }

    // 5. Test adoption requests to see if any exist
    console.log('\n5. Checking adoption requests...');
    try {
      const adoptionsResponse = await axios.get(`${API_URL}/adoption`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ GET /adoption - Status: ${adoptionsResponse.status}`);
      console.log(`   Found ${adoptionsResponse.data.data?.length || 0} adoption requests`);
      
      const approvedAdoptions = adoptionsResponse.data.data?.filter(req => req.status === 'approved') || [];
      console.log(`   Approved adoptions: ${approvedAdoptions.length}`);
    } catch (error) {
      console.log(`❌ GET /adoption failed - Status: ${error.response?.status}`);
    }

    console.log('\n🎉 Quick vaccination test completed!');

  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
quickVaccinationTest();