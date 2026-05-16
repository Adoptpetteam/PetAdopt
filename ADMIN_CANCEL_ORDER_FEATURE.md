# Tính năng Admin Hủy Đơn Hàng với Thông Báo

## 📋 Tổng quan

Tính năng cho phép admin hủy đơn hàng với lý do cụ thể và tự động gửi thông báo đến khách hàng. Hệ thống xử lý 2 trường hợp:

### Trường hợp 1: Đơn VNPay đã thanh toán
- Admin hủy đơn → Nhập lý do
- Hệ thống tự động:
  - Hoàn kho sản phẩm
  - Hoàn voucher (nếu có)
  - Tạo notification với form hoàn tiền
  - Khách hàng nhận thông báo trên `/notifications`
  - Khách điền form: Tên ngân hàng, Số TK, Chủ TK, Upload QR

### Trường hợp 2: Đơn COD
- Admin hủy đơn → Nhập lý do
- Hệ thống tự động:
  - Hoàn kho sản phẩm
  - Hoàn voucher (nếu có)
  - Tạo notification với lý do hủy
  - Khách hàng nhận thông báo trên `/notifications`

## 🎯 Các file đã thay đổi

### Backend

1. **`backend/src/controllers/orderController.js`**
   - Thêm function `adminCancelOrder()`
   - Xử lý hủy đơn với lý do
   - Tạo notification khác nhau cho VNPay/COD

2. **`backend/src/routes/order.routes.js`**
   - Thêm route: `POST /api/orders/:id/admin-cancel`

3. **`backend/src/controllers/notificationController.js`**
   - Thêm function `updateRefundInfo()`
   - Xử lý cập nhật thông tin ngân hàng từ khách

4. **`backend/src/routes/notification.routes.js`**
   - Thêm route: `POST /api/notifications/:id/refund-info`

### Frontend

1. **`frontend/src/pages/Admin/order.tsx`**
   - Thêm button "Hủy đơn" trong table
   - Thêm Modal nhập lý do hủy đơn
   - Thêm state: `cancelModalVisible`, `cancelReason`, `cancelingOrderId`
   - Thêm functions: `handleCancelOrder()`, `confirmCancelOrder()`

2. **`frontend/src/pages/Notifications.tsx`**
   - Import `RefundInfoModal`
   - Thêm state: `refundModalVisible`, `selectedNotification`
   - Cập nhật `handleAction()` để mở modal form hoàn tiền
   - Hiển thị button "Cập nhật thông tin hoàn tiền" cho notification VNPay

3. **`frontend/src/components/RefundInfoModal.tsx`** (MỚI)
   - Component modal form nhập thông tin hoàn tiền
   - Fields: Tên ngân hàng, Số TK, Chủ TK, Upload QR
   - Gửi API: `POST /api/notifications/:id/refund-info`

## 🔄 Luồng hoạt động

### Luồng VNPay (Đã thanh toán)

```
1. Admin click "Hủy đơn" → Modal hiện ra
2. Admin nhập lý do → Click "Xác nhận hủy"
3. Backend:
   - Hoàn kho sản phẩm
   - Hoàn voucher
   - Cập nhật orderStatus = 'cancelled'
   - Cập nhật paymentStatus = 'refunding'
   - Tạo Notification type='order_refund_required'
4. Khách hàng vào /notifications
5. Thấy thông báo "Đơn hàng đã bị hủy - Cần cập nhật thông tin hoàn tiền"
6. Click button "Cập nhật thông tin hoàn tiền"
7. Modal form hiện ra
8. Khách điền: Tên NH, Số TK, Chủ TK, Upload QR
9. Click "Gửi thông tin"
10. Backend lưu thông tin vào notification.metadata và order.refund
11. Admin có thể xem thông tin và chuyển tiền
```

### Luồng COD

```
1. Admin click "Hủy đơn" → Modal hiện ra
2. Admin nhập lý do → Click "Xác nhận hủy"
3. Backend:
   - Hoàn kho sản phẩm
   - Hoàn voucher
   - Cập nhật orderStatus = 'cancelled'
   - Tạo Notification type='order_cancelled'
4. Khách hàng vào /notifications
5. Thấy thông báo "Đơn hàng đã bị hủy" với lý do
6. Không cần thao tác gì thêm
```

## 📡 API Endpoints

### 1. Admin hủy đơn
```http
POST /api/orders/:orderId/admin-cancel
Authorization: Bearer <admin_token>

Body:
{
  "reason": "Sản phẩm hết hàng"
}

Response:
{
  "success": true,
  "message": "Đã hủy đơn hàng và gửi thông báo cho khách hàng",
  "data": { ... }
}
```

