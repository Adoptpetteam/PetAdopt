const nodemailer = require('nodemailer');

const getTransporter = () => {
  console.log('Creating email transporter with config:');
  console.log('HOST:', process.env.EMAIL_HOST);
  console.log('PORT:', process.env.EMAIL_PORT);
  console.log('USER:', process.env.EMAIL_USER);
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // Use STARTTLS for port 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

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

// ===============================
// ORDER EMAIL TEMPLATES
// ===============================

exports.sendOrderConfirmation = async (email, data) => {
  const { customerName, orderId, items, totals, paymentMethod, customer } = data;
  
  const subject = `✅ Xác nhận đơn hàng #${orderId.toString().slice(-8).toUpperCase()}`;
  
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <div style="display: flex; align-items: center;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; margin-right: 10px;">` : ''}
          <div>
            <strong>${item.name}</strong><br/>
            <span style="color: #666;">SL: ${item.quantity}</span>
          </div>
        </div>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${(item.price * item.quantity).toLocaleString('vi-VN')}đ
      </td>
    </tr>
  `).join('');
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6272B6; margin: 0; font-size: 28px;">🐾 Pet Adopt</h1>
          <p style="color: #666; margin: 10px 0 0 0;">Xác Nhận Đơn Hàng</p>
        </div>

        <!-- Success Badge -->
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
          <h2 style="margin: 0; font-size: 24px;">✅ Đơn hàng đã được xác nhận!</h2>
          <p style="margin: 10px 0 0 0;">Mã đơn: <strong>#${orderId.toString().slice(-8).toUpperCase()}</strong></p>
        </div>

        <!-- Main Content -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Xin chào ${customerName}! 👋</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Cảm ơn bạn đã đặt hàng tại Pet Adopt! Đơn hàng của bạn đã được xác nhận và đang được xử lý.
          </p>

          <!-- Order Info -->
          <div style="background-color: #f8f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #6272B6; margin-bottom: 20px;">
            <h3 style="color: #6272B6; margin: 0 0 15px 0; font-size: 18px;">📦 Thông tin đơn hàng</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold; width: 40%;">📋 Mã đơn:</td>
                <td style="padding: 8px 0; color: #333;">#${orderId.toString().slice(-8).toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">📅 Ngày đặt:</td>
                <td style="padding: 8px 0; color: #333;">${new Date().toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric'
                })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">💳 Thanh toán:</td>
                <td style="padding: 8px 0; color: #333;">${paymentMethod === 'cod' ? 'COD (Thanh toán khi nhận hàng)' : 'VNPay'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">📍 Địa chỉ:</td>
                <td style="padding: 8px 0; color: #333;">${customer.address}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">📞 SĐT:</td>
                <td style="padding: 8px 0; color: #333;">${customer.phone}</td>
              </tr>
            </table>
          </div>

          <!-- Order Items -->
          <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
            <div style="background-color: #f3f4f6; padding: 15px; border-bottom: 2px solid #e5e7eb;">
              <h3 style="margin: 0; color: #333;">🛒 Sản phẩm đã đặt</h3>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
              <tr>
                <td style="padding: 15px; text-align: right; font-weight: bold;">Tạm tính:</td>
                <td style="padding: 15px; text-align: right;">${totals.subtotal.toLocaleString('vi-VN')}đ</td>
              </tr>
              ${totals.discount > 0 ? `
              <tr>
                <td style="padding: 0 15px 15px; text-align: right; color: #10b981; font-weight: bold;">Giảm giá:</td>
                <td style="padding: 0 15px 15px; text-align: right; color: #10b981;">-${totals.discount.toLocaleString('vi-VN')}đ</td>
              </tr>
              ` : ''}
              <tr style="background-color: #f3f4f6;">
                <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #6272B6;">Tổng cộng:</td>
                <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #6272B6;">${totals.total.toLocaleString('vi-VN')}đ</td>
              </tr>
            </table>
          </div>

          <!-- Next Steps -->
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #fbbf24; margin-bottom: 20px;">
            <h4 style="color: #d97706; margin: 0 0 10px 0;">📌 Bước tiếp theo</h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px;">
              <li>Chúng tôi sẽ xử lý và đóng gói đơn hàng của bạn</li>
              <li>Bạn sẽ nhận được email thông báo khi đơn hàng được giao</li>
              <li>Thời gian giao hàng dự kiến: 2-3 ngày làm việc</li>
              ${paymentMethod === 'cod' ? '<li>Vui lòng chuẩn bị tiền mặt khi nhận hàng</li>' : ''}
            </ul>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/orders/${orderId}" 
               style="background-color: #6272B6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              📦 Xem Chi Tiết Đơn Hàng
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
            Nếu có thắc mắc, vui lòng liên hệ với chúng tôi
          </p>
        </div>
      </div>
    </div>
  `;

  return this.sendEmail(email, subject, html);
};

exports.sendOrderStatusUpdate = async (email, data) => {
  const { customerName, orderId, status, note, items, totals } = data;
  
  const statusConfig = {
    pending: { icon: '⏳', text: 'Đang chờ xử lý', color: '#fbbf24', bgColor: '#fef3c7' },
    confirmed: { icon: '✅', text: 'Đã xác nhận', color: '#10b981', bgColor: '#d1fae5' },
    paid: { icon: '💳', text: 'Đã thanh toán', color: '#3b82f6', bgColor: '#dbeafe' },
    shipping: { icon: '🚚', text: 'Đang giao hàng', color: '#8b5cf6', bgColor: '#ede9fe' },
    completed: { icon: '🎉', text: 'Hoàn thành', color: '#10b981', bgColor: '#d1fae5' },
    cancelled: { icon: '❌', text: 'Đã hủy', color: '#ef4444', bgColor: '#fee2e2' }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  
  const subject = `${config.icon} Đơn hàng #${orderId.toString().slice(-8).toUpperCase()} - ${config.text}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6272B6; margin: 0; font-size: 28px;">🐾 Pet Adopt</h1>
          <p style="color: #666; margin: 10px 0 0 0;">Cập Nhật Đơn Hàng</p>
        </div>

        <!-- Status Badge -->
        <div style="background-color: ${config.bgColor}; color: ${config.color}; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px; border: 2px solid ${config.color};">
          <h2 style="margin: 0; font-size: 24px;">${config.icon} ${config.text}</h2>
          <p style="margin: 10px 0 0 0;">Mã đơn: <strong>#${orderId.toString().slice(-8).toUpperCase()}</strong></p>
        </div>

        <!-- Main Content -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Xin chào ${customerName}! 👋</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Đơn hàng của bạn đã được cập nhật trạng thái mới.
          </p>

          ${note ? `
          <div style="background-color: #f8f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #6272B6; margin-bottom: 20px;">
            <h4 style="color: #6272B6; margin: 0 0 10px 0;">📝 Ghi chú:</h4>
            <p style="margin: 0; color: #333;">${note}</p>
          </div>
          ` : ''}

          <!-- Status Timeline -->
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin: 0 0 15px 0;">📊 Trạng thái đơn hàng</h3>
            <div style="position: relative;">
              ${['pending', 'confirmed', 'paid', 'shipping', 'completed'].map((s, idx) => {
                const isActive = ['pending', 'confirmed', 'paid', 'shipping', 'completed'].indexOf(status) >= idx;
                const isCurrent = s === status;
                return `
                  <div style="display: flex; align-items: center; margin-bottom: ${idx < 4 ? '10px' : '0'};">
                    <div style="width: 30px; height: 30px; border-radius: 50%; background-color: ${isActive ? '#6272B6' : '#d1d5db'}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; ${isCurrent ? 'box-shadow: 0 0 0 4px rgba(98, 114, 182, 0.2);' : ''}">
                      ${isActive ? '✓' : idx + 1}
                    </div>
                    <div style="margin-left: 15px; flex: 1;">
                      <strong style="color: ${isActive ? '#6272B6' : '#6b7280'};">${statusConfig[s].text}</strong>
                      ${isCurrent ? '<span style="color: #10b981; margin-left: 10px;">← Hiện tại</span>' : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          ${status === 'shipping' ? `
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 20px;">
            <h4 style="color: #1e40af; margin: 0 0 10px 0;">🚚 Đơn hàng đang trên đường giao đến bạn!</h4>
            <p style="margin: 0; color: #1e3a8a;">Vui lòng chuẩn bị sẵn sàng để nhận hàng. Shipper sẽ liên hệ với bạn trước khi giao.</p>
          </div>
          ` : ''}

          ${status === 'completed' ? `
          <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 20px;">
            <h4 style="color: #065f46; margin: 0 0 10px 0;">🎉 Cảm ơn bạn đã mua hàng!</h4>
            <p style="margin: 0; color: #064e3b;">Hy vọng bạn hài lòng với sản phẩm. Đừng quên đánh giá để giúp chúng tôi cải thiện dịch vụ nhé!</p>
          </div>
          ` : ''}

          ${status === 'cancelled' ? `
          <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 20px;">
            <h4 style="color: #991b1b; margin: 0 0 10px 0;">❌ Đơn hàng đã bị hủy</h4>
            <p style="margin: 0; color: #7f1d1d;">Nếu bạn có thắc mắc, vui lòng liên hệ với chúng tôi để được hỗ trợ.</p>
          </div>
          ` : ''}

          <!-- Order Summary -->
          <div style="background-color: #f8f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #6272B6; margin: 0 0 10px 0;">📦 Tóm tắt đơn hàng</h4>
            <p style="margin: 5px 0; color: #333;"><strong>Số lượng sản phẩm:</strong> ${items.length} sản phẩm</p>
            <p style="margin: 5px 0; color: #333;"><strong>Tổng tiền:</strong> ${totals.total.toLocaleString('vi-VN')}đ</p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/orders/${orderId}" 
               style="background-color: #6272B6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              📦 Xem Chi Tiết Đơn Hàng
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

// ===============================
// CONTACT EMAIL TEMPLATES
// ===============================

exports.sendContactReply = async (email, data) => {
  const { name, originalMessage, reply } = data;
  
  const subject = '📧 Phản hồi từ Pet Adopt';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6272B6; margin: 0; font-size: 28px;">🐾 Pet Adopt</h1>
          <p style="color: #666; margin: 10px 0 0 0;">Phản Hồi Liên Hệ</p>
        </div>

        <!-- Success Badge -->
        <div style="background: linear-gradient(135deg, #6272B6, #8b5cf6); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
          <h2 style="margin: 0; font-size: 24px;">📧 Chúng tôi đã phản hồi!</h2>
        </div>

        <!-- Main Content -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Xin chào ${name}! 👋</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Cảm ơn bạn đã liên hệ với Pet Adopt. Dưới đây là phản hồi của chúng tôi:
          </p>

          <!-- Original Message -->
          <div style="background-color: #f8f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #6272B6; margin-bottom: 20px;">
            <h4 style="color: #6272B6; margin: 0 0 10px 0;">📝 Tin nhắn của bạn:</h4>
            <p style="margin: 0; color: #666; font-style: italic;">"${originalMessage}"</p>
          </div>

          <!-- Reply -->
          <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 20px;">
            <h4 style="color: #065f46; margin: 0 0 15px 0;">💬 Phản hồi từ chúng tôi:</h4>
            <p style="margin: 0; color: #064e3b; line-height: 1.6;">${reply}</p>
          </div>

          <p style="color: #555; line-height: 1.6;">
            Nếu bạn có thêm câu hỏi, đừng ngần ngại liên hệ lại với chúng tôi!
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/contact" 
               style="background-color: #6272B6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              📧 Liên Hệ Lại
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
            Email này được gửi tự động, vui lòng không trả lời trực tiếp
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
