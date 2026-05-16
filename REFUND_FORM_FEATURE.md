# ✅ TÍNH NĂNG GỬI FORM HOÀN TIỀN KHI ADMIN HỦY ĐƠN VNPAY

## 🎯 Mô tả tính năng

Khi admin hủy đơn hàng VNPay đã thanh toán, hệ thống tự động:
1. ✅ Hoàn kho sản phẩm
2. ✅ Hoàn voucher (nếu đã duyệt)
3. ✅ Chuyển trạng thái thanh toán sang `refunding`
4. ✅ Chuyển trạng thái hoàn trả sang `requested`
5. ✅ **Gửi email form hoàn tiền** cho khách hàng
6. ✅ **Tạo notification** thông báo cho khách

---

## 🔄 FLOW HOÀN CHỈNH

### Bước 1: Admin hủy đơn VNPay đã thanh toán
```
Admin vào "Quản lý đơn hàng"
↓
Chọn đơn VNPay đã thanh toán (paymentStatus = paid)
↓
Vào "Chi tiết" → Chọn dropdown "Trạng thái đơn hàng"
↓
Chọn "❌ Đã hủy"
↓
Hệ thống kiểm tra: VNPay + Đã thanh toán?
```

### Bước 2: Hệ thống xử lý tự động
```
✅ Hoàn kho sản phẩm
✅ Hoàn voucher (nếu đã duyệt)
✅ Cập nhật trạng thái:
   - orderStatus: cancelled
   - paymentStatus: refunding
   - returnStatus: requested
✅ Tạo record refund:
   - reason: "Admin hủy đơn hàng"
   - requestedBy: "admin"
   - amount: totals.total
   - requestedAt: now
✅ Gửi email form hoàn tiền
✅ Tạo notification
```

### Bước 3: Khách hàng nhận thông báo
```
📧 Email: "💰 Thông báo hoàn tiền - Đơn hàng #ABC123"
   - Thông tin đơn hàng
   - Số tiền hoàn
   - Hướng dẫn điền form
   - Nút CTA: "💰 Điền Form Hoàn Tiền Ngay"

🔔 Notification: "💰 Yêu cầu hoàn tiền - Đơn #ABC123"
   - Message: "Đơn hàng của bạn đã bị hủy. Vui lòng điền form..."
   - Link: /orders
```

### Bước 4: Khách điền form hoàn tiền
```
Khách vào "Đơn hàng của tôi"
↓
Tìm đơn đã hủy
↓
Click "Điền form hoàn tiền"
↓
Điền thông tin:
   - Số tài khoản
   - Tên ngân hàng
   - Tên chủ tài khoản
   - Upload QR Code (optional)
↓
Gửi form
```

### Bước 5: Admin xử lý hoàn tiền
```
Admin vào "Quản lý Hoàn hủy"
↓
Tab "Hoàn tiền"
↓
Xem thông tin tài khoản khách
↓
Chuyển tiền
↓
Cập nhật trạng thái: refunded
```

---

## 📝 CODE ĐÃ THÊM

### 1. Backend Controller (orderController.js)

```javascript
// Trong hàm updateOrderStatus
if (isCancelling) {
  // Hoàn kho
  await Product.bulkWrite(...);
  
  // Hoàn voucher
  if (voucherWasUsed) await releaseVoucher(order);
  
  // ===== XỬ LÝ HỦY ĐƠN VNPAY ĐÃ THANH TOÁN =====
  const isVNPayPaid = order.paymentMethod === 'vnpay' && 
                      (order.paymentStatus === 'paid' || order.status === 'paid');
  
  if (isVNPayPaid) {
    console.log('[Cancel Order] VNPay paid order cancelled - sending refund form');
    
    // Cập nhật trạng thái hoàn tiền
    updateData.paymentStatus = 'refunding';
    updateData.returnStatus = 'requested';
    
    // Khởi tạo thông tin refund
    updateData.refund = {
      reason: note || 'Admin hủy đơn hàng',
      requestedAt: new Date(),
      requestedBy: 'admin',
      amount: order.totals.total,
      note: 'Đơn hàng bị hủy bởi admin - Vui lòng điền form để nhận hoàn tiền'
    };
    
    // Gửi email thông báo và form hoàn tiền
    try {
      const user = await User.findById(order.user);
      if (user?.email) {
        const { sendRefundFormEmail } = require('../utils/emailService');
        await sendRefundFormEmail(user.email, {
          customerName: order.customer.name,
          orderId: order._id,
          amount: order.totals.total,
          reason: 'Admin hủy đơn hàng',
          items: order.items,
          totals: order.totals
        });
        console.log('[Cancel Order] Refund form email sent to:', user.email);
      }
    } catch (emailError) {
      console.error('[Cancel Order] Email error (non-blocking):', emailError.message);
    }
    
    // Tạo notification
    try {
      const { notifyRefundRequested } = require('../utils/notificationService');
      await notifyRefundRequested(
        order.user,
        order._id,
        order._id.toString().slice(-8).toUpperCase(),
        'Admin đã hủy đơn hàng. Vui lòng điền form hoàn tiền để nhận lại tiền.'
      );
    } catch (notifError) {
      console.error('[Cancel Order] Notification error (non-blocking):', notifError.message);
    }
  }
}
```

