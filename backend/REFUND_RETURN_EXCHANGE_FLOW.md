# Quy trình Hoàn tiền / Trả hàng / Đổi hàng

## 📋 Tổng quan

Hệ thống hỗ trợ 3 loại xử lý sau bán hàng:
1. **Hoàn tiền (Refund)** - Hoàn lại tiền cho khách hàng
2. **Trả hàng (Return)** - Khách trả hàng và nhận lại tiền
3. **Đổi hàng (Exchange)** - Khách đổi sản phẩm lỗi lấy sản phẩm mới

---

## 🔄 Trạng thái đơn hàng mới

### Trạng thái hoàn tiền:
- `refund_pending` - Chờ xử lý hoàn tiền
- `refund_processing` - Đang xử lý hoàn tiền
- `refund_completed` - Hoàn tiền thành công

### Trạng thái trả hàng:
- `return_requested` - Yêu cầu trả hàng
- `return_shipping` - Đang gửi hàng trả về
- `return_received` - Đã nhận hàng trả

### Trạng thái đổi hàng:
- `exchange_requested` - Yêu cầu đổi hàng
- `exchange_shipping` - Đang gửi hàng đổi mới
- `exchange_completed` - Đổi hàng thành công

---

## 📝 Quy trình chi tiết

### 1️⃣ HOÀN TIỀN (Refund)

#### Trường hợp 1: User hủy đơn đã thanh toán
```
User yêu cầu hủy đơn (paid/confirmed/shipping)
  ↓
POST /api/orders/:id/request-refund
  - reason: Lý do hủy
  - bankAccount: Số tài khoản
  - bankName: Tên ngân hàng
  - accountHolder: Tên chủ tài khoản
  - qrCodeImage: URL ảnh QR code (optional)
  ↓
Trạng thái: refund_pending
  ↓
Admin xử lý
  ↓
POST /api/orders/:id/process-refund
  - status: 'refund_processing' hoặc 'refund_completed'
  - note: Ghi chú
  - bankAccount/bankName/accountHolder/qrCodeImage (nếu cần cập nhật)
  ↓
Nếu refund_completed:
  - Hoàn kho
  - Hoàn voucher
  - Gửi email thông báo
```

#### Trường hợp 2: Admin hủy đơn
```
Admin hủy đơn
  ↓
PUT /api/orders/:id/status
  - status: 'cancelled'
  - note: Lý do hủy
  ↓
Tự động:
  - Hoàn kho
  - Hoàn voucher
  ↓
Nếu cần hoàn tiền cho khách:
  ↓
Admin chuyển sang refund_pending
  ↓
POST /api/orders/:id/process-refund
  - Nhập thông tin ngân hàng khách
  - Xử lý hoàn tiền
```

#### Trường hợp 3: Sau khi nhận hàng (trong 3 ngày)
```
User nhận hàng (completed)
  ↓
Trong vòng 3 ngày, user không hài lòng
  ↓
POST /api/orders/:id/request-refund
  - reason: Lý do
  - bankAccount, bankName, accountHolder
  ↓
Trạng thái: refund_pending
  ↓
Admin xử lý như trường hợp 1
```

---

### 2️⃣ TRẢ HÀNG (Return)

```
User nhận hàng (completed)
  ↓
Trong vòng 3 ngày, phát hiện lỗi
  ↓
POST /api/orders/:id/request-return-exchange
  - type: 'return'
  - reason: Lý do trả hàng
  - images: [URL ảnh chứng minh lỗi]
  ↓
Trạng thái: return_requested
  ↓
Admin xem xét yêu cầu
  ↓
POST /api/orders/:id/process-return
  - action: 'approve_refund' hoặc 'reject'
  - note: Ghi chú
  - inspectionNote: Kết quả kiểm tra
  - bankAccount/bankName/accountHolder/qrCodeImage (nếu approve)
  ↓
Nếu approve_refund:
  - Trạng thái: refund_pending
  - Khách gửi hàng về (ship COD)
  ↓
Admin cập nhật trạng thái vận chuyển
  ↓
POST /api/orders/:id/update-return-status
  - status: 'return_shipping'
  - trackingNumber: Mã vận đơn
  ↓
Hàng về đến
  ↓
POST /api/orders/:id/update-return-status
  - status: 'return_received'
  ↓
Admin kiểm tra hàng OK
  ↓
POST /api/orders/:id/process-refund
  - status: 'refund_completed'
  - Hoàn tiền cho khách
```

