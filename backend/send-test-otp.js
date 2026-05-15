require('dotenv').config();
const { sendRegistrationOTP } = require('./src/utils/otpService');

async function sendTestOTP() {
  console.log('📧 Gửi test OTP đến email...\n');

  try {
    // Tạo OTP test
    const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log('🔢 OTP được tạo:', testOTP);
    console.log('📤 Đang gửi email...');
    
    // Gửi đến email test
    await sendRegistrationOTP(
      'ngoquangtruong2610@gmail.com', // Email nhận
      'Test User', // Tên người dùng
      testOTP // Mã OTP
    );
    
    console.log('✅ Email đã được gửi thành công!');
    console.log('📧 Kiểm tra hộp thư: ngoquangtruong2610@gmail.com');
    console.log('🔍 Tìm email từ: Pet Adopt');
    console.log('📝 Subject: 🐾 Xác thực Đăng ký - Pet Adopt');
    console.log('\n⏰ Email sẽ đến trong vòng 1-2 phút');
    console.log('📂 Nếu không thấy trong Inbox, kiểm tra thư mục Spam/Junk');
    
  } catch (error) {
    console.error('❌ Lỗi gửi email:', error.message);
  }
}

// Gửi test OTP
sendTestOTP();
