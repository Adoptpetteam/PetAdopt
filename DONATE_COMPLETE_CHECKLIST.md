# ✅ CHECKLIST: LUỒNG DONATE ĐẦY ĐỦ

## 🎯 Yêu cầu

1. ✅ **User donate xong → Email cảm ơn**
2. ✅ **Admin thấy danh sách người ủng hộ**
3. ✅ **Banner chạy hiển thị người ủng hộ**
4. ⚠️ **Tự động gửi voucher cho người ủng hộ**

---

## 1. ✅ Email cảm ơn

### Hiện trạng: ĐÃ CÓ
**File:** `backend/src/controllers/donateController.js`
**Function:** `vnpayReturn` và `vnpayIPN`

```javascript
if (rspCode === '00') {
  const donation = await Donation.findOneAndUpdate(
    { orderId },
    { status: 'success', paidAt: new Date() },
    { new: true }
  );
  
  // GỬI EMAIL CẢM ƠN
  if (donation?.email) {
    sendDonationThankYou(donation.email, donation.name, donation.amount)
      .catch(err => console.error('[Donate] Email failed:', err.message));
  }
}
```

### Email template
**File:** `backend/src/utils/donateService.js`

**Nội dung:**
- 💚 Icon trái tim
- Lời cảm ơn
- Số tiền đã donate
- Logo PetAdopt
- CTA: Xem thêm thú cưng

### Test:
```bash
# Donate xong kiểm tra email
# Nếu không nhận được, check:
# 1. Email config trong .env
# 2. Backend log có lỗi không
# 3. Spam folder
```

---

## 2. ✅ Admin thấy người ủng hộ

### Hiện trạng: ĐÃ CÓ

#### API: `GET /api/donate/admin/list`
**Params:** `{ page, limit, status }`
**Response:**
```json
{
  "data": [
    {
      "_id": "...",
      "orderId": "...",
      "name": "Nguyen Van A",
      "email": "test@example.com",
      "amount": 50000,
      "status": "success",
      "paidAt": "2026-05-17T...",
      "createdAt": "2026-05-17T..."
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 10 }
}
```

#### Trang admin (cần tạo nếu chưa có)
**Path:** `/admin/supporters` hoặc `/admin/donations`

**Features:**
- Table danh sách donations
- Filter: All / Success / Pending / Failed
- Pagination
- Actions: Gửi voucher, Xóa
- Statistics: Tổng số người ủng hộ, Tổng tiền

### Cần tạo trang admin:
```typescript
// frontend/src/pages/Admin/Supporters.tsx
// Hoặc sử dụng trang có sẵn nếu đã có
```

---

## 3. ✅ Banner chạy (Marquee)

### Hiện trạng: ĐÃ CÓ

**Component:** `frontend/src/components/TopSupportersMarquee.tsx`

**API:** `GET /api/donate/supporters?limit=50`

**Features:**
- Hiển thị danh sách người ủng hộ
- Auto-scroll ngang
- Avatar + Tên + Số tiền
- Animation mượt

**Vị trí hiển thị:**
- Trang `/donate`
- Trang chủ (nếu muốn)
- Footer (nếu muốn)

### Đã hoạt động:
```tsx
<TopSupportersMarquee />
```

---

## 4. ⚠️ TỰ ĐỘNG GỬI VOUCHER (CẦN THÊM)

### Hiện trạng: CHƯA TỰ ĐỘNG

**Hiện tại:** Admin phải thủ công gửi voucher qua API
**Cần:** Tự động gửi voucher khi donate thành công

### Giải pháp: Thêm logic tự động

#### Option 1: Tự động gửi voucher cố định
**Ví dụ:** Donate ≥ 100k → Tự động voucher giảm 10%