---

### 3️⃣ ĐỔI HÀNG (Exchange)

```
User nhận hàng (completed)
  ↓
Trong vòng 3 ngày, phát hiện lỗi
  ↓
POST /api/orders/:id/request-return-exchange
  - type: 'exchange'
  - reason: Lý do đổi hàng
  - images: [URL ảnh chứng minh lỗi]
  ↓
Trạng thái: exchange_requested
  ↓
Admin xem xét yêu cầu
  ↓
POST /api/orders/:id/process-exchange
  - action: 'approve' hoặc 'reject'
  - note: Ghi chú
  - inspectionNote: Kết quả kiểm tra
  ↓
Nếu approve:
  - Tạo đơn hàng mới với giá 0đ (ship COD)
  - Trạng thái đơn cũ: exchange_completed
  - Khách gửi hàng lỗi về (ship COD)
  ↓
Admin cập nhật trạng thái vận chuyển (optional)
  ↓
POST /api/orders/:id/update-return-status
  - status: 'return_shipping'
  - trackingNumber: Mã vận đơn
  ↓
Hàng về đến, admin kiểm tra OK
  ↓
Giao đơn hàng mới cho khách (giá 0đ)
```

---

## 🔐 API Endpoints

### User APIs

#### 1. Yêu cầu hoàn tiền
```http
POST /api/orders/:id/request-refund
Authorization: Bearer {token}

Body:
{
  "reason": "Không còn nhu cầu",
  "bankAccount": "1234567890",
  "bankName": "Vietcombank",
  "accountHolder": "NGUYEN VAN A",
  "qrCodeImage": "https://example.com/qr.jpg" // optional
}

Response:
{
  "success": true,
  "message": "Yêu cầu hoàn tiền đã được gửi",
  "data": { /* order object */ }
}
```

#### 2. Yêu cầu trả/đổi hàng
```http
POST /api/orders/:id/request-return-exchange
Authorization: Bearer {token}

Body:
{
  "type": "return", // hoặc "exchange"
  "reason": "Sản phẩm bị lỗi",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}

Response:
{
  "success": true,
  "message": "Yêu cầu trả hàng đã được gửi",
  "data": { /* order object */ }
}
```

### Admin APIs

#### 3. Xử lý hoàn tiền
```http
POST /api/orders/:id/process-refund
Authorization: Bearer {admin_token}

Body:
{
  "status": "refund_completed", // hoặc "refund_processing", "cancelled"
  "note": "Đã hoàn tiền vào tài khoản",
  "bankAccount": "1234567890", // optional - cập nhật nếu cần
  "bankName": "Vietcombank",
  "accountHolder": "NGUYEN VAN A",
  "qrCodeImage": "https://example.com/qr.jpg"
}

Response:
{
  "success": true,
  "message": "Hoàn tiền thành công",
  "data": { /* order object */ }
}
```

#### 4. Xử lý trả hàng
```http
POST /api/orders/:id/process-return
Authorization: Bearer {admin_token}

Body:
{
  "action": "approve_refund", // hoặc "reject"
  "note": "Chấp nhận trả hàng",
  "inspectionNote": "Sản phẩm còn nguyên vẹn",
  "trackingNumber": "VN123456789", // optional
  "bankAccount": "1234567890",
  "bankName": "Vietcombank",
  "accountHolder": "NGUYEN VAN A",
  "qrCodeImage": "https://example.com/qr.jpg"
}

Response:
{
  "success": true,
  "message": "Đã chấp nhận trả hàng và chuyển sang xử lý hoàn tiền",
  "data": { /* order object */ }
}
```

