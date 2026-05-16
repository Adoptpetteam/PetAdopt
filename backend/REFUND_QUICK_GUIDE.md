# 🚀 Hướng dẫn nhanh - Hoàn hủy đơn hàng

## 📌 Tóm tắt

### User có thể:
1. **Hủy đơn** (pending/confirmed) → Tự động hoàn kho
2. **Yêu cầu hoàn tiền** (paid/shipping/completed trong 3 ngày) → Admin xử lý
3. **Yêu cầu trả hàng** (completed trong 3 ngày) → Admin xử lý → Hoàn tiền
4. **Yêu cầu đổi hàng** (completed trong 3 ngày) → Admin xử lý → Đơn mới giá 0đ

### Admin có thể:
1. **Hủy đơn** → Tự động hoàn kho + voucher
2. **Xử lý hoàn tiền** → Nhập thông tin ngân hàng → Hoàn tiền
3. **Xử lý trả hàng** → Chấp nhận/Từ chối → Hoàn tiền nếu OK
4. **Xử lý đổi hàng** → Chấp nhận/Từ chối → Tạo đơn mới giá 0đ

---

## 🔥 API nhanh

### 1. User yêu cầu hoàn tiền
```bash
POST /api/orders/:id/request-refund
{
  "reason": "Không còn nhu cầu",
  "bankAccount": "1234567890",
  "bankName": "Vietcombank",
  "accountHolder": "NGUYEN VAN A"
}
```

### 2. User yêu cầu trả/đổi hàng
```bash
POST /api/orders/:id/request-return-exchange
{
  "type": "return",  # hoặc "exchange"
  "reason": "Sản phẩm lỗi",
  "images": ["url1.jpg"]
}
```

### 3. Admin xử lý hoàn tiền
```bash
POST /api/orders/:id/process-refund
{
  "status": "refund_completed",
  "note": "Đã chuyển khoản"
}
```

### 4. Admin xử lý trả hàng
```bash
POST /api/orders/:id/process-return
{
  "action": "approve_refund",  # hoặc "reject"
  "bankAccount": "1234567890",
  "bankName": "Vietcombank",
  "accountHolder": "NGUYEN VAN A"
}
```

### 5. Admin xử lý đổi hàng
```bash
POST /api/orders/:id/process-exchange
{
  "action": "approve",  # hoặc "reject"
  "note": "Đã tạo đơn mới"
}
```

### 6. Admin cập nhật trạng thái vận chuyển
```bash
POST /api/orders/:id/update-return-status
{
  "status": "return_shipping",  # hoặc "return_received"
  "trackingNumber": "VN123456"
}
```

---

## 📊 Trạng thái mới

### Hoàn tiền:
- `refund_pending` → `refund_processing` → `refund_completed`

### Trả hàng:
- `return_requested` → `return_shipping` → `return_received` → `refund_pending`

### Đổi hàng:
- `exchange_requested` → `exchange_completed` (+ tạo đơn mới)

---

## ⚡ Flow nhanh

### Hoàn tiền đơn đã thanh toán:
```
User request → Admin process → refund_completed → Hoàn kho + voucher
```

### Trả hàng:
```
User request return → Admin approve → User ship về → Admin receive → Admin refund
```

### Đổi hàng:
```
User request exchange → Admin approve → Tạo đơn mới giá 0đ → User ship hàng lỗi về
```

---

## 🎯 Test scenarios

### Test 1: User hủy đơn COD
```bash
PUT /api/orders/me/:id/cancel
# Kết quả: cancelled, hoàn kho, hoàn voucher
```

### Test 2: User yêu cầu hoàn tiền đơn VNPay
```bash
# 1. Request
POST /api/orders/:id/request-refund
{
  "reason": "Đặt nhầm",
  "bankAccount": "123456",
  "bankName": "VCB",
  "accountHolder": "NGUYEN VAN A"
}

# 2. Admin xử lý
POST /api/orders/:id/process-refund
{
  "status": "refund_completed",
  "note": "Done"
}
```

### Test 3: User trả hàng lỗi
```bash
# 1. Request
POST /api/orders/:id/request-return-exchange
{
  "type": "return",
  "reason": "Lỗi",
  "images": ["url.jpg"]
}

# 2. Admin approve
POST /api/orders/:id/process-return
{
  "action": "approve_refund",
  "bankAccount": "123456",
  "bankName": "VCB",
  "accountHolder": "NGUYEN VAN A"
}

# 3. Update shipping
POST /api/orders/:id/update-return-status
{
  "status": "return_shipping",
  "trackingNumber": "VN123"
}

# 4. Received
POST /api/orders/:id/update-return-status
{
  "status": "return_received"
}

# 5. Refund
POST /api/orders/:id/process-refund
{
  "status": "refund_completed"
}
```

### Test 4: User đổi hàng
```bash
# 1. Request
POST /api/orders/:id/request-return-exchange
{
  "type": "exchange",
  "reason": "Lỗi",
  "images": ["url.jpg"]
}

# 2. Admin approve
POST /api/orders/:id/process-exchange
{
  "action": "approve",
  "note": "OK"
}

# Kết quả: Đơn cũ exchange_completed, đơn mới giá 0đ
```

---

## ✅ Checklist triển khai

- [x] Cập nhật Order model với trạng thái mới
- [x] Thêm fields refund và returnExchange
- [x] Tạo 6 controller functions mới
- [x] Thêm 6 routes mới
- [x] Cập nhật validation status
- [x] Tự động hoàn kho khi refund_completed
- [x] Tự động hoàn voucher
- [x] Gửi email thông báo
- [x] Kiểm tra thời hạn 3 ngày
- [x] Bảo mật: User chỉ thao tác đơn của mình

---

## 📝 Notes

- **Thời hạn**: 3 ngày sau khi completed
- **Hoàn kho**: Tự động khi refund_completed
- **Voucher**: Tự động hoàn khi refund_completed
- **Email**: Tự động gửi mọi thay đổi
- **Đơn mới**: Giá 0đ, ship COD khi đổi hàng
- **Tracking**: Hỗ trợ mã vận đơn cho hàng trả về

Xem chi tiết: `REFUND_RETURN_EXCHANGE_FLOW.md`
