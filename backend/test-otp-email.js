const { sendRegistrationOTP } = require('./src/utils/otpService');

// Load environment variables
require('dotenv').config();

async function testOTPEmail() {
  console.log('📧 Testing OTP Email System...\n');
  
  console.log('Email Configuration:');
  console.log('HOST:', process.env.EMAIL_HOST);
  console.log('PORT:', process.env.EMAIL_PORT);
  console.log('USER:', process.env.EMAIL_USER);
  console.log('FROM:', process.env.EMAIL_FROM);
  console.log('');

  const testEmail = 'ngoquangtruong2610@gmail.com';
  const testName = 'Test User';
  const testOTP = '123456';

  try {
    console.log(`📧 Sending OTP email to: ${testEmail}`);
    console.log(`👤 Name: ${testName}`);
    console.log(`🔢 OTP: ${testOTP}`);
    console.log('');

    await sendRegistrationOTP(testEmail, testName, testOTP);
    
    console.log('✅ OTP email sent successfully!');
    console.log(`📬 Check your Gmail inbox: ${testEmail}`);
    console.log('');
    console.log('🎉 Email system is working!');

  } catch (error) {
    console.error('❌ Email sending failed:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
  }
}

// Run the test
testOTPEmail();
