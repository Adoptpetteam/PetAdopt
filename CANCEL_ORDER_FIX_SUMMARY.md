# ✅ Fix: User Cancel Order Restriction (UPDATED)

## Vấn đề
User vẫn có thể hủy đơn hàng khi đơn đang ở trạng thái **"Đã xác nhận"** (confirmed) và các trạng thái khác, mặc dù yêu cầu là chỉ cho phép hủy khi đơn đang **"Chờ xác nhận"** (pending).

## Nguyên nhân
1. **Backend**: Logic cho phép hủy cả `pending` và `confirmed`
2. **Frontend**: Nút "Hủy đơn" hiển thị cho cả `pending` và `confirmed`
3. **⚠️ Root Cause**: Hệ thống có 2 bộ status fields:
   - **Old**: `status` (deprecated)
   - **New**: `orderStatus`, `paymentStatus`, `returnStatus` (recommended)
   - Code chỉ kiểm tra `status` nhưng dữ liệu thực tế dùng `orderStatus`

## Giải pháp đã áp dụng

### 1. Backend Fix ✅
**File:** `backend/src/controllers/orderController.js`

**Thay đổi trong `cancelMyOrder()`:**
```javascript
// TRƯỚC
const cancellableStatuses = ['pending', 'confirmed'];
if (!cancellableStatuses.includes(order.status)) { ... }

// SAU
const currentStatus = order.orderStatus || order.status;
if (currentStatus !== 'pending') {
  return res.status(400).json({
    message: `Không thể hủy đơn hàng ${statusText}. Chỉ có thể hủy đơn khi đang ở trạng thái "Chờ xác nhận".`
  });
}
```

### 2. Frontend Fix ✅
**File:** `frontend/src/pages/Orders.tsx`

**Thay đổi 1 - Ẩn nút trong danh sách (kiểm tra cả 2 fields):**
```typescript
// TRƯỚC
{['pending', 'confirmed'].includes(record.status) && (
  <Button>Hủy đơn</Button>
)}

// SAU (Fix lần 1 - chưa đúng)
{record.status === 'pending' && (
  <Button>Hủy đơn</Button>
)}

// SAU (Fix lần 2 - ĐÚNG)
{(record.orderStatus === 'pending' || (!record.orderStatus && record.status === 'pending')) && (
  <Button>Hủy đơn</Button>
)}
```

**Giải thích:**
- Ưu tiên kiểm tra `orderStatus` (new field)
- Nếu không có `orderStatus`, fallback về `status` (old field)
- Đảm bảo backward compatible

**Thay đổi 2 - Ẩn nút trong chi tiết:**
```typescript
// TRƯỚC
{['pending', 'confirmed'].includes(selected.status) && (
  <Button>Hủy đơn hàng</Button>
)}

// SAU
{(selected.orderStatus === 'pending' || (!selected.orderStatus && selected.status === 'pending')) && (
  <Button>Hủy đơn hàng</Button>
)}
```

**Thay đổi 3 - Validation trong handler:**
```typescript
const handleCancelOrder = (orderId: string) => {
  const order = orders.find(o => o._id === orderId);
  
  // Ưu tiên orderStatus (new), fallback về status (old)
  const currentOrderStatus = order?.orderStatus || order?.status;
  
  if (!order || currentOrderStatus !== 'pending') {
    message.error('Chỉ có thể hủy đơn hàng đang ở trạng thái "Chờ xác nhận"');
    return;
  }
  
  // ... rest of logic
}
```

## Kết quả

### ❌ Trước khi fix:
- Nút "Hủy đơn" hiển thị khi status = `pending` hoặc `confirmed`
- User có thể hủy đơn đã được admin xác nhận
- Gây rối loạn trong quy trình xử lý đơn hàng

### ✅ Sau khi fix (lần 1 - chưa đủ):
- Chỉ kiểm tra `status` field
- Không hoạt động với đơn hàng dùng `orderStatus` field
- Nút vẫn hiển thị cho đơn "Đã xác nhận"

