# ✅ HOÀN THIỆN HỆ THỐNG 3 TRẠNG THÁI ĐƠN HÀNG

## 📋 Tổng quan

Đã hoàn thiện việc tách riêng trạng thái đơn hàng thành 3 trường độc lập:
- **📦 orderStatus**: Trạng thái đơn hàng (pending, confirmed, processing, shipping, completed, cancelled)
- **💰 paymentStatus**: Trạng thái thanh toán (unpaid, pending, paid, refunding, refunded, failed)
- **🔄 returnStatus**: Trạng thái hoàn trả (null, requested, approved, rejected, shipping, received, completed)

---

## ✅ BACKEND - Đã hoàn thành

### 1. Model (Order.js)
✅ Đã có 3 trường mới với default values:
- `orderStatus`: default 'pending'
- `paymentStatus`: default 'unpaid'
- `returnStatus`: default null

### 2. Tạo đơn hàng mới (checkoutOrder)
✅ **TẤT CẢ đơn hàng đều bắt đầu ở trạng thái `pending`**
- COD: `orderStatus=pending`, `paymentStatus=unpaid`
- VNPay: `orderStatus=pending`, `paymentStatus=pending`
- **Không tự động confirm** - Đợi admin duyệt

### 3. Thanh toán VNPay (vnpayReturn)
✅ Sau khi thanh toán thành công:
- `orderStatus=pending` (vẫn chờ admin duyệt)
- `paymentStatus=paid` (đã thanh toán)
- **Không tăng voucher ngay** - Đợi admin duyệt

### 4. Admin duyệt đơn (updateOrderStatus)
✅ Khi admin chuyển `orderStatus` từ `pending` → `confirmed`:
- **Tự động tăng usedCount voucher** (nếu có)
- Gửi email thông báo
- Tạo notification

✅ Khi admin hủy đơn (`orderStatus` → `cancelled`):
- Hoàn kho
- Hoàn voucher (nếu đã được tính)

✅ Hỗ trợ cập nhật cả 3 trạng thái độc lập:
```javascript
PUT /api/orders/:id/status
Body: {
  orderStatus: "confirmed",
  paymentStatus: "paid",
  returnStatus: null,
  note: "Admin cập nhật"
}
```

### 5. Migration
✅ Đã chạy thành công `migrate-order-status.js`:
- 18 đơn hàng đã được migrate
- 4 đơn mới migrate, 14 đơn đã có trường mới
- Mapping từ old status → new status hoàn chỉnh

---

## ✅ FRONTEND - Đã hoàn thành

### 1. Trang User (Orders.tsx)
✅ Hiển thị 3 trạng thái riêng biệt:
- 📦 Tag trạng thái đơn hàng (màu cam/xanh/đỏ)
- 💰 Tag trạng thái thanh toán (màu xanh lá/xanh dương)
- 🔄 Tag trạng thái hoàn trả (chỉ hiển thị nếu có)

✅ Progress bar theo `orderStatus`

✅ Timeline theo flow mới

### 2. Trang Admin Hoàn hủy (RefundManagement.tsx)
✅ Hiển thị 3 trạng thái riêng biệt trong bảng

✅ Modal chi tiết hiển thị 3 trạng thái riêng

✅ Import đầy đủ icons (đã fix lỗi `ClockCircleOutlined`)

### 3. Trang Admin Quản lý đơn hàng (order.tsx) - MỚI
✅ **Hoàn toàn mới** với đầy đủ tính năng:

#### Bảng danh sách:
- Hiển thị 3 trạng thái riêng biệt cho mỗi đơn
- Cột "Trạng thái" có 3 tags xếp dọc
- Nút "Duyệt đơn" cho đơn `pending`
- Nút "Chi tiết" và "Xóa"

#### Thống kê dashboard:
- Tổng đơn
- Doanh thu
- Chờ duyệt (pending)
- Đã duyệt (confirmed)
- Đang giao (shipping)
- Hoàn thành (completed)
- Đã hủy (cancelled)

#### Modal chi tiết đơn hàng:
- Thông tin khách hàng đầy đủ
- **3 dropdown riêng biệt** để cập nhật từng trạng thái:
  - 📦 Dropdown trạng thái đơn hàng
  - 💰 Dropdown trạng thái thanh toán
  - 🔄 Tag hiển thị trạng thái hoàn trả