#### 5. Xử lý đổi hàng
```http
POST /api/orders/:id/process-exchange
Authorization: Bearer {admin_token}

Body:
{
  "action": "approve", // hoặc "reject"
  "note": "Chấp nhận đổi hàng",
  "inspectionNote": "Sản phẩm bị lỗi sản xuất",
  "trackingNumber": "VN123456789" // optional
}

Response:
{
  "success": true,
  "message": "Đã chấp nhận đổi hàng và tạo đơn mới",
  "data": {
    "originalOrder": { /* order object */ },
    "newOrder": { /* new order object with price = 0 */ }
  }
}
```

#### 6. Cập nhật trạng thái vận chuyển trả hàng
```http
POST /api/orders/:id/update-return-status
Authorization: Bearer {admin_token}

Body:
{
  "status": "return_shipping", // hoặc "return_received"
  "trackingNumber": "VN123456789",
  "note": "Hàng đang trên đường về kho"
}

Response:
{
  "success": true,
  "message": "Đã cập nhật trạng thái trả hàng",
  "data": { /* order object */ }
}
```

---

## ⚠️ Lưu ý quan trọng

### Thời hạn
- **Trả/đổi hàng**: Chỉ trong vòng **3 ngày** sau khi đơn hàng `completed`
- **Hoàn tiền**: Có thể yêu cầu bất cứ lúc nào trước khi hàng được giao

### Điều kiện
- Đơn hàng phải ở trạng thái phù hợp
- Sản phẩm trả lại phải còn nguyên vẹn (admin kiểm tra)
- Có ảnh chứng minh nếu sản phẩm lỗi

### Tự động hóa
- Khi `refund_completed`: Tự động hoàn kho + hoàn voucher
- Khi `exchange approved`: Tự động tạo đơn mới giá 0đ
- Gửi email thông báo tự động cho mọi thay đổi trạng thái

### Bảo mật
- User chỉ thao tác được với đơn hàng của mình
- Admin có quyền xử lý tất cả đơn hàng
- Thông tin ngân hàng được lưu an toàn trong database

---

## 📊 Sơ đồ trạng thái

```
                    ┌─────────────┐
                    │   pending   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  confirmed  │◄─── User có thể hủy
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    paid     │◄─── User có thể yêu cầu hoàn tiền
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  shipping   │◄─── User có thể yêu cầu hoàn tiền
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  completed  │◄─── Trong 3 ngày: trả/đổi hàng
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌──▼───────┐ ┌─▼──────────┐
       │return_req   │ │exchange  │ │refund_pend │
       └──────┬──────┘ │_requested│ └─────┬──────┘
              │        └────┬─────┘       │
       ┌──────▼──────┐     │        ┌────▼────────┐
       │return_ship  │     │        │refund_proc  │
       └──────┬──────┘     │        └─────┬───────┘
              │            │              │
       ┌──────▼──────┐     │        ┌─────▼───────┐
       │return_recv  │     │        │refund_comp  │
       └──────┬──────┘     │        └─────────────┘
              │            │
       ┌──────▼──────┐     │
       │refund_pend  │     │
       └─────────────┘     │
                           │
                    ┌──────▼──────┐
                    │exchange_    │
                    │completed    │
                    └─────────────┘
                    (+ tạo đơn mới)
```

---

## 🎯 Ví dụ thực tế

### Ví dụ 1: Khách hủy đơn COD
```javascript
// User hủy đơn confirmed (COD)
PUT /api/orders/me/123/cancel

// Kết quả:
// - Trạng thái: cancelled
// - Hoàn kho tự động
// - Hoàn voucher tự động
// - Gửi email xác nhận
```