### ✅✅ Sau khi fix (lần 2 - HOÀN CHỈNH):
- Kiểm tra cả `orderStatus` (new) và `status` (old)
- Nút "Hủy đơn" CHỈ hiển thị khi orderStatus/status = `pending`
- User KHÔNG thể hủy đơn đã được xác nhận
- Backend validation đảm bảo không thể bypass từ frontend
- Error message rõ ràng khi cố hủy đơn không hợp lệ

## Validation Layers

1. **UI Layer**: Nút "Hủy đơn" bị ẩn hoàn toàn khi orderStatus/status != 'pending'
2. **Frontend Logic**: Validation trong `handleCancelOrder()` trước khi gọi API
3. **Backend API**: Validation cuối cùng trong `cancelMyOrder()` endpoint

## Status Fields Explained

### Old System (Deprecated)
```typescript
status: "pending" | "confirmed" | "paid" | "shipping" | "completed" | "cancelled"
```

### New System (Recommended)
```typescript
orderStatus: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled"
paymentStatus: "unpaid" | "pending" | "paid" | "refunding" | "refunded" | "failed"
returnStatus: null | "requested" | "approved" | "rejected" | "shipping" | "received" | "completed"
```

### Ví dụ từ ảnh:
- **Đơn #14332480**: 
  - `orderStatus: "confirmed"` → "Đã xác nhận"
  - `paymentStatus: "paid"` → "Đã thanh toán"
  - ❌ Không được phép hủy

- **Đơn #44016380**:
  - `orderStatus: "shipping"` → "Đang giao hàng"
  - `paymentStatus: "paid"` → "Đã thanh toán"
  - ❌ Không được phép hủy

## Special Cases

### VNPay đã thanh toán
- Nếu đơn VNPay đã thanh toán (paymentStatus = 'paid') nhưng vẫn pending
- User có thể request cancel → Chuyển sang flow hoàn tiền
- Cần admin xét duyệt

### Admin
- Admin vẫn có thể hủy đơn ở bất kỳ trạng thái nào
- Sử dụng endpoint riêng: `POST /api/orders/:id/admin-cancel`

## Files Changed

1. ✅ `backend/src/controllers/orderController.js` - Backend validation
2. ✅ `frontend/src/pages/Orders.tsx` - Frontend UI & validation (UPDATED x2)
3. ✅ `USER_CANCEL_ORDER_RESTRICTION.md` - Documentation
4. ✅ `TEST_CANCEL_ORDER_RESTRICTION.md` - Test plan
5. ✅ `CANCEL_ORDER_FIX_SUMMARY.md` - This file (UPDATED)

## Testing

### Quick Test:
1. ✅ Đơn hàng với `orderStatus = 'pending'` → Nút "Hủy đơn" hiển thị
2. ✅ Đơn hàng với `orderStatus = 'confirmed'` → Nút "Hủy đơn" KHÔNG hiển thị
3. ✅ Đơn hàng với `orderStatus = 'shipping'` → Nút "Hủy đơn" KHÔNG hiển thị
4. ✅ Thử gọi API trực tiếp → Backend trả về error 400

### Regression Test:
- ✅ Đơn hàng cũ (chỉ có `status` field) vẫn hoạt động bình thường
- ✅ Đơn hàng mới (có `orderStatus` field) hoạt động đúng

## Lessons Learned

1. **Dual Status System**: Cần kiểm tra cả old và new status fields
2. **Priority**: Ưu tiên new field (`orderStatus`), fallback về old field (`status`)
3. **Testing**: Cần test với dữ liệu thực tế, không chỉ dựa vào code
4. **UI Feedback**: Quan sát UI thực tế để phát hiện vấn đề

## Date
Fixed: 2026-05-17
Updated: 2026-05-17 (Fixed orderStatus check)
