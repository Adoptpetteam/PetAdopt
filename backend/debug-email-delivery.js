require('dotenv').config();
const nodemailer = require('nodemailer');

async function debugEmailDelivery() {
  console.log('🔍 Debug Email Delivery System...\n');

  try {
    // Test 1: Check environment variables
    console.log('1. Environment Variables:');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET');

    // Test 2: Create transporter with detailed config
    console.log('\n2. Creating transporter...');
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: 'a083f7001@smtp-brevo.com',
        pass: 'bskoJQc6jDgj65V'
      },
      debug: true, // Enable debug
      logger: true // Enable logging
    });

    // Test 3: Verify connection
    console.log('\n3. Testing SMTP connection...');
    try {
      await transporter.verify();
      console.log('✅ SMTP connection successful');
    } catch (error) {
      console.log('❌ SMTP connection failed:', error.message);
      return;
    }

    // Test 4: Send simple test email
    console.log('\n4. Sending simple test email...');
    const mailOptions = {
      from: '"Pet Adopt Test" <ngoquangtruong2610@gmail.com>',
      to: 'ngoquangtruong2610@gmail.com',
      subject: 'Test Email - Simple',
      text: 'This is a simple test email.',
      html: '<h1>Test Email</h1><p>This is a simple test email from Pet Adopt.</p>'
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

    // Test 5: Try alternative SMTP settings
    console.log('\n5. Testing alternative SMTP settings...');
    const altTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ngoquangtruong2610@gmail.com',
        pass: 'your-app-password' // You need to generate this
      }
    });

    console.log('Alternative transporter created (Gmail SMTP)');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run debug
debugEmailDelivery();