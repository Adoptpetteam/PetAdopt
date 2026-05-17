# 💰 LUỒNG ỦNG HỘ (DONATE) - ĐẦY ĐỦ

## 📋 Tổng quan

Hệ thống ủng hộ cho phép người dùng donate tiền qua VNPay và admin quản lý, gửi voucher cảm ơn.

---

## 🔄 Luồng hoạt động

### 1. User Donate (Frontend)

**Trang:** `/donate`

**Bước 1: Nhập thông tin**
- Họ tên
- Email
- Số tiền (tối thiểu 1.000đ)

**Bước 2: Tạo payment**
```javascript
POST /api/donate/create-payment
Body: { name, email, amount }
Response: { paymentUrl }
```

**Bước 3: Redirect đến VNPay**
- User thanh toán trên cổng VNPay
- VNPay redirect về `/api/donate/vnpay-return`

**Bước 4: Xử lý kết quả**
- Success: Redirect `/donate?status=success&amount=xxx`
- Failed: Redirect `/donate?status=failed&code=xxx`

---

### 2. Backend xử lý

#### API: `POST /api/donate/create-payment`
**File:** `backend/src/controllers/donateController.js`

**Logic:**
1. Validate amount (≥ 1.000đ)
2. Tạo orderId unique: `YYMMDDHHMMSSSS`
3. Lưu Donation vào DB với status='pending'
4. Tạo VNPay payment URL với signature
5. Return paymentUrl

**Donation Model:**
```javascript
{
  orderId: String (unique),
  amount: Number,
  name: String,
  email: String,
  status: 'pending' | 'success' | 'failed',
  paidAt: Date,
  createdAt: Date
}
```

#### API: `GET /api/donate/vnpay-return`
**Callback từ VNPay sau khi user thanh toán**

**Logic:**
1. Verify VNPay signature
2. Kiểm tra responseCode
3. Nếu success (code='00'):
   - Update Donation: status='success', paidAt=now
   - Gửi email cảm ơn
   - Redirect `/donate?status=success`
4. Nếu failed:
   - Update Donation: status='failed'
   - Redirect `/donate?status=failed`

#### API: `GET /api/donate/vnpay-ipn`
**IPN (Instant Payment Notification) từ VNPay**

**Logic:** Tương tự vnpay-return nhưng trả về JSON

---

### 3. Admin quản lý

#### Trang: `/admin/supporters` (hoặc `/admin/donations`)

**API: `GET /api/donate/admin/list`**
```javascript
Query: { page, limit, status }
Response: {
  data: [Donation],
  pagination: { page, limit, total }
}
```

**Hiển thị:**
- Danh sách người ủng hộ
- Thông tin: Tên, Email, Số tiền, Trạng thái, Ngày
- Filter theo status: pending, success, failed
- Pagination

**Actions:**
- ✅ Xem chi tiết
- 🎁 Gửi voucher cảm ơn
- ❌ Xóa donation

---

### 4. Admin gửi voucher

#### API: `POST /api/donate/admin/send-voucher-email`
**File:** `backend/src/controllers/donateController.js`

**Body:**
```javascript
{
  email: String,
  name: String,
  code: String,        // Mã voucher
  type: 'percent' | 'fixed',
  value: Number,       // % hoặc số tiền
  description: String,
  endDate: Date
}
```

**Logic:**
1. Tạo email HTML đẹp với mã voucher
2. Gửi email qua emailService
3. Nếu email khớp với User đã đăng ký:
   - Tạo Notification trong app
   - Type: 'voucher_received'
   - Hiển thị trong NotificationBell

**Email template:**
- 🎁 Icon quà tặng
- Gradient header
- Mã voucher nổi bật (dashed border)
- Thông tin giảm giá
- Hạn sử dụng

---

## 📊 Statistics & Display

### API: `GET /api/donate/statistics`
```javascript
Response: {
  total: Number,        // Tổng số donation success
  totalAmount: Number,  // Tổng số tiền
  pending: Number       // Số donation đang pending
}
```

### API: `GET /api/donate/supporters`
```javascript
Query: { limit }
Response: {
  data: [{ name, amount, paidAt }]
}
```
**Dùng cho:** Hiển thị danh sách người ủng hộ gần đây

### API: `GET /api/donate/top-supporters`
```javascript
Query: { limit }
Response: {
  data: [{ name, amount, paidAt }]
}
```
**Dùng cho:** Top người ủng hộ nhiều nhất (sắp xếp theo amount)

---

## 🎨 Frontend Components

### 1. Trang Donate (`/donate`)
**Features:**
- Form nhập thông tin (name, email, amount)
- Các mức donate gợi ý (50k, 100k, 200k, 500k, 1M)
- Hiển thị top supporters (marquee)
- Xử lý callback từ VNPay (success/failed)

### 2. TopSupportersMarquee
**Component:** `frontend/src/components/TopSupportersMarquee.tsx`
**Features:**
- Hiển thị danh sách người ủng hộ cuộn ngang
- Avatar + Tên + Số tiền
- Auto-scroll animation

### 3. Admin Supporters Page
**Features:**
- Table danh sách donations
- Filter theo status
- Pagination
- Actions: Gửi voucher, Xóa
- Modal gửi voucher với form đầy đủ

---

## 🔐 Security

### VNPay Signature
**Tạo signature:**
```javascript
const sortedParams = sortObject(params);
const signData = Object.keys(sortedParams)
  .map(key => `${key}=${sortedParams[key]}`)
  .join('&');
const hmac = crypto.createHmac('sha512', vnp_HashSecret);
const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
```

