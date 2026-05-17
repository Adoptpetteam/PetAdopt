# ✅ DONATE AUTO VOUCHER - HOÀN THÀNH

## 🎯 Tính năng đã implement

**Tự động gửi voucher cho người donate thành công**

### Voucher Tiers

| Số tiền donate | Voucher | Mã format | Hạn sử dụng |
|----------------|---------|-----------|-------------|
| < 50.000đ | Không | - | - |
| 50k - 99k | Giảm 5% | THANK + 6 ký tự | 3 tháng |
| 100k - 499k | Giảm 10% | THANK + 6 ký tự | 3 tháng |
| ≥ 500k | Giảm 15% | THANK + 6 ký tự | 3 tháng |

---

## 📝 Files đã sửa

### 1. `backend/src/controllers/donateController.js`

#### Thêm import Voucher model:
```javascript
const Voucher = require('../models/Voucher');
```

#### Thêm 2 functions mới:

**a) `autoSendVoucher(donation)`**
- Xác định voucher tier dựa trên amount
- Tạo mã voucher random (THANK + 6 ký tự)
- Kiểm tra trùng mã
- Tạo Voucher trong database với:
  - `type: 'percent'`
  - `value: 5/10/15`
  - `usageLimit: 1`
  - `userLimit: 1`
  - `endDate: +3 tháng`
- Gọi `sendVoucherEmailAuto` để gửi email
- Log kết quả

**b) `sendVoucherEmailAuto(email, name, code, value, endDate)`**
- Email template HTML đẹp với:
  - Gradient header (xanh dương)
  - Icon 🎁
  - Mã voucher nổi bật (dashed border)
  - Giảm giá % màu xanh lá
  - Hạn sử dụng
  - CTA button "Mua sắm ngay"
- Subject: `🎁 Voucher giảm X% từ PetAdopt`

#### Sửa `exports.vnpayReturn`:
```javascript
if (donation?.email) {
    // Gửi email cảm ơn
    sendDonationThankYou(donation.email, donation.name, donation.amount)
        .catch(err => console.error('[Donate] Email failed:', err.message));
    
    // TỰ ĐỘNG GỬI VOUCHER
    autoSendVoucher(donation)
        .catch(err => console.error('[Donate] Auto voucher failed:', err.message));
}
```

#### Sửa `exports.vnpayIPN`:
```javascript
if (donation?.email) {
    // Gửi email cảm ơn
    sendDonationThankYou(donation.email, donation.name, donation.amount)
        .catch(err => console.error('[Donate IPN] Email failed:', err.message));
    
    // TỰ ĐỘNG GỬI VOUCHER
    autoSendVoucher(donation)
        .catch(err => console.error('[Donate IPN] Auto voucher failed:', err.message));
}
```

---

## 🔄 Luồng hoạt động

### User donate 100.000đ:

1. **User nhập thông tin donate**
   - Name: "Nguyễn Văn A"
   - Email: "test@example.com"
   - Amount: 100000

2. **POST /api/donate/create-payment**
   - Tạo Donation với status: 'pending'
   - Redirect đến VNPay

3. **User thanh toán VNPay**
   - Nhập thông tin test card
   - Confirm payment

4. **VNPay callback → vnpayReturn**
   - Update Donation: status = 'success', paidAt = now
   - **Gửi email cảm ơn** (đã có từ trước)
   - **TỰ ĐỘNG:**
     - Tạo voucher code: `THANKAB12CD` (random)
     - Tạo Voucher trong DB: 10%, hết hạn 3 tháng
     - Gửi email voucher với template đẹp
   - Redirect về `/donate?status=success`

5. **User nhận 2 emails:**
   - ✅ Email 1: Cảm ơn đã ủng hộ 100.000đ
   - ✅ Email 2: Voucher giảm 10% - Mã THANKAB12CD

6. **Admin thấy:**
   - Donation trong `/api/donate/admin/list`
   - Voucher trong database
   - User trong banner marquee

7. **User dùng voucher:**
   - Vào `/products`
   - Thêm sản phẩm vào giỏ
   - Checkout → Nhập mã `THANKAB12CD`
   - Giảm 10%

---

## 🧪 Testing

### Test script:
```bash
cd backend
node test-donate-auto-voucher.js
```

**Script sẽ:**
- Tìm donation gần nhất có status success
- Hiển thị thông tin donation
- Tính voucher tier dự kiến
- Tìm voucher đã tạo
- Hiển thị chi tiết voucher

### Test end-to-end:

1. **Restart backend** (QUAN TRỌNG):
   ```bash
   # Stop backend (Ctrl+C)
   # Start lại
   cd backend
   node server.js
   ```

2. **Donate 100k:**
   - Vào `/donate`
   - Nhập: Name, Email, Amount = 100000
   - Click "Ủng hộ ngay"

