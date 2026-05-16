# 🎯 Hướng dẫn Admin - Quản lý Hoàn hủy đơn hàng

## 📍 Truy cập

### Menu Admin
Sau khi đăng nhập admin, vào menu bên trái:
```
Admin Panel → Hoàn hủy (icon: RollbackOutlined)
```

Hoặc truy cập trực tiếp:
```
http://localhost:5173/admin/refund-management
```

---

## 🎨 Giao diện

### 3 Tabs chính
1. **Hoàn tiền** (DollarOutlined) - Xử lý yêu cầu hoàn tiền
2. **Trả hàng** (RollbackOutlined) - Xử lý yêu cầu trả hàng
3. **Đổi hàng** (SwapOutlined) - Xử lý yêu cầu đổi hàng

### Bảng danh sách
Mỗi tab hiển thị:
- Mã đơn hàng
- Thông tin khách hàng
- Loại yêu cầu
- Trạng thái hiện tại
- Số tiền
- Ngày yêu cầu
- Các nút thao tác

---

## 🔄 Tab 1: HOÀN TIỀN

### Trạng thái
- 🟠 **refund_pending** - Chờ xử lý
- 🔵 **refund_processing** - Đang xử lý
- 🟢 **refund_completed** - Đã hoàn tiền

### Quy trình xử lý

#### Bước 1: Xem chi tiết
```
Click nút "Chi tiết" → Modal hiển thị:
- Thông tin đơn hàng đầy đủ
- Thông tin khách hàng
- Lý do hoàn tiền
- Thông tin tài khoản ngân hàng:
  * Tên ngân hàng
  * Số tài khoản
  * Tên chủ tài khoản
  * Ảnh QR code (nếu có)
- Danh sách sản phẩm
```

#### Bước 2: Xử lý yêu cầu
```
Click nút "Xử lý" → Modal xử lý:

1. Chọn trạng thái:
   - "Đang xử lý" (refund_processing)
   - "Hoàn tiền thành công" (refund_completed)
   - "Từ chối" (cancelled)

2. Nhập ghi chú (optional)

3. Click "Xác nhận"
```

#### Kết quả khi chọn "Hoàn tiền thành công"
✅ Tự động:
- Hoàn kho sản phẩm
- Hoàn voucher (nếu có)
- Gửi email thông báo cho khách
- Cập nhật trạng thái đơn hàng

---

## 📦 Tab 2: TRẢ HÀNG

### Trạng thái
- 🟠 **return_requested** - Yêu cầu trả hàng
- 🟣 **return_shipping** - Đang gửi về
- 🔵 **return_received** - Đã nhận hàng

### Quy trình xử lý

#### Bước 1: Xem chi tiết
```
Click nút "Chi tiết" → Modal hiển thị:
- Thông tin đơn hàng
- Lý do trả hàng
- Ảnh chứng minh sản phẩm lỗi (1-5 ảnh)
- Danh sách sản phẩm
```

#### Bước 2: Xử lý yêu cầu
```
Click nút "Xử lý" → Modal xử lý:

1. Chọn quyết định:
   - "Chấp nhận" (approve_refund)
   - "Từ chối" (reject)

2. Nhập ghi chú kiểm tra (optional)

3. Nếu CHẤP NHẬN, nhập thông tin tài khoản:
   - Số tài khoản
   - Tên ngân hàng
   - Tên chủ tài khoản

4. Click "Xác nhận"
```

#### Bước 3: Cập nhật vận chuyển (nếu chấp nhận)
```
Sau khi chấp nhận:

1. Click "Đang ship về"
   → Trạng thái: return_shipping
   → Gửi email thông báo khách

2. Khi hàng về đến kho:
   Click "Đã nhận hàng"
   → Trạng thái: return_received
   → Gửi email thông báo

3. Kiểm tra hàng OK:
   Chuyển sang xử lý hoàn tiền
   → Trạng thái: refund_pending
```

#### Bước 4: Hoàn tiền
```
Sau khi nhận hàng và kiểm tra OK:

1. Đơn hàng tự động chuyển sang refund_pending
2. Xử lý như Tab "Hoàn tiền"
3. Chọn "Hoàn tiền thành công"
```

