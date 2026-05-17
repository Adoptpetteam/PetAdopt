# User Order Cancellation Restriction - Implementation Summary

## Yêu cầu
User chỉ được phép hủy đơn hàng khi đơn hàng đang ở trạng thái **"Chờ xác nhận" (pending)**.

## Thay đổi đã thực hiện

### 1. Backend: `backend/src/controllers/orderController.js`

#### Function: `cancelMyOrder` (PUT /api/orders/:id/cancel)

**Thay đổi chính:**
1. **Giới hạn hủy đơn chỉ khi status = 'pending'**
   - Trước đây: Cho phép hủy khi status là `pending` hoặc `confirmed`
   - Bây giờ: CHỈ cho phép hủy khi status là `pending`

2. **Kiểm tra backward compatible**
   - Kiểm tra cả `orderStatus` (new field) và `status` (old field)
   - Đảm bảo hoạt động với cả 2 hệ thống status

3. **Thông báo lỗi rõ ràng**
   - Khi user cố hủy đơn không phải pending, hiển thị thông báo:
   - "Không thể hủy đơn hàng [trạng thái]. Chỉ có thể hủy đơn khi đang ở trạng thái 'Chờ xác nhận'."

4. **Cập nhật cả 2 status fields**
   - Khi hủy thành công, cập nhật cả `status` và `orderStatus` thành `cancelled`

### 2. Frontend: `frontend/src/pages/Orders.tsx`

#### Thay đổi UI:
1. **Ẩn nút "Hủy đơn" khi status != 'pending'**
   - Trước đây: Hiển thị nút khi `['pending', 'confirmed'].includes(record.status)`
   - Bây giờ: CHỈ hiển thị khi `record.status === 'pending'`
   - Áp dụng cho cả 2 vị trí: danh sách đơn hàng và chi tiết đơn hàng

#### Thay đổi Logic:
2. **Kiểm tra trạng thái trước khi xử lý**
   - Thêm validation ngay đầu hàm `handleCancelOrder`
   - Hiển thị lỗi nếu status không phải 'pending'
   - Ngăn chặn việc gọi API không cần thiết

3. **Cập nhật logic VNPay**
   - Chỉ kiểm tra `paymentStatus === 'paid'` thay vì kiểm tra nhiều status
   - Đảm bảo chỉ xử lý đơn VNPay đã thanh toán khi đang ở trạng thái pending

## Logic Flow

```
User clicks "Hủy đơn" button
    ↓
Frontend: Check if status === 'pending'
    ├─ NO → Button is hidden (không hiển thị nút)
    └─ YES → Show button
              ↓
User clicks button
    ↓
handleCancelOrder() validates status
    ├─ NO → Show error message
    └─ YES → Check payment method
              ├─ VNPay + paid → Request refund (admin approval)
              └─ COD or unpaid → Direct cancel
                                  ↓
Backend: cancelMyOrder() validates status
    ├─ NO → Return 400 error
    └─ YES → Process cancellation
              ├─ Restore product stock
              ├─ Release voucher (if needed)
              ├─ Update status to 'cancelled'
              ├─ Send email notification
              └─ Create notification
```

## Các trạng thái đơn hàng

### Old Status (backward compatible)
- `pending` - Chờ xác nhận ✅ **CÓ THỂ HỦY**
- `confirmed` - Đã xác nhận ❌ **KHÔNG THỂ HỦY**
- `paid` - Đã thanh toán ❌ **KHÔNG THỂ HỦY**
- `shipping` - Đang giao hàng ❌ **KHÔNG THỂ HỦY**
- `completed` - Đã hoàn thành ❌ **KHÔNG THỂ HỦY**
- `cancelled` - Đã hủy ❌ **KHÔNG THỂ HỦY**

### New Status Fields
**orderStatus:**
- `pending` - Chờ xác nhận ✅ **CÓ THỂ HỦY**
- `confirmed` - Đã xác nhận ❌ **KHÔNG THỂ HỦY**
- `shipping` - Đang giao hàng ❌ **KHÔNG THỂ HỦY**
- `delivered` - Đã giao hàng ❌ **KHÔNG THỂ HỦY**
- `cancelled` - Đã hủy ❌ **KHÔNG THỂ HỦY**

## API Response Examples

### Success Case (Status = pending)
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "status": "cancelled",
    "orderStatus": "cancelled",
    "statusHistory": [
      {
        "status": "cancelled",
        "note": "Khách hàng tự hủy đơn",
        "changedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### Error Case (Status != pending)
```json
{
  "success": false,
  "message": "Không thể hủy đơn hàng đã được xác nhận. Chỉ có thể hủy đơn khi đang ở trạng thái \"Chờ xác nhận\"."
}
```

## Testing Checklist

### Backend Tests:
- [x] User có thể hủy đơn hàng khi status = 'pending'
- [x] User KHÔNG thể hủy đơn hàng khi status = 'confirmed'
- [x] User KHÔNG thể hủy đơn hàng khi status = 'paid'
- [x] User KHÔNG thể hủy đơn hàng khi status = 'shipping'
- [x] User KHÔNG thể hủy đơn hàng khi status = 'completed'
- [x] User KHÔNG thể hủy đơn hàng khi status = 'cancelled'
- [x] Kho hàng được hoàn lại khi hủy thành công
- [x] Email thông báo được gửi khi hủy thành công
- [x] Notification được tạo khi hủy thành công
- [x] Thông báo lỗi rõ ràng khi không thể hủy

### Frontend Tests:
- [x] Nút "Hủy đơn" CHỈ hiển thị khi status = 'pending'
- [x] Nút "Hủy đơn" KHÔNG hiển thị khi status = 'confirmed'
- [x] Nút "Hủy đơn" KHÔNG hiển thị khi status = 'paid'
- [x] Nút "Hủy đơn" KHÔNG hiển thị khi status = 'shipping'
- [x] Nút "Hủy đơn" KHÔNG hiển thị khi status = 'completed'
- [x] Validation message hiển thị nếu user cố hủy đơn không hợp lệ
- [x] UI cập nhật ngay sau khi hủy thành công

## Notes

1. **Admin vẫn có thể hủy đơn ở bất kỳ trạng thái nào** thông qua endpoint `PUT /api/orders/:id/status` hoặc `POST /api/orders/:id/admin-cancel`

2. **VNPay orders:** 
   - Đơn VNPay đã thanh toán (paymentStatus = 'paid') khi đang pending sẽ yêu cầu admin xét duyệt
   - Đơn VNPay chưa thanh toán (paymentStatus = 'pending') có thể hủy trực tiếp

3. **Voucher handling:** 
   - Đơn pending chưa tăng usedCount voucher → không cần hoàn
   - Chỉ hoàn voucher nếu đơn đã confirmed trước đó (edge case)

4. **Backward compatible:** Code hỗ trợ cả old status và new status fields để đảm bảo tương thích với dữ liệu cũ

5. **UI/UX:** 
   - Nút "Hủy đơn" bị ẩn hoàn toàn thay vì disabled
   - Giảm confusion cho user
   - Validation 2 lớp: Frontend (UI) + Backend (API)

## Files Changed

1. `backend/src/controllers/orderController.js` - Backend validation logic
2. `frontend/src/pages/Orders.tsx` - Frontend UI and validation

## Date
Created: 2026-05-17
Updated: 2026-05-17 (Added frontend fixes)
