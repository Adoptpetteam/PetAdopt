const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

let authToken = '';
let testPetId = '';

async function testVaccinationSystem() {
  try {
    console.log('🧪 Testing Vaccination System...\n');

    // 1. Login to get token
    console.log('1. Logging in...');
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      
      if (loginResponse.data.success) {
        authToken = loginResponse.data.token;
        console.log('✅ Login successful');
      }
    } catch (error) {
      console.log('❌ Login failed, trying to register...');
      
      // Try to register if login fails
      try {
        const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
        console.log('Register response:', JSON.stringify(registerResponse.data, null, 2));
        if (registerResponse.data.success && registerResponse.data.token) {
          authToken = registerResponse.data.token;
          console.log('✅ Registration successful');
        } else if (registerResponse.data.data?.token) {
          authToken = registerResponse.data.data.token;
          console.log('✅ Registration successful (token in data)');
        }
      } catch (regError) {
        console.log('❌ Registration also failed:', regError.response?.data?.message);
        console.log('Full error:', regError.response?.data);
      }
    }

    if (!authToken) {
      throw new Error('Could not get auth token');
    }

    // 2. Get available pets
    console.log('\n2. Getting available pets...');
    const petsResponse = await axios.get(`${API_URL}/pets`);
    if (petsResponse.data.success && petsResponse.data.data.length > 0) {
      testPetId = petsResponse.data.data[0]._id;
      console.log(`✅ Found pet: ${petsResponse.data.data[0].name} (ID: ${testPetId})`);
    } else {
      throw new Error('No pets available for testing');
    }

    // 3. Create adoption request (needed for vaccination)
    console.log('\n3. Creating adoption request...');
    try {
      const adoptionResponse = await axios.post(`${API_URL}/adoption`, {
        petId: testPetId,
        fullName: testUser.name,
        phone: '0123456789',
        address: '123 Test Street',
        reason: 'Test adoption for vaccination system',
        experience: 'beginner',
        housingType: 'apartment',
        familyMembers: '2',
        monthlyIncome: '10-20 triệu',
        hasYard: false,
        hasOtherPets: false
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (adoptionResponse.data.success) {
        console.log('✅ Adoption request created');
        
        // Auto-approve for testing (admin function)
        const adoptionId = adoptionResponse.data.data._id;
        console.log('   Auto-approving adoption request...');
        
        // This would normally require admin token, but let's continue with vaccination test
      }
    } catch (error) {
      console.log('⚠️  Adoption request may already exist, continuing...');
    }

    // 4. Test vaccination creation
    console.log('\n4. Testing vaccination creation...');
    const vaccinationData = {
      petId: testPetId,
      vaccineName: 'Test Vaccine - Rabies',
      vaccineType: 'rabies',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      description: 'Test vaccination for system testing',
      veterinarian: {
        name: 'Dr. Test Vet',
        clinic: 'Test Veterinary Clinic'
      },
      doseNumber: 1,
      totalDoses: 1
    };

    try {
      const vaccinationResponse = await axios.post(`${API_URL}/vaccinations`, vaccinationData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (vaccinationResponse.data.success) {
        console.log('✅ Vaccination created successfully');
        console.log(`   Vaccination ID: ${vaccinationResponse.data.data._id}`);
        console.log(`   Pet: ${vaccinationResponse.data.data.pet?.name || 'N/A'}`);
        console.log(`   Scheduled: ${new Date(vaccinationResponse.data.data.scheduledDate).toLocaleDateString('vi-VN')}`);
      }
    } catch (error) {
      console.log('❌ Vaccination creation failed:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}`);
      console.log(`   Details: ${JSON.stringify(error.response?.data, null, 2)}`);
    }

    // 5. Test getting user vaccinations
    console.log('\n5. Testing get user vaccinations...');
    try {
      const myVaccinationsResponse = await axios.get(`${API_URL}/vaccinations/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (myVaccinationsResponse.data.success) {
        console.log(`✅ Retrieved ${myVaccinationsResponse.data.data.length} vaccinations`);
        myVaccinationsResponse.data.data.forEach((vaccination, index) => {
          console.log(`   ${index + 1}. ${vaccination.vaccineName} - ${vaccination.status}`);
        });
      }
    } catch (error) {
      console.log('❌ Get vaccinations failed:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}`);
    }

    // 6. Test upcoming vaccinations
    console.log('\n6. Testing upcoming vaccinations...');
    try {
      const upcomingResponse = await axios.get(`${API_URL}/vaccinations/upcoming`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (upcomingResponse.data.success) {
        console.log(`✅ Retrieved ${upcomingResponse.data.data.length} upcoming vaccinations`);
      }
    } catch (error) {
      console.log('❌ Get upcoming vaccinations failed:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}`);
    }

    console.log('\n🎉 Vaccination system test completed!');

  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testVaccinationSystem();
