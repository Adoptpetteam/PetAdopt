const nodemailer = require('nodemailer');

const getTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.sendEmail = async (to, subject, html) => {
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send error:', error.message);
    throw error;
  }
};

// ===============================
// VACCINATION EMAIL TEMPLATES
// ===============================

exports.sendVaccinationConfirmation = async (email, data) => {
  const { ownerName, petName, vaccineName, scheduledDate, veterinarian } = data;
  
  const subject = `🐾 Xác nhận lịch tiêm phòng cho ${petName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6272B6; margin: 0; font-size: 28px;">🐾 Pet Adopt</h1>
          <p style="color: #666; margin: 10px 0 0 0;">Lịch Tiêm Phòng Thú Cưng</p>
        </div>

        <!-- Main Content -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Xin chào ${ownerName}! 👋</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Chúng tôi đã ghi nhận lịch tiêm phòng cho thú cưng của bạn. Dưới đây là thông tin chi tiết:
          </p>

          <!-- Pet Info Card -->
          <div style="background-color: #f8f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #6272B6; margin-bottom: 20px;">
            <h3 style="color: #6272B6; margin: 0 0 15px 0; font-size: 18px;">📋 Thông tin tiêm phòng</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold; width: 40%;">🐕 Tên thú cưng:</td>
                <td style="padding: 8px 0; color: #333;">${petName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">💉 Loại vaccine:</td>
                <td style="padding: 8px 0; color: #333;">${vaccineName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">📅 Ngày tiêm:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold; color: #6272B6;">
                  ${new Date(scheduledDate).toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
              </tr>
              ${veterinarian.name ? `
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">👨‍⚕️ Bác sĩ thú y:</td>
                <td style="padding: 8px 0; color: #333;">${veterinarian.name}</td>
              </tr>
              ` : ''}
              ${veterinarian.clinic ? `
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">🏥 Phòng khám:</td>
                <td style="padding: 8px 0; color: #333;">${veterinarian.clinic}</td>
              </tr>
              ` : ''}
              ${veterinarian.phone ? `
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">📞 Số điện thoại:</td>
                <td style="padding: 8px 0; color: #333;">${veterinarian.phone}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <!-- Important Notes -->
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
            <h4 style="color: #856404; margin: 0 0 10px 0;">⚠️ Lưu ý quan trọng:</h4>
            <ul style="color: #856404; margin: 0; padding-left: 20px;">
              <li>Đảm bảo thú cưng khỏe mạnh trước khi tiêm</li>
              <li>Mang theo sổ tiêm phòng (nếu có)</li>
              <li>Đến đúng giờ hẹn để tránh chờ đợi</li>
              <li>Chúng tôi sẽ gửi email nhắc nhở trước 3 ngày</li>
            </ul>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/vaccination-schedule" 
               style="background-color: #6272B6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              📅 Xem Lịch Tiêm Phòng
            </a>
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
        </div>
      </div>
    </div>
  `;

  return this.sendEmail(email, subject, html);
};

exports.sendVaccinationReminder = async (email, data) => {
  const { ownerName, petName, vaccineName, scheduledDate, daysUntil, veterinarian } = data;
  
  const subject = `🔔 Nhắc nhở: Lịch tiêm phòng cho ${petName} ${daysUntil === 0 ? 'HÔM NAY' : `sau ${daysUntil} ngày`}`;
  
  const urgencyColor = daysUntil === 0 ? '#dc3545' : daysUntil === 1 ? '#fd7e14' : '#ffc107';
  const urgencyText = daysUntil === 0 ? 'HÔM NAY' : daysUntil === 1 ? 'NGÀY MAI' : `${daysUntil} NGÀY NỮA`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6272B6; margin: 0; font-size: 28px;">🐾 Pet Adopt</h1>
          <p style="color: #666; margin: 10px 0 0 0;">Nhắc Nhở Lịch Tiêm Phòng</p>
        </div>

        <!-- Urgent Alert -->
        <div style="background-color: ${urgencyColor}; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
          <h2 style="margin: 0; font-size: 24px;">🚨 NHẮC NHỞ QUAN TRỌNG</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold;">
            Lịch tiêm phòng cho ${petName} là ${urgencyText}!
          </p>
        </div>

        <!-- Main Content -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Xin chào ${ownerName}! 👋</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Đây là email nhắc nhở về lịch tiêm phòng sắp tới cho thú cưng của bạn. Vui lòng kiểm tra thông tin và chuẩn bị cho buổi tiêm:
          </p>

          <!-- Pet Info Card -->
          <div style="background-color: #f8f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #6272B6; margin-bottom: 20px;">
            <h3 style="color: #6272B6; margin: 0 0 15px 0; font-size: 18px;">📋 Thông tin tiêm phòng</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold; width: 40%;">🐕 Tên thú cưng:</td>
                <td style="padding: 8px 0; color: #333;">${petName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">💉 Loại vaccine:</td>
                <td style="padding: 8px 0; color: #333;">${vaccineName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">📅 Ngày tiêm:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold; color: ${urgencyColor};">
                  ${new Date(scheduledDate).toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">⏰ Thời gian còn lại:</td>
                <td style="padding: 8px 0; font-weight: bold; color: ${urgencyColor}; font-size: 16px;">
                  ${urgencyText}
                </td>
              </tr>
              ${veterinarian?.name ? `
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">👨‍⚕️ Bác sĩ thú y:</td>
                <td style="padding: 8px 0; color: #333;">${veterinarian.name}</td>
              </tr>
              ` : ''}
              ${veterinarian?.clinic ? `
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">🏥 Phòng khám:</td>
                <td style="padding: 8px 0; color: #333;">${veterinarian.clinic}</td>
              </tr>
              ` : ''}
              ${veterinarian?.phone ? `
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">📞 Số điện thoại:</td>
                <td style="padding: 8px 0; color: #333;">${veterinarian.phone}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <!-- Checklist -->
          <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 20px;">
            <h4 style="color: #155724; margin: 0 0 10px 0;">✅ Checklist chuẩn bị:</h4>
            <ul style="color: #155724; margin: 0; padding-left: 20px;">
              <li>Kiểm tra sức khỏe thú cưng (ăn uống, vui vẻ)</li>
              <li>Mang theo sổ tiêm phòng và giấy tờ liên quan</li>
              <li>Chuẩn bị phương tiện di chuyển an toàn</li>
              <li>Đến đúng giờ hẹn (nên đến sớm 10-15 phút)</li>
              <li>Mang theo số điện thoại liên hệ khẩn cấp</li>
            </ul>
          </div>

          <!-- CTA Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/vaccination-schedule" 
               style="background-color: #6272B6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 0 10px;">
              📅 Xem Lịch Tiêm
            </a>
            <a href="tel:${veterinarian?.phone || ''}" 
               style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 0 10px;">
              📞 Gọi Phòng Khám
            </a>
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
            Bạn nhận được email này vì đã đăng ký lịch tiêm phòng tại Pet Adopt
          </p>
        </div>
      </div>
    </div>
  `;

  return this.sendEmail(email, subject, html);
};