**Verify signature:**
```javascript
function verifyVNPaySignature(vnp_Params, secretKey) {
  const params = { ...vnp_Params };
  const secureHash = params['vnp_SecureHash'];
  delete params['vnp_SecureHash'];
  delete params['vnp_SecureHashType'];
  
  const sortedParams = sortObject(params);
  const signData = Object.keys(sortedParams)
    .map(key => `${key}=${sortedParams[key]}`)
    .join('&');
  
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  
  return signed === secureHash;
}
```

### Environment Variables
```env
VNP_TMNCODE=your_tmn_code
VNP_HASHSECRET=your_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:5000/api/donate/vnpay-return
CLIENT_URL=http://localhost:5173
```

---

## 📧 Email Service

### Donation Thank You Email
**Function:** `sendDonationThankYou(email, name, amount)`
**File:** `backend/src/utils/donateService.js`

**Template:**
- Cảm ơn người ủng hộ
- Hiển thị số tiền đã donate
- Logo PetAdopt
- Call-to-action: Xem thêm thú cưng

### Voucher Email
**Function:** `sendVoucherEmail(email, name, code, ...)`
**File:** `backend/src/controllers/donateController.js`

**Template:**
- 🎁 Icon quà tặng
- Mã voucher nổi bật
- Thông tin giảm giá
- Hạn sử dụng
- CTA: Mua sắm ngay

---

## 🧪 Testing

### Test donate flow
```bash
# 1. Tạo payment
curl -X POST http://localhost:5000/api/donate/create-payment \
  -H "Content-Type: application/json" \
  -d '{"name":"Nguyen Van A","email":"test@example.com","amount":50000}'

# 2. Mở paymentUrl trong browser
# 3. Thanh toán test trên VNPay sandbox
# 4. Kiểm tra callback

# 5. Kiểm tra statistics
curl http://localhost:5000/api/donate/statistics

# 6. Kiểm tra supporters
curl http://localhost:5000/api/donate/supporters?limit=10
```

### Test admin functions
```bash
# Login admin
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@petadopt.com","password":"admin123"}' \
  | jq -r '.token')

# List donations
curl http://localhost:5000/api/donate/admin/list \
  -H "Authorization: Bearer $TOKEN"

# Send voucher
curl -X POST http://localhost:5000/api/donate/admin/send-voucher-email \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "name":"Nguyen Van A",
    "code":"THANKYOU50",
    "type":"percent",
    "value":10,
    "description":"Giảm 10% cho đơn hàng tiếp theo",
    "endDate":"2026-12-31"
  }'
```

---

## 📝 Database Schema

### Donation Model
```javascript
const donationSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1000
  },
  name: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
    index: true
  },
  paidAt: {
    type: Date
  }
}, {
  timestamps: true
});
```

### Indexes
```javascript
donationSchema.index({ orderId: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ paidAt: -1 });
donationSchema.index({ amount: -1 });
```

---

## 🚀 Deployment Checklist

### Backend
- ✅ Set VNPay credentials trong .env
- ✅ Set CLIENT_URL đúng domain production
- ✅ Set VNP_RETURN_URL đúng domain backend
- ✅ Enable CORS cho domain frontend
- ✅ Test email service (Gmail OAuth)

### Frontend
- ✅ Update API base URL
- ✅ Test donate flow end-to-end
- ✅ Test VNPay callback
- ✅ Test responsive design

### Database
- ✅ Create indexes cho Donation collection
- ✅ Backup dữ liệu trước khi deploy

---

## 🐛 Troubleshooting

### Lỗi signature mismatch
**Nguyên nhân:** VNPay signature không khớp
**Giải pháp:**
1. Kiểm tra VNP_HASHSECRET đúng chưa
2. Kiểm tra encoding params (phải dùng encodeURIComponent)
3. Kiểm tra sort order của params
4. Log signData để debug

### Email không gửi được
**Nguyên nhân:** Gmail OAuth hoặc SMTP config sai
**Giải pháp:**
1. Kiểm tra .env có đầy đủ EMAIL_* variables
2. Test email service riêng
3. Kiểm tra Gmail "Less secure app access"
4. Xem log error chi tiết

### Donation không update status
**Nguyên nhân:** VNPay callback không được gọi
**Giải pháp:**
1. Kiểm tra VNP_RETURN_URL accessible từ internet
2. Dùng ngrok để expose localhost
3. Kiểm tra log backend khi callback
4. Test IPN endpoint riêng

---

## ✅ Hoàn thành

Luồng donate đã hoàn chỉnh với:
- ✅ User donate qua VNPay
- ✅ Backend xử lý payment & callback
- ✅ Admin quản lý donations
- ✅ Admin gửi voucher cảm ơn
- ✅ Email service đầy đủ
- ✅ Statistics & display
- ✅ Security (signature verification)
- ✅ Error handling

---

## 📚 Related Files

### Backend
- `backend/src/controllers/donateController.js` - Main controller
- `backend/src/routes/donate.routes.js` - Routes
- `backend/src/models/Donation.js` - Model
- `backend/src/utils/donateService.js` - Email service
- `backend/src/utils/emailService.js` - Email sender

### Frontend
- `frontend/src/pages/Donate.tsx` - Donate page
- `frontend/src/components/TopSupportersMarquee.tsx` - Supporters display
- `frontend/src/pages/Admin/Supporters.tsx` - Admin page (nếu có)

---

## 🎯 Next Steps

Nếu cần thêm tính năng:
1. **Recurring donations** - Donate định kỳ hàng tháng
2. **Donation goals** - Mục tiêu quyên góp
3. **Donation campaigns** - Chiến dịch quyên góp
4. **Donor dashboard** - Trang quản lý donation của user
5. **Tax receipts** - Hóa đơn từ thiện

Liên hệ nếu cần implement thêm! 🚀