```javascript
// Trong vnpayReturn / vnpayIPN
if (rspCode === '00') {
  const donation = await Donation.findOneAndUpdate(...);
  
  // Gửi email cảm ơn
  if (donation?.email) {
    sendDonationThankYou(donation.email, donation.name, donation.amount);
  }
  
  // TỰ ĐỘNG GỬI VOUCHER
  if (donation?.amount >= 100000) {
    await autoSendVoucher(donation);
  }
}
```

#### Option 2: Admin config voucher tiers
**Ví dụ:**
- 50k-99k: Voucher 5%
- 100k-499k: Voucher 10%
- ≥500k: Voucher 15%

---

## 🚀 IMPLEMENTATION: Tự động gửi voucher

### Bước 1: Tạo function autoSendVoucher

**File:** `backend/src/controllers/donateController.js`

```javascript
async function autoSendVoucher(donation) {
  try {
    const { email, name, amount } = donation;
    
    // Xác định voucher tier
    let voucherValue, voucherCode;
    if (amount >= 500000) {
      voucherValue = 15;
      voucherCode = `THANK${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    } else if (amount >= 100000) {
      voucherValue = 10;
      voucherCode = `THANK${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    } else if (amount >= 50000) {
      voucherValue = 5;
      voucherCode = `THANK${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    } else {
      return; // Không gửi voucher nếu < 50k
    }
    
    // Tạo voucher trong database
    const Voucher = require('../models/Voucher');
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // Hết hạn sau 3 tháng
    
    await Voucher.create({
      code: voucherCode,
      type: 'percent',
      value: voucherValue,
      description: `Cảm ơn bạn đã ủng hộ ${amount.toLocaleString('vi-VN')}đ`,
      startDate: new Date(),
      endDate,
      usageLimit: 1,
      usedCount: 0,
      isActive: true,
      minOrderValue: 0,
    });
    
    // Gửi email voucher
    await sendVoucherEmailAuto(email, name, voucherCode, voucherValue, endDate);
    
    console.log(`[Donate] Auto sent voucher ${voucherCode} to ${email}`);
  } catch (error) {
    console.error('[Donate] Auto voucher error:', error.message);
  }
}

