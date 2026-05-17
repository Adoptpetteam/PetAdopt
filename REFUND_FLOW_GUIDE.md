# Hướng dẫn luồng Hoàn tiền Admin hủy đơn

## 🔄 Luồng hoàn tiền VNPay

### Bước 1: Admin hủy đơn
1. Admin vào `/admin/order`
2. Click button "Hủy đơn" (màu đỏ)
3. Nhập lý do hủy (bắt buộc)
4. Click "Xác nhận hủy"

**Backend xử lý:**
- API: `POST /api/orders/:id/admin-cancel`
- Tạo `RefundRequest` với status = `awaiting_info`
- Tạo `Notification` type = `order_refund_required`
- Hoàn kho + hoàn voucher

### Bước 2: Khách nhận thông báo
1. Khách vào `/notifications`
2. Thấy notification "Đơn hàng đã bị hủy - Cần cập nhật thông tin hoàn tiền"
3. Click button "📝 Cập nhật thông tin hoàn tiền"

### Bước 3: Khách điền form
1. Modal `RefundInfoModal` hiện ra
2. Khách điền:
   - Tên ngân hàng
   - Số tài khoản
   - Chủ tài khoản
   - Upload QR (tùy chọn)
3. Click "Gửi thông tin"

**Backend xử lý:**
- API: `PUT /api/refunds/me/:id/submit-bank-info`
- Cập nhật `RefundRequest.bankInfo`
- **Chuyển status: `awaiting_info` → `pending`** ✅
- Cập nhật notification: `metadata.submitted = true`

### Bước 4: Admin xử lý hoàn tiền
1. Admin vào `/admin/refund-management`
2. Tab "Hoàn tiền" → Filter "Chờ xử lý" (status = `pending`)
3. Thấy yêu cầu mới với thông tin ngân hàng đã điền
4. Click "Xử lý"
5. Nhập:
   - Mã chứng từ chuyển khoản (bắt buộc)
   - Upload ảnh bill chuyển khoản
   - Ghi chú (tùy chọn)
6. Click "Đã chuyển xong"

**Backend xử lý:**
- API: `PUT /api/refunds/admin/:id/process`
- Chuyển status: `pending` → `completed`
- Cập nhật Order.paymentStatus = `refunded`
- Tạo notification cho khách với ảnh bill

### Bước 5: Khách nhận thông báo hoàn tiền thành công
1. Khách vào `/notifications`
2. Thấy notification "✅ Hoàn tiền thành công"
3. Xem ảnh bill chuyển khoản
4. Xem mã giao dịch

## 🔍 Cách kiểm tra

### Kiểm tra RefundRequest đã được tạo
```bash
# Vào MongoDB
use petadopt
db.refundrequests.find().pretty()
```

### Kiểm tra status sau khi khách submit
```bash
db.refundrequests.find({ status: "pending" }).pretty()
```

### Kiểm tra notification
```bash
db.notifications.find({ type: "order_refund_required" }).pretty()
```

## ⚠️ Các vấn đề thường gặp

### 1. Admin không thấy yêu cầu hoàn tiền
**Nguyên nhân:** Filter sai status

**Giải pháp:**
- Đảm bảo filter = "Chờ xử lý" hoặc "Tất cả trạng thái"
- Kiểm tra status trong database: phải là `pending` sau khi khách submit

### 2. Khách submit form nhưng không chuyển sang pending
**Nguyên nhân:** API `submit-bank-info` không cập nhật status

**Giải pháp:**
- Kiểm tra backend log
- Đảm bảo API trả về success
- Kiểm tra database xem status có đổi không

### 3. Notification không hiển thị form
**Nguyên nhân:** `metadata.requiresRefundInfo` không được set

**Giải pháp:**
- Kiểm tra notification trong database
- Đảm bảo có field `metadata.requiresRefundInfo = true`

## 📊 Các trạng thái RefundRequest

| Status | Mô tả | Ai thấy |
|--------|-------|---------|
| `awaiting_info` | Chờ khách nhập thông tin NH | Khách thấy form |
| `pending` | Đã nhập info, chờ admin xử lý | Admin thấy trong "Chờ xử lý" |
| `re_enter_info` | Admin yêu cầu nhập lại STK | Khách thấy form lại |
| `processing` | Admin đang chuyển khoản | Admin đang xử lý |
| `completed` | Đã hoàn tiền xong | Cả 2 thấy |
| `rejected` | Admin từ chối | Cả 2 thấy |

## 🎯 Checklist hoàn chỉnh

- [ ] Admin hủy đơn VNPay → Tạo RefundRequest
- [ ] Khách nhận notification với button "Cập nhật thông tin"
- [ ] Khách click button → Modal form hiện ra
- [ ] Khách điền form → Submit thành công
- [ ] **Status chuyển từ `awaiting_info` → `pending`** ✅
- [ ] Admin vào `/admin/refund-management`
- [ ] Admin filter "Chờ xử lý" → Thấy yêu cầu mới
- [ ] Admin xử lý → Chuyển khoản → Upload bill
- [ ] Status chuyển `pending` → `completed`
- [ ] Khách nhận notification với ảnh bill

## 🐛 Debug

### Xem log backend khi khách submit
```bash
# Terminal backend
# Sẽ thấy log:
[Refund] Submit bank info: <refundId>
[Refund] Status changed: awaiting_info → pending
```

### Xem log frontend khi admin load
```bash
# Console browser
# Sẽ thấy:
GET /api/refunds/admin?status=pending
Response: { data: [...] }
```

### Test API trực tiếp
```bash
# Get admin token
TOKEN="your_admin_token"

# List refunds
curl http://localhost:5000/api/refunds/admin \
  -H "Authorization: Bearer $TOKEN"

# Filter pending
curl "http://localhost:5000/api/refunds/admin?status=pending" \
  -H "Authorization: Bearer $TOKEN"
```

## ✅ Kết luận

Luồng hoàn tiền hoạt động đúng khi:
1. ✅ RefundRequest được tạo với status = `awaiting_info`
2. ✅ Khách submit form → status chuyển sang `pending`
3. ✅ Admin thấy trong tab "Chờ xử lý"
4. ✅ Admin xử lý → status chuyển sang `completed`
5. ✅ Khách nhận notification với bill

Nếu bất kỳ bước nào không hoạt động, kiểm tra:
- Backend log
- Database (RefundRequest, Notification)
- Frontend console
- API response
