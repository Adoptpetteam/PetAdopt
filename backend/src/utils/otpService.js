const otplib = require('otplib');
const qrcode = require('qrcode');
const { sendEmail } = require('./emailService');

const authenticator = otplib.authenticator;
authenticator.options = { step: 120, window: 1 };

const generateRandomOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


const sendRegistrationOTP = async (email, name, otp) => {
  const subject = '🐾 Xác thực Đăng ký - Pet Adopt';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6272B6; margin: 0; font-size: 28px;">🐾 Pet Adopt</h1>
          <p style="color: #666; margin: 10px 0 0 0;">Xác Thực Tài Khoản</p>
        </div>

        <!-- Welcome Message -->
        <div style="background: linear-gradient(135deg, #6272B6, #8b5cf6); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
          <h2 style="margin: 0; font-size: 24px;">🎉 Chào mừng đến với Pet Adopt!</h2>
          <p style="margin: 10px 0 0 0;">Chỉ còn một bước nữa để hoàn tất đăng ký</p>
        </div>

        <!-- Main Content -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Xin chào ${name}! 👋</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Cảm ơn bạn đã đăng ký tài khoản Pet Adopt! Để hoàn tất quá trình đăng ký, vui lòng nhập mã OTP dưới đây:
          </p>

          <!-- OTP Code -->
          <div style="background: linear-gradient(135deg, #f8f9ff, #e0e7ff); padding: 30px; text-align: center; border-radius: 12px; margin: 25px 0; border: 2px dashed #6272B6;">
            <p style="color: #6272B6; margin: 0 0 10px 0; font-weight: bold; font-size: 16px;">MÃ XÁC THỰC CỦA BẠN</p>
            <h1 style="color: #6272B6; font-size: 48px; margin: 0; letter-spacing: 8px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
              ${otp}
            </h1>
            <p style="color: #8b5cf6; margin: 10px 0 0 0; font-size: 14px;">Có hiệu lực trong 5 phút</p>
          </div>

          <!-- Instructions -->
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #fbbf24; margin-bottom: 20px;">
            <h4 style="color: #d97706; margin: 0 0 10px 0;">📋 Hướng dẫn:</h4>
            <ol style="color: #92400e; margin: 0; padding-left: 20px;">
              <li>Sao chép mã OTP ở trên</li>
              <li>Quay lại trang đăng ký</li>
              <li>Nhập mã vào ô "Mã OTP"</li>
              <li>Nhấn "Xác thực" để hoàn tất</li>
            </ol>
          </div>

          <!-- Security Notice -->
          <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 20px;">
            <h4 style="color: #dc2626; margin: 0 0 10px 0;">🔒 Lưu ý bảo mật:</h4>
            <ul style="color: #991b1b; margin: 0; padding-left: 20px;">
              <li><strong>KHÔNG chia sẻ</strong> mã này với bất kỳ ai</li>
              <li>Mã chỉ có hiệu lực trong <strong>5 phút</strong></li>
              <li>Nếu không phải bạn đăng ký, hãy bỏ qua email này</li>
            </ul>
          </div>

          <!-- Benefits -->
          <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #065f46; margin: 0 0 15px 0;">🌟 Sau khi xác thực, bạn có thể:</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div style="color: #064e3b;">🐕 Nhận nuôi thú cưng</div>
              <div style="color: #064e3b;">🛒 Mua sắm sản phẩm</div>
              <div style="color: #064e3b;">💝 Ủng hộ từ thiện</div>
              <div style="color: #064e3b;">📰 Đọc tin tức</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
          <p style="margin: 0 0 10px 0;">
            <strong>Pet Adopt - Chăm sóc thú cưng với tình yêu thương</strong>
          </p>
          <p style="margin: 0;">
            📧 Email: ${process.env.EMAIL_FROM} | 🌐 Website: ${process.env.FRONTEND_URL}
          </p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
            Email này được gửi tự động, vui lòng không trả lời trực tiếp
          </p>
        </div>
      </div>
    </div>
  `;
  
  await sendEmail(email, subject, html);
};

const sendPasswordResetOTP = async (email, name, otp) => {
  const subject = '🔐 Đặt lại mật khẩu - Pet Adopt';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6272B6; margin: 0; font-size: 28px;">🐾 Pet Adopt</h1>
          <p style="color: #666; margin: 10px 0 0 0;">Đặt Lại Mật Khẩu</p>
        </div>

        <!-- Alert Badge -->
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
          <h2 style="margin: 0; font-size: 24px;">🔐 Yêu cầu đặt lại mật khẩu</h2>
          <p style="margin: 10px 0 0 0;">Mã xác thực để đặt lại mật khẩu</p>
        </div>

        <!-- Main Content -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Xin chào ${name}! 👋</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã OTP dưới đây để tiếp tục:
          </p>

          <!-- OTP Code -->
          <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 30px; text-align: center; border-radius: 12px; margin: 25px 0; border: 2px dashed #f59e0b;">
            <p style="color: #d97706; margin: 0 0 10px 0; font-weight: bold; font-size: 16px;">MÃ ĐẶT LẠI MẬT KHẨU</p>
            <h1 style="color: #d97706; font-size: 48px; margin: 0; letter-spacing: 8px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
              ${otp}
            </h1>
            <p style="color: #92400e; margin: 10px 0 0 0; font-size: 14px;">Có hiệu lực trong 15 phút</p>
          </div>

          <!-- Instructions -->
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 20px;">
            <h4 style="color: #1e40af; margin: 0 0 10px 0;">📋 Các bước tiếp theo:</h4>
            <ol style="color: #1e3a8a; margin: 0; padding-left: 20px;">
              <li>Sao chép mã OTP ở trên</li>
              <li>Quay lại trang đặt lại mật khẩu</li>
              <li>Nhập mã OTP và mật khẩu mới</li>
              <li>Nhấn "Đặt lại mật khẩu"</li>
            </ol>
          </div>

          <!-- Security Warning -->
          <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 20px;">
            <h4 style="color: #dc2626; margin: 0 0 10px 0;">⚠️ Cảnh báo bảo mật:</h4>
            <ul style="color: #991b1b; margin: 0; padding-left: 20px;">
              <li>Nếu <strong>KHÔNG PHẢI BẠN</strong> yêu cầu đặt lại mật khẩu, hãy bỏ qua email này</li>
              <li>Mã chỉ có hiệu lực trong <strong>15 phút</strong></li>
              <li>Không chia sẻ mã này với bất kỳ ai</li>
              <li>Hãy đổi mật khẩu thành mật khẩu mạnh và duy nhất</li>
            </ul>
          </div>

          <!-- Tips -->
          <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #065f46; margin: 0 0 10px 0;">💡 Mẹo tạo mật khẩu mạnh:</h4>
            <ul style="color: #064e3b; margin: 0; padding-left: 20px;">
              <li>Ít nhất 8 ký tự</li>
              <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
              <li>Không sử dụng thông tin cá nhân</li>
              <li>Không tái sử dụng mật khẩu cũ</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
          <p style="margin: 0 0 10px 0;">
            <strong>Pet Adopt - Chăm sóc thú cưng với tình yêu thương</strong>
          </p>
          <p style="margin: 0;">
            📧 Email: ${process.env.EMAIL_FROM} | 🌐 Website: ${process.env.FRONTEND_URL}
          </p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
            Nếu có vấn đề, vui lòng liên hệ hỗ trợ
          </p>
        </div>
      </div>
    </div>
  `;

  await sendEmail(email, subject, html);
};


const generateUserSecret = () => {
  return authenticator.generateSecret();
};

const generateQRCode = async (userEmail, secret) => {
  const otpauth = authenticator.keyuri(userEmail, 'PetAdopt-System', secret);
  return await qrcode.toDataURL(otpauth);
};

const verifyAuthenticatorCode = (token, secret) => {
  return authenticator.verify({ token, secret });
};

module.exports = {
  generateRandomOTP,
  sendRegistrationOTP,
  sendPasswordResetOTP,
  generateUserSecret,
  generateQRCode,
  verifyAuthenticatorCode
};
