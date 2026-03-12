const otplib = require('otplib');
const qrcode = require('qrcode');
const { sendEmail } = require('./emailService');

const authenticator = otplib.authenticator;
authenticator.options = { step: 120, window: 1 };

const generateRandomOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


const sendRegistrationOTP = async (email, name, otp) => {
  const subject = 'Xác thực Đăng ký - Pet Adopt';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Xác thực tài khoản Pet Adopt</h2>
      <p>Xin chào <strong>${name}</strong>,</p>
      <p>Mã OTP của bạn là:</p>
      <div style="background: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <h1 style="color: #4F46E5; font-size: 36px; margin: 0; letter-spacing: 8px;">
          ${otp}
        </h1>
      </div>
      <p>Mã này có hiệu lực trong <strong>5 phút</strong>.</p>
      <p style="color: #EF4444;">⚠️ Không chia sẻ mã này với bất kỳ ai!</p>
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
  generateUserSecret,
  generateQRCode,
  verifyAuthenticatorCode
};