### 2. Khách cập nhật thông tin hoàn tiền
```http
POST /api/notifications/:notificationId/refund-info
Authorization: Bearer <user_token>

Body:
{
  "bankName": "Vietcombank",
  "accountNumber": "1234567890",
  "accountHolder": "NGUYEN VAN A",
  "qrImage": "https://..."
}

Response:
{
  "success": true,
  "message": "Đã cập nhật thông tin hoàn tiền thành công",
  "data": { ... }
}
```

## 🎨 UI Components

### Admin Order Page - Modal Hủy Đơn
- Title: "Hủy đơn hàng" với icon StopOutlined
- Alert cảnh báo về hậu quả
- TextArea nhập lý do (required, max 500 ký tự)
- Hiển thị mã đơn hàng
- Buttons: "Xác nhận hủy" (danger), "Quay lại"

### Notifications Page - Notification Card
- VNPay: Hiển thị button "📝 Cập nhật thông tin hoàn tiền" (màu cam)
- COD: Hiển thị button "Xem đơn hàng" (màu xanh)

### RefundInfoModal
- Title: "Cập nhật thông tin hoàn tiền" với icon BankOutlined
- Hiển thị lý do hủy và số tiền hoàn
- Form fields:
  - Tên ngân hàng (required)
  - Số tài khoản (required, chỉ số)
  - Chủ tài khoản (required)
  - Upload ảnh QR (optional)
- Buttons: "Hủy", "Gửi thông tin"

## ✅ Checklist hoàn thành

- [x] Backend API admin hủy đơn
- [x] Backend API cập nhật thông tin hoàn tiền
- [x] Frontend button hủy đơn trong admin
- [x] Frontend modal nhập lý do hủy
- [x] Frontend RefundInfoModal component
- [x] Frontend hiển thị notification với form hoàn tiền
- [x] Xử lý 2 trường hợp VNPay/COD
- [x] Hoàn kho tự động
- [x] Hoàn voucher tự động
- [x] Validation lý do hủy
- [x] Upload ảnh QR

## 🧪 Test Cases

### Test 1: Hủy đơn VNPay đã thanh toán
1. Tạo đơn hàng VNPay và thanh toán thành công
2. Admin vào trang quản lý đơn hàng
3. Click "Hủy đơn" → Nhập lý do "Sản phẩm hết hàng"
4. Kiểm tra:
   - Kho được hoàn
   - Voucher được hoàn
   - Notification được tạo với type='order_refund_required'
5. Khách vào /notifications
6. Click "Cập nhật thông tin hoàn tiền"
7. Điền form và gửi
8. Kiểm tra thông tin được lưu vào notification.metadata

### Test 2: Hủy đơn COD
1. Tạo đơn hàng COD
2. Admin vào trang quản lý đơn hàng
3. Click "Hủy đơn" → Nhập lý do "Khách yêu cầu hủy"
4. Kiểm tra:
   - Kho được hoàn
   - Voucher được hoàn
   - Notification được tạo với type='order_cancelled'
5. Khách vào /notifications
6. Thấy thông báo với lý do hủy
7. Không có form hoàn tiền

## 🚀 Cách sử dụng

### Admin
1. Vào http://localhost:5173/admin/order
2. Tìm đơn hàng cần hủy
3. Click button "Hủy đơn" (màu đỏ)
4. Nhập lý do hủy đơn (bắt buộc)
5. Click "Xác nhận hủy"
6. Hệ thống tự động xử lý và gửi thông báo

### Khách hàng (VNPay)
1. Vào http://localhost:5173/notifications
2. Thấy thông báo "Đơn hàng đã bị hủy - Cần cập nhật thông tin hoàn tiền"
3. Click button "📝 Cập nhật thông tin hoàn tiền"
4. Điền form:
   - Tên ngân hàng: VD "Vietcombank"
   - Số tài khoản: VD "1234567890"
   - Chủ tài khoản: VD "NGUYEN VAN A"
   - Upload ảnh QR (tùy chọn)
5. Click "Gửi thông tin"
6. Chờ admin chuyển tiền

### Khách hàng (COD)
1. Vào http://localhost:5173/notifications
2. Thấy thông báo "Đơn hàng đã bị hủy" với lý do
3. Không cần thao tác gì thêm

## 📝 Notes

- Chỉ có thể hủy đơn chưa giao (delivered) và chưa hủy (cancelled)
- Lý do hủy bắt buộc phải nhập (max 500 ký tự)
- Upload QR là tùy chọn, giúp admin chuyển tiền nhanh hơn
- Thông tin hoàn tiền được lưu vào notification.metadata và order.refund
- Admin có thể xem thông tin hoàn tiền trong chi tiết đơn hàng