#### Kết quả khi từ chối
❌ Nếu từ chối:
- Trạng thái: completed (giữ nguyên)
- Gửi email thông báo lý do từ chối
- Không hoàn kho, không hoàn tiền

---

## 🔁 Tab 3: ĐỔI HÀNG

### Trạng thái
- 🟠 **exchange_requested** - Yêu cầu đổi hàng
- 🟢 **exchange_completed** - Đã đổi hàng

### Quy trình xử lý

#### Bước 1: Xem chi tiết
```
Click nút "Chi tiết" → Modal hiển thị:
- Thông tin đơn hàng
- Lý do đổi hàng
- Ảnh chứng minh sản phẩm lỗi (1-5 ảnh)
- Danh sách sản phẩm
```

#### Bước 2: Xử lý yêu cầu
```
Click nút "Xử lý" → Modal xử lý:

1. Chọn quyết định:
   - "Chấp nhận" (approve)
   - "Từ chối" (reject)

2. Nhập ghi chú kiểm tra (optional)

3. Click "Xác nhận"
```

#### Kết quả khi chấp nhận
✅ Tự động:
- Đơn cũ: exchange_completed
- **Tạo đơn mới:**
  * Trạng thái: confirmed
  * Giá: 0đ (miễn phí)
  * Phương thức: COD
  * Sản phẩm: giống đơn cũ
- Gửi email thông báo với mã đơn mới
- Khách nhận hàng mới miễn phí
- Khách gửi hàng lỗi về (ship COD)

#### Kết quả khi từ chối
❌ Nếu từ chối:
- Trạng thái: completed (giữ nguyên)
- Gửi email thông báo lý do từ chối
- Không tạo đơn mới

---

## 💡 Tips & Best Practices

### 1. Kiểm tra kỹ trước khi xử lý
- ✅ Xem ảnh chứng minh sản phẩm lỗi
- ✅ Đọc lý do khách hàng
- ✅ Kiểm tra lịch sử đơn hàng
- ✅ Xác minh thông tin tài khoản

### 2. Ghi chú rõ ràng
```
Tốt: "Sản phẩm bị rách do lỗi sản xuất, chấp nhận trả hàng"
Tốt: "Hàng còn nguyên vẹn, đã hoàn tiền vào TK"
Tốt: "Không đủ điều kiện đổi hàng - đã qua 3 ngày"

Tránh: "OK"
Tránh: "Xử lý"
```

### 3. Xử lý nhanh chóng
- ⏱️ Hoàn tiền: trong 24h
- ⏱️ Trả hàng: xác nhận trong 24h, hoàn tiền sau khi nhận hàng
- ⏱️ Đổi hàng: xác nhận trong 24h, tạo đơn mới ngay

### 4. Giao tiếp với khách
- 📧 Email tự động được gửi mỗi khi cập nhật trạng thái
- 💬 Nếu cần thêm thông tin, liên hệ qua email/phone
- ✅ Luôn giải thích rõ lý do nếu từ chối

### 5. Kiểm tra hàng trả về
```
Checklist khi nhận hàng:
□ Sản phẩm còn nguyên vẹn?
□ Đúng sản phẩm trong đơn?
□ Có dấu hiệu sử dụng?
□ Bao bì còn đầy đủ?
□ Phụ kiện đầy đủ?

→ Nếu OK: Chấp nhận và hoàn tiền
→ Nếu không OK: Từ chối và ghi rõ lý do
```

---

## 📊 Thống kê & Báo cáo

### Badge đếm số lượng
Mỗi tab hiển thị số lượng yêu cầu đang chờ xử lý:
```
Hoàn tiền (5)  ← 5 yêu cầu chờ xử lý
Trả hàng (3)   ← 3 yêu cầu chờ xử lý
Đổi hàng (2)   ← 2 yêu cầu chờ xử lý
```

### Filter & Search
- 🔍 Tìm theo mã đơn
- 📅 Lọc theo ngày
- 🏷️ Lọc theo trạng thái
- 💰 Sắp xếp theo số tiền

---

## ⚠️ Lưu ý quan trọng

### 1. Thời hạn
- ⏰ Khách chỉ có **3 ngày** sau khi nhận hàng để yêu cầu trả/đổi
- ⏰ Hệ thống tự động kiểm tra thời hạn
- ⏰ Quá 3 ngày: Không hiển thị nút "Trả/Đổi" cho khách