async function sendVoucherEmailAuto(email, name, code, value, endDate) {
  const { sendEmail } = require('../utils/emailService');
  
  const html = `
<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f9f9f9;padding:20px;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#6272B6,#8B9FE8);padding:32px;text-align:center;">
    <div style="font-size:48px;">🎁</div>
    <h1 style="color:#fff;font-size:22px;margin:12px 0 0;">Quà tặng từ PetAdopt</h1>
  </div>
  <div style="padding:32px;">
    <p>Xin chào <strong>${name || 'bạn'}</strong>,</p>
    <p>Cảm ơn bạn đã ủng hộ trung tâm bảo trợ thú cưng PetAdopt! 💚</p>
    <p>Đây là voucher giảm giá dành riêng cho bạn:</p>
    <div style="background:#EEF2FF;border:2px dashed #6272B6;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
      <p style="font-size:12px;color:#6366F1;font-weight:bold;letter-spacing:2px;margin:0 0 8px;">MÃ VOUCHER</p>
      <p style="font-size:32px;font-weight:bold;color:#4338CA;letter-spacing:4px;margin:0 0 8px;">${code}</p>
      <p style="font-size:20px;font-weight:bold;color:#10b981;margin:0;">Giảm ${value}%</p>
      <p style="font-size:12px;color:#9CA3AF;margin:8px 0 0;">Hết hạn: ${new Date(endDate).toLocaleDateString('vi-VN')}</p>
    </div>
    <p>Nhập mã này khi thanh toán tại cửa hàng để nhận ưu đãi nhé!</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.CLIENT_URL}/products" style="display:inline-block;background:#6272B6;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">Mua sắm ngay</a>
    </div>
    <p style="color:#9CA3AF;font-size:12px;margin-top:24px;">Cảm ơn sự ủng hộ của bạn 🐾❤️<br/>PetAdopt Team</p>
  </div>
</div>
</body></html>`;
  
  await sendEmail(email, `🎁 Voucher giảm ${value}% từ PetAdopt`, html);
}
```

### Bước 2: Gọi autoSendVoucher trong vnpayReturn

```javascript
exports.vnpayReturn = async (req, res) => {
  try {
    // ... existing code ...
    
    if (rspCode === '00') {
      const donation = await Donation.findOneAndUpdate(
        { orderId },
        { status: 'success', paidAt: new Date() },
        { new: true }
      );
      
      // Gửi email cảm ơn
      if (donation?.email) {
        sendDonationThankYou(donation.email, donation.name, donation.amount)
          .catch(err => console.error('[Donate] Email failed:', err.message));
      }
      
      // TỰ ĐỘNG GỬI VOUCHER
      if (donation) {
        autoSendVoucher(donation)
          .catch(err => console.error('[Donate] Auto voucher failed:', err.message));
      }
      
      // ... rest of code ...
    }
  } catch (error) {
    // ... error handling ...
  }
};
```

### Bước 3: Tương tự cho vnpayIPN

```javascript
exports.vnpayIPN = async (req, res) => {
  try {
    // ... existing code ...
    
    if (rspCode === '00') {
      const donation = await Donation.findOneAndUpdate(...);
      
      if (donation?.email) {
        sendDonationThankYou(donation.email, donation.name, donation.amount);
      }
      
      // TỰ ĐỘNG GỬI VOUCHER
      if (donation) {
        autoSendVoucher(donation);
      }
    }
    
    // ... rest of code ...
  } catch (error) {
    // ... error handling ...
  }
};
```

---

## 📊 Voucher Tiers (Đề xuất)

| Số tiền donate | Voucher | Mã | Hạn sử dụng |
|----------------|---------|-----|-------------|
| < 50.000đ | Không | - | - |
| 50k - 99k | Giảm 5% | THANK + random | 3 tháng |
| 100k - 499k | Giảm 10% | THANK + random | 3 tháng |
| ≥ 500k | Giảm 15% | THANK + random | 3 tháng |

**Có thể customize:**
- Thay đổi % giảm giá
- Thay đổi hạn sử dụng
- Thêm minOrderValue
- Giới hạn usageLimit

---

## 🧪 Testing

### Test flow đầy đủ:

1. **User donate 100k**
   ```
   POST /api/donate/create-payment
   Body: { name: "Test User", email: "test@example.com", amount: 100000 }
   ```

2. **Thanh toán VNPay sandbox**
   - Mở paymentUrl
   - Nhập thông tin test card
   - Confirm

3. **Kiểm tra kết quả:**
   - ✅ Email cảm ơn đến inbox
   - ✅ Email voucher đến inbox (10%)
   - ✅ Voucher được tạo trong DB
   - ✅ Admin thấy donation trong list
   - ✅ Banner hiển thị người ủng hộ

4. **Test voucher:**
   - Vào `/products`
   - Thêm sản phẩm vào giỏ
   - Checkout → Nhập mã voucher
   - Kiểm tra giảm giá đúng 10%

---

## ✅ Checklist cuối cùng

- [x] Email cảm ơn hoạt động
- [x] Admin API list donations
- [x] Banner marquee hiển thị
- [ ] **Tự động gửi voucher** (CẦN IMPLEMENT)
- [ ] Trang admin quản lý donations (nếu chưa có)
- [ ] Test end-to-end flow

---

## 📝 Files cần sửa/tạo

### Cần sửa:
1. ✅ `backend/.env` - Đã fix VNPay config
2. ⚠️ `backend/src/controllers/donateController.js` - Thêm autoSendVoucher

### Cần tạo (nếu chưa có):
1. `frontend/src/pages/Admin/Supporters.tsx` - Trang admin quản lý
2. Hoặc thêm vào Dashboard hiện có

---

## 🚀 Next: Implement Auto Voucher

Bạn muốn tôi implement luôn phần tự động gửi voucher không? 
Hoặc bạn muốn customize voucher tiers trước?