3. **Thanh toán VNPay sandbox:**
   - Card: 9704198526191432198
   - Name: NGUYEN VAN A
   - Date: 07/15
   - OTP: 123456

4. **Kiểm tra kết quả:**
   - ✅ Redirect về `/donate?status=success`
   - ✅ Check email: 2 emails (cảm ơn + voucher)
   - ✅ Check DB: `node test-donate-auto-voucher.js`
   - ✅ Check banner: Tên hiển thị trong marquee

5. **Test voucher:**
   - Vào `/products`
   - Add to cart
   - Checkout
   - Nhập mã voucher từ email
   - Verify giảm 10%

---

## 📊 Voucher Schema

```javascript
{
  code: "THANKAB12CD",           // Unique, uppercase
  type: "percent",                // percent | fixed
  value: 10,                      // 10%
  description: "Cảm ơn bạn đã ủng hộ 100,000đ",
  startDate: "2026-05-17",
  endDate: "2026-08-17",          // +3 tháng
  usageLimit: 1,                  // Dùng 1 lần
  userLimit: 1,                   // Mỗi user 1 lần
  usedCount: 0,
  isActive: true,
  minOrder: 0,                    // Không giới hạn đơn tối thiểu
  maxDiscount: 0,                 // Không giới hạn giảm tối đa
}
```

---

## 🎨 Email Template

### Subject:
```
🎁 Voucher giảm 10% từ PetAdopt
```

### Design:
- **Header:** Gradient xanh dương (#6272B6 → #8B9FE8)
- **Icon:** 🎁 (48px)
- **Title:** "Quà tặng từ PetAdopt"
- **Body:**
  - Lời chào + Cảm ơn
  - Box voucher:
    - Background: #EEF2FF
    - Border: 2px dashed #6272B6
    - Mã voucher: 32px, bold, #4338CA
    - Giảm giá: 20px, bold, #10b981
    - Hạn sử dụng: 12px, #9CA3AF
  - CTA button: "Mua sắm ngay" → `/products`
  - Footer: "Cảm ơn sự ủng hộ 🐾❤️"

---

## ✅ Checklist hoàn thành

- [x] Email cảm ơn hoạt động
- [x] Admin API list donations
- [x] Banner marquee hiển thị
- [x] **Tự động gửi voucher** ✅ DONE
- [x] Voucher được tạo trong DB
- [x] Email voucher gửi đi
- [x] Test script để verify
- [ ] Trang admin quản lý donations (optional)

---

## 🚀 Next Steps (Optional)

### 1. Tạo trang Admin Supporters
**Path:** `/admin/supporters`

**Features:**
- Table danh sách donations
- Filter: All / Success / Pending / Failed
- Search by name/email
- Actions:
  - Xem chi tiết
  - Gửi voucher thủ công (nếu auto fail)
  - Xóa
- Statistics:
  - Tổng người ủng hộ
  - Tổng tiền
  - Tổng voucher đã gửi

### 2. Thêm notification trong app
Khi user donate xong, tạo notification trong app:
- Type: 'voucher_received'
- Title: "🎁 Bạn nhận được voucher"
- Message: "Mã: THANKAB12CD - Giảm 10%"
- Action: Link đến `/products`

### 3. Customize voucher tiers
Có thể thêm config trong `.env`:
```env
VOUCHER_TIER_1_MIN=50000
VOUCHER_TIER_1_VALUE=5

VOUCHER_TIER_2_MIN=100000
VOUCHER_TIER_2_VALUE=10

VOUCHER_TIER_3_MIN=500000
VOUCHER_TIER_3_VALUE=15

VOUCHER_EXPIRY_MONTHS=3
```

---

## 🐛 Troubleshooting

### Không nhận được email voucher:

1. **Check backend log:**
   ```
   [Donate] ✅ Auto sent voucher THANKAB12CD (10%) to test@example.com
   ```

2. **Check email config:**
   ```bash
   # Trong .env
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-app-password
   ```

3. **Check spam folder**

4. **Test email service:**
   ```bash
   node test-email-only.js
   ```

### Voucher không được tạo trong DB:

1. **Check donation có email không:**
   ```javascript
   // Phải có email khi donate
   { name: "Test", email: "test@example.com", amount: 100000 }
   ```

2. **Check backend đã restart chưa:**
   ```bash
   # Phải restart sau khi sửa code
   ```

3. **Check MongoDB connection:**
   ```bash
   node test-donate-auto-voucher.js
   ```

### Voucher code trùng:

- Code có check trùng trong `autoSendVoucher`
- Nếu trùng sẽ generate lại
- Xác suất trùng: ~1/2 tỷ (36^6)

---

## 📞 Support

Nếu có vấn đề:
1. Check backend log
2. Run test script: `node test-donate-auto-voucher.js`
3. Check email trong spam folder
4. Verify backend đã restart

---

**Status:** ✅ HOÀN THÀNH
**Date:** 2026-05-17
**Version:** 1.0