### 2. Hoàn kho tự động
- ✅ Chỉ hoàn kho khi **refund_completed**
- ✅ Không hoàn kho khi từ chối
- ✅ Kiểm tra kho trước khi xử lý

### 3. Hoàn voucher tự động
- ✅ Chỉ hoàn voucher khi **refund_completed**
- ✅ Voucher được hoàn về pool để dùng lại
- ✅ UsedCount giảm đi 1

### 4. Email thông báo
- 📧 Tự động gửi mỗi khi thay đổi trạng thái
- 📧 Không cần gửi thủ công
- 📧 Kiểm tra email template nếu cần

### 5. Đơn hàng giá 0đ (Đổi hàng)
- 💰 Đơn mới có giá 0đ
- 🚚 Ship COD (miễn phí cho khách)
- 📦 Sản phẩm giống đơn cũ
- ✅ Xử lý như đơn hàng bình thường

---

## 🐛 Xử lý sự cố

### Lỗi: "Không thể xử lý hoàn tiền"
```
Nguyên nhân:
- Đơn hàng không ở trạng thái phù hợp
- Lỗi kết nối database
- Lỗi hoàn kho

Giải pháp:
1. Kiểm tra trạng thái đơn hàng
2. Refresh trang và thử lại
3. Kiểm tra logs backend
4. Liên hệ IT support
```

### Lỗi: "Không tạo được đơn mới"
```
Nguyên nhân:
- Sản phẩm đã hết hàng
- Lỗi tạo đơn hàng

Giải pháp:
1. Kiểm tra tồn kho sản phẩm
2. Thử lại sau vài phút
3. Tạo đơn thủ công nếu cần
4. Liên hệ IT support
```

### Khách không nhận được email
```
Giải pháp:
1. Kiểm tra email khách có đúng không
2. Kiểm tra spam folder
3. Gửi email thủ công
4. Kiểm tra email service backend
```

---

## 📞 Hỗ trợ

### Khi cần trợ giúp
1. Đọc lại hướng dẫn này
2. Kiểm tra backend logs
3. Liên hệ IT support
4. Báo cáo bug qua hệ thống

### Thông tin liên hệ
- 📧 Email: support@petadopt.com
- 📱 Hotline: 1900-xxxx
- 💬 Slack: #admin-support

---

## ✅ Checklist hàng ngày

### Sáng (9:00 AM)
- [ ] Kiểm tra tab "Hoàn tiền" - xử lý yêu cầu mới
- [ ] Kiểm tra tab "Trả hàng" - xử lý yêu cầu mới
- [ ] Kiểm tra tab "Đổi hàng" - xử lý yêu cầu mới
- [ ] Cập nhật trạng thái vận chuyển

### Chiều (2:00 PM)
- [ ] Kiểm tra lại các yêu cầu chưa xử lý
- [ ] Hoàn tiền cho các đơn đã nhận hàng trả về
- [ ] Gửi email nhắc nhở nếu cần

### Tối (5:00 PM)
- [ ] Tổng kết số lượng đã xử lý
- [ ] Kiểm tra email khách hàng
- [ ] Chuẩn bị cho ngày hôm sau

---

## 🎯 KPI & Mục tiêu

### Mục tiêu xử lý
- ⏱️ Hoàn tiền: < 24h
- ⏱️ Phản hồi trả/đổi hàng: < 24h
- ⏱️ Hoàn tiền sau nhận hàng: < 48h
- 😊 Tỷ lệ hài lòng: > 90%

### Theo dõi
- 📊 Số lượng yêu cầu/ngày
- 📊 Thời gian xử lý trung bình
- 📊 Tỷ lệ chấp nhận/từ chối
- 📊 Feedback từ khách hàng

---

## 🎉 Kết luận

Trang **Hoàn hủy** giúp admin:
- ✅ Quản lý tập trung tất cả yêu cầu
- ✅ Xử lý nhanh chóng và hiệu quả
- ✅ Tự động hóa hoàn kho, voucher, email
- ✅ Theo dõi trạng thái real-time
- ✅ Cải thiện trải nghiệm khách hàng

**Chúc bạn làm việc hiệu quả!** 🚀