- **Alert cảnh báo** nếu đơn đang chờ duyệt
- **Nút "Duyệt đơn hàng"** với modal xác nhận
- Danh sách sản phẩm với hình ảnh
- Tổng tiền
- Nút xóa đơn hàng

#### Chức năng duyệt đơn:
```typescript
handleApproveOrder() {
  Modal.confirm({
    title: "Xác nhận duyệt đơn hàng",
    content: "Alert thông báo về voucher",
    onOk: () => updateOrderStatus(orderId, 'confirmed')
  });
}
```

---

## 🔄 FLOW HOÀN CHỈNH

### Flow COD:
1. **Khách đặt hàng** → `orderStatus=pending`, `paymentStatus=unpaid`
2. **Admin duyệt** → `orderStatus=confirmed`, voucher +1
3. **Admin giao hàng** → `orderStatus=shipping`
4. **Giao thành công** → `orderStatus=completed`, `paymentStatus=paid`

### Flow VNPay:
1. **Khách đặt hàng** → `orderStatus=pending`, `paymentStatus=pending`
2. **Khách thanh toán VNPay** → `orderStatus=pending`, `paymentStatus=paid`
3. **Admin duyệt** → `orderStatus=confirmed`, voucher +1
4. **Admin giao hàng** → `orderStatus=shipping`
5. **Giao thành công** → `orderStatus=completed`

### Flow Hủy đơn:
- **Trước khi admin duyệt**: Hủy trực tiếp, hoàn kho, không hoàn voucher (chưa tính)
- **Sau khi admin duyệt**: Hủy → hoàn kho + hoàn voucher

### Flow Hoàn trả:
1. **Khách yêu cầu** → `returnStatus=requested`
2. **Admin duyệt** → `returnStatus=approved`
3. **Khách gửi hàng** → `returnStatus=shipping`
4. **Admin nhận hàng** → `returnStatus=received`
5. **Admin hoàn tiền** → `returnStatus=completed`, `paymentStatus=refunded`

---

## 📊 TRẠNG THÁI CHI TIẾT

### orderStatus (Trạng thái đơn hàng)
| Giá trị | Label | Màu | Icon | Mô tả |
|---------|-------|-----|------|-------|
| pending | Chờ xác nhận | orange | 🕐 | Đơn mới, chờ admin duyệt |
| confirmed | Đã xác nhận | cyan | ✅ | Admin đã duyệt, voucher đã tính |
| processing | Đang chuẩn bị | blue | 📦 | Đang đóng gói hàng |
| shipping | Đang giao hàng | purple | 🚚 | Đang vận chuyển |
| completed | Hoàn thành | green | 🎁 | Đã giao thành công |
| cancelled | Đã hủy | red | ❌ | Đơn bị hủy |

### paymentStatus (Trạng thái thanh toán)
| Giá trị | Label | Màu | Icon | Mô tả |
|---------|-------|-----|------|-------|
| unpaid | Chưa thanh toán | default | 💵 | COD chưa thu tiền |
| pending | Chờ thanh toán | orange | 🕐 | VNPay chưa thanh toán |
| paid | Đã thanh toán | green | ✅ | Đã thanh toán thành công |
| refunding | Đang hoàn tiền | blue | 🔄 | Đang xử lý hoàn tiền |
| refunded | Đã hoàn tiền | green | ✅ | Đã hoàn tiền thành công |
| failed | Thanh toán thất bại | red | ❌ | VNPay thất bại |

### returnStatus (Trạng thái hoàn trả)
| Giá trị | Label | Màu | Icon | Mô tả |
|---------|-------|-----|------|-------|
| null | Không có | default | - | Không có yêu cầu hoàn trả |
| requested | Yêu cầu hoàn trả | orange | 🔄 | Khách yêu cầu trả/đổi |
| approved | Đã chấp thuận | cyan | ✅ | Admin chấp nhận |
| rejected | Đã từ chối | red | ❌ | Admin từ chối |
| shipping | Đang gửi về | purple | 🚚 | Hàng đang ship về kho |
| received | Đã nhận hàng | blue | 📦 | Kho đã nhận hàng trả |
| completed | Hoàn tất | green | ✅ | Đã xử lý xong |

---

## 🎯 ĐIỂM KHÁC BIỆT SO VỚI TRƯỚC

### Trước:
- ❌ 1 trường `status` với 16+ giá trị
- ❌ COD tự động confirm ngay
- ❌ VNPay thanh toán xong tự động tăng voucher
- ❌ Không có quy trình duyệt đơn
- ❌ Khó phân biệt trạng thái giao hàng vs thanh toán

