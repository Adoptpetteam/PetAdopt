require('dotenv').config();
const { sendEmail } = require('./src/utils/emailService');

async function testEmail() {
  try {
    const testEmail = 'ngoquangtruong2610@gmail.com';
    
    console.log('🚀 Testing email service...');
    console.log('📧 Sending to:', testEmail);
    
    const subject = '✅ Test Email - PetAdopt System';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6272B6, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🎉 Email Test Successful!</h1>
        </div>
        <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p>Chào Ngô Quang Trường,</p>
          <p>Đây là email test từ hệ thống <strong>PetAdopt</strong>!</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6272B6;">
            <h3 style="color: #6272B6; margin-top: 0;">📋 Thông tin test</h3>
            <p><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
            <p><strong>Hệ thống:</strong> PetAdopt Email Service</p>
            <p><strong>Email gửi từ:</strong> ${process.env.EMAIL_USER}</p>
            <p><strong>Trạng thái:</strong> <span style="color: #10b981; font-weight: bold;">✅ Hoạt động tốt</span></p>
          </div>

          <p>Nếu bạn nhận được email này, có nghĩa là hệ thống email đang hoạt động bình thường!</p>
          <p style="margin-bottom: 0;">Trân trọng,<br/><strong>Đội ngũ PetAdopt</strong></p>
        </div>
      </div>
    `;
    
    await sendEmail(testEmail, subject, html);
    
    console.log('✅ Email sent successfully!');
    console.log('📬 Check your inbox:', testEmail);
    process.exit(0);
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

testEmail();