### 2. Email Service (emailService.js)

```javascript
exports.sendRefundFormEmail = async (email, data) => {
  const { customerName, orderId, amount, reason, items, totals } = data;
  
  const subject = `💰 Thông báo hoàn tiền - Đơn hàng #${orderId.toString().slice(-8).toUpperCase()}`;
  
  const html = `
    <!-- Email template với:
      - Header Pet Adopt
      - Alert box: Đơn hàng đã bị hủy
      - Thông tin đơn hàng
      - Danh sách sản phẩm
      - Hướng dẫn nhận hoàn tiền (5 bước)
      - Thông tin cần cung cấp
      - Nút CTA: "Điền Form Hoàn Tiền Ngay"
      - Lưu ý: Điền trong 7 ngày
      - Footer với thông tin liên hệ
    -->
  `;
  
  return this.sendEmail(email, subject, html);
};
```

### 3. Notification Service (notificationService.js)

```javascript
exports.notifyRefundRequested = async (userId, orderId, orderCode, message) => {
  try {
    const Notification = require('../models/Notification');
    await Notification.create({
      user: userId,
      type: 'order',
      title: `💰 Yêu cầu hoàn tiền - Đơn #${orderCode}`,
      message: message || 'Đơn hàng của bạn đã bị hủy. Vui lòng điền form hoàn tiền để nhận lại tiền.',
      relatedId: orderId,
      relatedModel: 'Order',
      link: `/orders`
    });
    console.log(`[Notification] Refund requested notification created for user ${userId}`);
  } catch (error) {
    console.error('[Notification] Error creating refund requested notification:', error.message);
    throw error;
  }
};
```

---

## 📧 NỘI DUNG EMAIL

### Subject:
```
💰 Thông báo hoàn tiền - Đơn hàng #ABC123
```

### Nội dung chính:

#### 1. Greeting
```
Xin chào [Tên khách hàng],
```

#### 2. Alert Box (Vàng)
```
⚠️ Đơn hàng của bạn đã bị hủy
Lý do: Admin hủy đơn hàng
```

#### 3. Thông tin đơn hàng
```
📦 Thông tin đơn hàng
- Mã đơn hàng: #ABC123
- Số tiền hoàn: 100,000đ
- Phương thức thanh toán: VNPay
```

#### 4. Danh sách sản phẩm
```
🛍️ Sản phẩm
- Sản phẩm A: 2 × 50,000đ = 100,000đ
```

#### 5. Hướng dẫn nhận hoàn tiền (Box xanh)
```
💳 Hướng dẫn nhận hoàn tiền
Để nhận lại số tiền 100,000đ, vui lòng làm theo các bước sau:
1. Truy cập trang "Đơn hàng của tôi"
2. Tìm đơn hàng #ABC123
3. Click vào nút "Điền form hoàn tiền"
4. Điền đầy đủ thông tin tài khoản ngân hàng
5. Gửi form và chờ admin xử lý (1-3 ngày làm việc)
```

#### 6. Thông tin cần cung cấp
```
📝 Thông tin cần cung cấp:
- Số tài khoản ngân hàng
- Tên ngân hàng
- Tên chủ tài khoản (phải trùng với tên người đặt hàng)
- Ảnh QR Code ngân hàng (tùy chọn - giúp xử lý nhanh hơn)
```

#### 7. Nút CTA (Xanh dương)
```
[💰 Điền Form Hoàn Tiền Ngay]
→ Link: {FRONTEND_URL}/orders
```

#### 8. Lưu ý (Box vàng)
```
⏰ Lưu ý: Vui lòng điền form trong vòng 7 ngày kể từ khi nhận email này.
Sau thời gian trên, bạn cần liên hệ trực tiếp với chúng tôi để được hỗ trợ.
```

#### 9. Hỗ trợ
```
Cần hỗ trợ? Liên hệ với chúng tôi:
📧 support@petadopt.com
```

---

## 🔔 NỘI DUNG NOTIFICATION

```json
{
  "type": "order",
  "title": "💰 Yêu cầu hoàn tiền - Đơn #ABC123",
  "message": "Admin đã hủy đơn hàng. Vui lòng điền form hoàn tiền để nhận lại tiền.",
  "relatedId": "orderId",
  "relatedModel": "Order",
  "link": "/orders"
}
```

---

## 🎨 THIẾT KẾ EMAIL

### Màu sắc:
- **Primary**: #6272B6 (Xanh dương Pet Adopt)
- **Success**: #28a745 (Xanh lá)
- **Warning**: #ffc107 (Vàng)
- **Info**: #17a2b8 (Xanh ngọc)
- **Danger**: #dc3545 (Đỏ)

### Layout:
- Max-width: 600px
- Background: #f9f9f9
- Card: White với border-radius 10px
- Shadow: 0 2px 10px rgba(0,0,0,0.1)

### Typography:
- Font: Arial, sans-serif
- Heading: Bold, color #333
- Body: Regular, color #666
- Link: #6272B6, no underline

### Buttons:
- Background: #6272B6
- Color: White
- Padding: 15px 40px
- Border-radius: 25px
- Font-weight: Bold

---

## ✅ ĐIỀU KIỆN TRIGGER

Email và notification chỉ được gửi khi:
1. ✅ Admin hủy đơn hàng (orderStatus → cancelled)
2. ✅ Đơn hàng thanh toán qua VNPay (paymentMethod === 'vnpay')
3. ✅ Đơn hàng đã thanh toán (paymentStatus === 'paid')

**Không gửi nếu:**
- ❌ Đơn COD
- ❌ Đơn VNPay chưa thanh toán
- ❌ Đơn đã bị hủy trước đó

---

## 🧪 TEST

### Test Case 1: Hủy đơn VNPay đã thanh toán
```
1. Tạo đơn VNPay
2. Thanh toán thành công (paymentStatus = paid)
3. Admin duyệt đơn (orderStatus = confirmed)
4. Admin hủy đơn (orderStatus = cancelled)
5. Kiểm tra:
   ✅ Email được gửi
   ✅ Notification được tạo
   ✅ paymentStatus = refunding
   ✅ returnStatus = requested
   ✅ refund object được tạo
