require('dotenv').config();
const { sendRegistrationOTP } = require('./src/utils/otpService');
const { sendEmail } = require('./src/utils/emailService');

async function testEmailRegistration() {
  console.log('🧪 Testing Email Registration System...\n');

  try {
    // Test 1: Basic email service
    console.log('1. Testing basic email service...');
    try {
      await sendEmail(
        'ngoquangtruong2610@gmail.com',
        'Test Email - Pet Adopt',
        '<h1>Test Email</h1><p>This is a test email from Pet Adopt system.</p>'
      );
      console.log('✅ Basic email service working');
    } catch (error) {
      console.log('❌ Basic email service failed:', error.message);
      return;
    }

    // Test 2: OTP Registration email
    console.log('\n2. Testing OTP registration email...');
    try {
      const testOTP = '123456';
      await sendRegistrationOTP(
        'ngoquangtruong2610@gmail.com',
        'Test User',
        testOTP
      );
      console.log('✅ OTP registration email sent successfully');
    } catch (error) {
      console.log('❌ OTP registration email failed:', error.message);
    }

    // Test 3: Check email configuration
    console.log('\n3. Checking email configuration...');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***HIDDEN***' : 'NOT SET');

    console.log('\n🎉 Email test completed!');

  } catch (error) {
    console.error('\n💥 Email test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testEmailRegistration();
