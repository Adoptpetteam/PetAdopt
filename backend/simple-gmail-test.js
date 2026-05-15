require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendGmailTest() {
  console.log('📧 Testing Gmail SMTP...\n');

  try {
    // Create Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ngoquangtruong2610@gmail.com',
        pass: 'your-gmail-app-password' // Bạn cần tạo App Password từ Google
      }
    });

    // Test email
    const mailOptions = {
      from: 'ngoquangtruong2610@gmail.com',
      to: 'ngoquangtruong2610@gmail.com',
      subject: '🐾 Test OTP - Pet Adopt',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #6272B6;">🐾 Pet Adopt - Test OTP</h1>
          <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #6272B6; font-size: 36px; margin: 0; letter-spacing: 8px;">
              123456
            </h2>
          </div>
          <p>Đây là email test từ Pet Adopt system.</p>
          <p>Nếu nhận được email này, hệ thống email đã hoạt động!</p>
        </div>
      `
    };

    console.log('📤 Sending test email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Gmail test failed:', error.message);
    
    // Try alternative - Ethereal (test email service)
    console.log('\n🔄 Trying Ethereal test email...');
    
    try {
      const testAccount = await nodemailer.createTestAccount();
      
      const etherealTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      const testMail = {
        from: testAccount.user,
        to: 'test@example.com',
        subject: 'Test Email - Pet Adopt',
        html: '<h1>Test Email</h1><p>This is a test email from Pet Adopt.</p>'
      };

      const testInfo = await etherealTransporter.sendMail(testMail);
      
      console.log('✅ Ethereal test email sent!');
      console.log('Preview URL:', nodemailer.getTestMessageUrl(testInfo));
      
    } catch (etherealError) {
      console.error('❌ Ethereal test also failed:', etherealError.message);
    }
  }
}

// Run test
sendGmailTest();