```

### Test Case 2: Hủy đơn COD
```
1. Tạo đơn COD
2. Admin duyệt đơn
3. Admin hủy đơn
4. Kiểm tra:
   ✅ Không gửi email form hoàn tiền
   ✅ Không tạo notification hoàn tiền
   ✅ Chỉ hoàn kho và voucher
```

### Test Case 3: Hủy đơn VNPay chưa thanh toán
```
1. Tạo đơn VNPay
2. Không thanh toán (paymentStatus = pending)
3. Admin hủy đơn
4. Kiểm tra:
   ✅ Không gửi email form hoàn tiền
   ✅ Chỉ hoàn kho
```

---

## 📊 DATABASE CHANGES

### Order Model - Refund Object:
```javascript
refund: {
  reason: String,              // "Admin hủy đơn hàng"
  requestedAt: Date,           // Thời gian yêu cầu
  requestedBy: String,         // "admin" hoặc "user"
  bankAccount: String,         // Số TK (khách điền sau)
  bankName: String,            // Tên ngân hàng (khách điền sau)
  accountHolder: String,       // Chủ TK (khách điền sau)
  qrCodeImage: String,         // URL ảnh QR (khách upload sau)
  processedAt: Date,           // Thời gian xử lý
  processedBy: ObjectId,       // Admin xử lý
  amount: Number,              // Số tiền hoàn
  note: String                 // Ghi chú
}
```

### Status Changes:
```javascript
// Trước khi hủy
orderStatus: 'confirmed'
paymentStatus: 'paid'
returnStatus: null

// Sau khi hủy (VNPay đã thanh toán)
orderStatus: 'cancelled'
paymentStatus: 'refunding'
returnStatus: 'requested'
refund: {
  reason: 'Admin hủy đơn hàng',
  requestedAt: new Date(),
  requestedBy: 'admin',
  amount: 100000,
  note: 'Đơn hàng bị hủy bởi admin - Vui lòng điền form để nhận hoàn tiền'
}
```

---

## 🚀 CÁCH SỬ DỤNG

### Admin:
1. Vào "Quản lý đơn hàng"
2. Tìm đơn VNPay đã thanh toán
3. Vào "Chi tiết"
4. Chọn dropdown "Trạng thái đơn hàng" → "Đã hủy"
5. Hệ thống tự động gửi email và notification

### Khách hàng:
1. Nhận email "💰 Thông báo hoàn tiền"
2. Click nút "Điền Form Hoàn Tiền Ngay"
3. Hoặc vào "Đơn hàng của tôi" → Tìm đơn đã hủy
4. Click "Điền form hoàn tiền"
5. Điền thông tin tài khoản
6. Gửi form
7. Chờ admin xử lý (1-3 ngày)

---

## 🎉 KẾT QUẢ

Hệ thống giờ đã:
- ✅ **Tự động gửi form hoàn tiền** khi admin hủy đơn VNPay đã thanh toán
- ✅ **Email đẹp, chuyên nghiệp** với đầy đủ thông tin
- ✅ **Notification realtime** thông báo cho khách
- ✅ **Hướng dẫn chi tiết** 5 bước điền form
- ✅ **Thông tin rõ ràng** về số tiền, đơn hàng, sản phẩm
- ✅ **CTA button nổi bật** dễ dàng thao tác
- ✅ **Lưu ý thời hạn** 7 ngày điền form

**Khách hàng không bỏ lỡ việc nhận hoàn tiền!** 💰