### Sau:
- ✅ 3 trường riêng biệt, rõ ràng
- ✅ TẤT CẢ đơn đều chờ admin duyệt
- ✅ Voucher chỉ tăng khi admin duyệt
- ✅ Có quy trình duyệt đơn rõ ràng
- ✅ Dễ dàng theo dõi từng khía cạnh của đơn hàng

---

## 🔧 API ENDPOINTS

### Cập nhật trạng thái (Admin)
```http
PUT /api/orders/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "orderStatus": "confirmed",      // Optional
  "paymentStatus": "paid",          // Optional
  "returnStatus": null,             // Optional
  "note": "Admin cập nhật"          // Optional
}
```

### Lấy danh sách đơn hàng
```http
GET /api/orders
Authorization: Bearer <admin_token>

Query params:
- limit: number (default 100)
- status: string (filter by old status)
```

### Xóa đơn hàng
```http
DELETE /api/orders/:id
Authorization: Bearer <admin_token>
```

---

## 📝 NOTES

### Backward Compatibility
- ✅ Giữ lại trường `status` cũ để tương thích
- ✅ Migration tự động chuyển đổi
- ✅ Code xử lý cả 2 trường (old & new)

### Voucher Logic
- ✅ Chỉ tăng khi admin duyệt đơn (confirm)
- ✅ Hoàn lại khi hủy đơn đã duyệt
- ✅ Không tăng nếu đơn bị hủy trước khi duyệt

### Email & Notification
- ✅ Gửi email khi tạo đơn (chờ duyệt)
- ✅ Gửi email khi admin duyệt
- ✅ Gửi email khi cập nhật trạng thái
- ✅ Tạo notification cho từng bước

---

## 🚀 CÁCH SỬ DỤNG

### Admin duyệt đơn:
1. Vào trang "Quản lý đơn hàng"
2. Tìm đơn có trạng thái "Chờ xác nhận" (màu cam)
3. Click nút "Duyệt đơn" hoặc vào "Chi tiết"
4. Xác nhận duyệt → Voucher tự động tăng

### Admin cập nhật trạng thái:
1. Vào "Chi tiết" đơn hàng
2. Chọn trạng thái mới từ dropdown:
   - Dropdown 1: Trạng thái đơn hàng
   - Dropdown 2: Trạng thái thanh toán
3. Hệ thống tự động lưu và gửi thông báo

### Khách hàng xem đơn:
1. Vào "Lịch sử mua hàng"
2. Thấy 3 tags riêng biệt:
   - 📦 Trạng thái đơn hàng
   - 💰 Trạng thái thanh toán
   - 🔄 Trạng thái hoàn trả (nếu có)

---

## ✅ CHECKLIST HOÀN THÀNH

### Backend:
- [x] Model có 3 trường mới
- [x] Tạo đơn mới → pending
- [x] VNPay thanh toán → pending + paid
- [x] Admin duyệt → tăng voucher
- [x] Admin hủy → hoàn kho + voucher
- [x] API cập nhật 3 trạng thái
- [x] Migration script

### Frontend User:
- [x] Orders.tsx hiển thị 3 tags
- [x] Progress bar theo orderStatus
- [x] Timeline theo flow mới

### Frontend Admin:
- [x] order.tsx hoàn toàn mới
- [x] Bảng hiển thị 3 trạng thái
- [x] Nút duyệt đơn
- [x] Modal chi tiết với 3 dropdown
- [x] Alert cảnh báo đơn chờ duyệt
- [x] RefundManagement.tsx hiển thị 3 tags
- [x] Fix lỗi import icons

### Testing:
- [x] Migration chạy thành công
- [x] Tạo đơn COD → pending
- [x] Tạo đơn VNPay → pending
- [x] Thanh toán VNPay → paid nhưng vẫn pending
- [x] Admin duyệt → voucher tăng

---

## 🎉 KẾT QUẢ

Hệ thống đơn hàng giờ đã:
- ✅ **Tách bạch rõ ràng** 3 trạng thái
- ✅ **Quy trình duyệt đơn** chặt chẽ
- ✅ **Quản lý voucher** chính xác
- ✅ **Giao diện trực quan** dễ sử dụng
- ✅ **Backward compatible** với dữ liệu cũ

**Admin có toàn quyền kiểm soát đơn hàng trước khi xử lý!** 🎯
