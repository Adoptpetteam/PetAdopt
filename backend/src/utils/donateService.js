const { sendEmail } = require('./emailService');

/**
 * Gửi email cảm ơn sau khi donate thành công
 * @param {string} email - Email người ủng hộ
 * @param {string} name - Tên người ủng hộ (nếu có)
 * @param {number} amount - Số tiền ủng hộ (VND)
 */
const sendDonationThankYou = async (email, name, amount) => {
  const displayName = name ? name.trim() : 'Bạn';
  const formattedAmount = Number(amount).toLocaleString('vi-VN');

  const subject = '💛 LỜI CẢM ƠN TỪ TRUNG TÂM BẢO TRỢ ĐỘNG VẬT HANOIPETADROPT';

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lời cảm ơn</title>
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6272B6,#8B9FE8);padding:40px 32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">🐾</div>
      <h1 style="color:#ffffff;font-size:24px;font-weight:bold;margin:0;letter-spacing:1px;">
        💛 LỜI CẢM ƠN 💛
      </h1>
      <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:12px 0 0;">
        Trung tâm Bảo trợ Động vật Hanoipetadropt
      </p>
    </div>

    <!-- Body -->
    <div style="padding:40px 32px;">

      <!-- Thông tin donation -->
      <div style="background:#EEF2FF;border:2px solid #C7D2FE;border-radius:12px;padding:20px;margin-bottom:28px;text-align:center;">
        <p style="margin:0 0 6px;font-size:14px;color:#6366F1;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
          Đóng góp của bạn
        </p>
        <p style="margin:0;font-size:32px;font-weight:bold;color:#4338CA;">
          ${formattedAmount} <span style="font-size:18px;color:#6366F1;">VND</span>
        </p>
        ${name ? `<p style="margin:8px 0 0;font-size:14px;color:#6B7280;">Từ: <strong>${displayName}</strong></p>` : ''}
      </div>

      <!-- Nội dung thư -->
      <p style="font-size:16px;color:#374151;line-height:1.8;margin:0 0 20px;">
        Kính gửi <strong>${displayName}</strong>,
      </p>

      <p style="font-size:15px;color:#374151;line-height:1.9;margin:0 0 20px;">
        Trung tâm bảo trợ động vật <strong>Hanoipetadropt</strong> xin gửi lời cảm ơn chân thành và sâu sắc đến bạn đã luôn quan tâm, yêu thương và ủng hộ các bé cún trong thời gian qua.
      </p>

      <p style="font-size:15px;color:#374151;line-height:1.9;margin:0 0 20px;">
        Mỗi sự giúp đỡ của bạn – dù là một phần quà nhỏ, một lời chia sẻ, hay đơn giản là một lần ghé thăm – đều mang lại cho các bé thêm cơ hội được chăm sóc tốt hơn và tiến gần hơn đến một mái ấm thật sự.
      </p>

      <p style="font-size:15px;color:#374151;line-height:1.9;margin:0 0 20px;">
        Chính nhờ tấm lòng nhân ái của bạn mà các bé cún không còn cô đơn, có thêm niềm tin và hy vọng vào một cuộc sống ấm áp, tràn đầy yêu thương.
      </p>

      <p style="font-size:15px;color:#374151;line-height:1.9;margin:0 0 20px;">
        Chúng tôi hy vọng sẽ tiếp tục nhận được sự đồng hành của bạn trong hành trình bảo vệ và chăm sóc những "người bạn nhỏ" này.
      </p>

      <p style="font-size:15px;color:#374151;line-height:1.9;margin:0 0 32px;">
        Xin chân thành cảm ơn! 🐾💖
      </p>

      <!-- Footer info -->
      <div style="border-top:1px solid #E5E7EB;padding-top:24px;">
        <p style="font-size:13px;color:#9CA3AF;margin:0;line-height:1.8;">
          📍 123 Lê Lợi, Hải Phòng<br/>
          📧 t1petadopt.co@gmail.com<br/>
          📞 0866192325<br/>
          🌐 hanoipetadropt.com
        </p>
      </div>

    </div>

    <!-- Bottom bar -->
    <div style="background:#F3F4F6;padding:20px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9CA3AF;">
        Email này được gửi tự động từ Trung tâm Bảo trợ Động vật Hanoipetadropt.
      </p>
    </div>

  </div>
</body>
</html>
  `;

  try {
    await sendEmail(email, subject, html);
    console.log(`[Donate] Thank-you email sent to ${email} for ${formattedAmount} VND`);
  } catch (error) {
    console.error(`[Donate] Failed to send thank-you email to ${email}:`, error.message);
  }
};

module.exports = { sendDonationThankYou };