### Ví dụ 2: Khách hủy đơn VNPay đã thanh toán
```javascript
// 1. User yêu cầu hoàn tiền
POST /api/orders/123/request-refund
{
  "reason": "Đặt nhầm",
  "bankAccount": "1234567890",
  "bankName": "Vietcombank",
  "accountHolder": "NGUYEN VAN A"
}

// 2. Admin xử lý
POST /api/orders/123/process-refund
{
  "status": "refund_completed",
  "note": "Đã chuyển khoản"
}

// Kết quả:
// - Hoàn kho
// - Hoàn voucher
// - Gửi email thông báo
```

### Ví dụ 3: Khách trả hàng lỗi
```javascript
// 1. User yêu cầu trả hàng
POST /api/orders/123/request-return-exchange
{
  "type": "return",
  "reason": "Sản phẩm bị rách",
  "images": ["url1.jpg", "url2.jpg"]
}

// 2. Admin chấp nhận
POST /api/orders/123/process-return
{
  "action": "approve_refund",
  "bankAccount": "1234567890",
  "bankName": "Vietcombank",
  "accountHolder": "NGUYEN VAN A"
}

// 3. Khách gửi hàng về (ship COD)
// 4. Admin cập nhật
POST /api/orders/123/update-return-status
{
  "status": "return_shipping",
  "trackingNumber": "VN123456"
}

// 5. Hàng về đến
POST /api/orders/123/update-return-status
{
  "status": "return_received"
}

// 6. Admin hoàn tiền
POST /api/orders/123/process-refund
{
  "status": "refund_completed",
  "note": "Đã hoàn tiền"
}
```

### Ví dụ 4: Khách đổi hàng
```javascript
// 1. User yêu cầu đổi hàng
POST /api/orders/123/request-return-exchange
{
  "type": "exchange",
  "reason": "Sản phẩm bị lỗi",
  "images": ["url1.jpg"]
}

// 2. Admin chấp nhận
POST /api/orders/123/process-exchange
{
  "action": "approve",
  "note": "Đã tạo đơn mới"
}

// Kết quả:
// - Đơn cũ: exchange_completed
// - Đơn mới: confirmed, giá 0đ, ship COD
// - Khách gửi hàng lỗi về
// - Nhận hàng mới miễn phí
```

---

## 📧 Email & Thông báo

Hệ thống tự động gửi email và tạo notification cho các sự kiện:
- ✅ Yêu cầu hoàn tiền được gửi
- ✅ Hoàn tiền đang xử lý
- ✅ Hoàn tiền thành công
- ✅ Yêu cầu trả/đổi hàng được gửi
- ✅ Trả/đổi hàng được chấp nhận/từ chối
- ✅ Cập nhật trạng thái vận chuyển
- ✅ Đơn hàng mới được tạo (đổi hàng)

---

## 🛠️ Cải tiến so với yêu cầu ban đầu

1. **Tách biệt rõ ràng**: Hoàn tiền, trả hàng, đổi hàng có flow riêng
2. **Thời hạn 3 ngày**: Tự động kiểm tra thời hạn
3. **Thông tin ngân hàng**: Lưu trữ an toàn, hỗ trợ QR code
4. **Tracking**: Mã vận đơn cho hàng trả về
5. **Inspection**: Admin ghi chú kiểm tra hàng
6. **Đơn mới giá 0đ**: Tự động tạo khi đổi hàng
7. **Email tự động**: Thông báo mọi thay đổi
8. **Hoàn kho/voucher**: Tự động khi hoàn tiền thành công
9. **Bảo mật**: User chỉ thao tác đơn của mình
10. **Linh hoạt**: Admin có thể cập nhật thông tin ngân hàng

---

## 🚀 Triển khai

Tất cả code đã được thêm vào:
- ✅ `backend/src/models/Order.js` - Schema mới
- ✅ `backend/src/controllers/orderController.js` - 6 functions mới
- ✅ `backend/src/routes/order.routes.js` - 6 endpoints mới

Sẵn sàng sử dụng ngay! 🎉
