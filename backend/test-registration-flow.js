const mongoose = require('mongoose');
const { register, verifyRegistrationOTP } = require('./src/controllers/authController');

// Load environment variables
require('dotenv').config();

// Mock request and response objects
const createMockReq = (body) => ({ body });
const createMockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.jsonData = data;
    return res;
  };
  return res;
};

async function testRegistrationFlow() {
  console.log('🧪 Testing Complete Registration Flow...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test data
    const testUser = {
      name: 'Test User Registration',
      email: 'ngoquangtruong2610@gmail.com',
      password: 'testpassword123'
    };

    console.log('\n📝 Step 1: Testing Registration...');
    console.log('User data:', testUser);

    // Test registration
    const registerReq = createMockReq(testUser);
    const registerRes = createMockRes();
    
    await register(registerReq, registerRes, () => {});
    
    console.log('Registration response status:', registerRes.statusCode);
    console.log('Registration response:', registerRes.jsonData);

    if (registerRes.statusCode === 201) {
      console.log('✅ Registration successful - OTP email should be sent!');
      console.log('📧 Check your Gmail for the OTP email');
      
      console.log('\n🔢 Step 2: Testing OTP Verification with bypass code...');
      
      // Test OTP verification with bypass code
      const otpReq = createMockReq({
        email: testUser.email,
        otp: '999999' // Bypass OTP for testing
      });
      const otpRes = createMockRes();
      
      await verifyRegistrationOTP(otpReq, otpRes, () => {});
      
      console.log('OTP verification status:', otpRes.statusCode);
      console.log('OTP verification response:', otpRes.jsonData);
      
      if (otpRes.statusCode === 200) {
        console.log('✅ OTP verification successful!');
        console.log('🎉 Complete registration flow working!');
      } else {
        console.log('❌ OTP verification failed');
      }
    } else {
      console.log('❌ Registration failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testRegistrationFlow();