# 🔄 Order Status Refactoring - Complete Guide

## 📋 Tổng quan

Đã refactor hệ thống trạng thái đơn hàng từ **1 field** sang **3 fields riêng biệt** để dễ quản lý và mở rộng.

---

## ✅ Đã hoàn thành

### 1. **Update Order Model** ✅
- Thêm 3 fields mới: `orderStatus`, `paymentStatus`, `returnStatus`
- Giữ lại field `status` cũ để backward compatible
- Thêm indexes cho performance

### 2. **Migration Script** ✅
- File: `backend/migrate-order-status.js`
- Đã chạy thành công: 17/17 orders migrated
- Tất cả orders đã có 3 trạng thái mới

### 3. **Helper Functions** ✅
- File: `backend/src/utils/orderStatusHelper.js`
- Cung cấp utilities để làm việc với 3 trạng thái
- Config cho UI (colors, icons, labels)

---

## 🎯 Cấu trúc mới

### Before (1 field) ❌
```javascript
{
  status: "paid" | "shipping" | "refund_pending" | ...
}
```

### After (3 fields) ✅
```javascript
{
  // Trạng thái đơn hàng
  orderStatus: "pending" | "confirmed" | "processing" | "shipping" | "completed" | "cancelled",
  
  // Trạng thái thanh toán
  paymentStatus: "unpaid" | "pending" | "paid" | "refunding" | "refunded" | "failed",
  
  // Trạng thái hoàn trả
  returnStatus: null | "requested" | "approved" | "rejected" | "shipping" | "received" | "completed"
}
```

---

## 📊 Chi tiết từng trạng thái

### A. Order Status (Trạng thái đơn hàng)

| Status | Label | Màu | Mô tả |
|--------|-------|-----|-------|
| `pending` | Chờ xác nhận | Orange | Đơn mới tạo, chờ admin xác nhận |
| `confirmed` | Đã xác nhận | Cyan | Admin đã xác nhận đơn |
| `processing` | Đang chuẩn bị | Blue | Đang đóng gói hàng |
| `shipping` | Đang giao hàng | Purple | Đang vận chuyển |
| `completed` | Hoàn thành | Green | Đã giao thành công |
| `cancelled` | Đã hủy | Red | Đơn bị hủy |

### B. Payment Status (Trạng thái thanh toán)

| Status | Label | Màu | Mô tả |
|--------|-------|-----|-------|
| `unpaid` | Chưa thanh toán | Default | COD chưa thu tiền |
| `pending` | Chờ thanh toán | Orange | VNPay đang chờ |
| `paid` | Đã thanh toán | Green | Đã thanh toán thành công |
| `refunding` | Đang hoàn tiền | Blue | Đang xử lý hoàn tiền |
| `refunded` | Đã hoàn tiền | Green | Đã hoàn tiền xong |
| `failed` | Thanh toán thất bại | Red | VNPay thất bại |

### C. Return Status (Trạng thái hoàn trả)

| Status | Label | Màu | Mô tả |
|--------|-------|-----|-------|
| `null` | Không có yêu cầu | Default | Không có vấn đề |
| `requested` | Yêu cầu hoàn trả | Orange | Khách yêu cầu |
| `approved` | Đã chấp thuận | Cyan | Admin chấp thuận |
| `rejected` | Đã từ chối | Red | Admin từ chối |
| `shipping` | Đang gửi về | Purple | Hàng đang về kho |
| `received` | Đã nhận hàng | Blue | Kho đã nhận |
| `completed` | Hoàn tất | Green | Đã xử lý xong |

---

## 💡 Ví dụ sử dụng

### Case 1: Đơn COD mới tạo
```javascript
{
  orderStatus: "pending",      // Chờ xác nhận
  paymentStatus: "unpaid",     // Chưa thanh toán
  returnStatus: null           // Không có vấn đề
}
```

### Case 2: Đơn VNPay đã thanh toán, đang giao
```javascript
{
  orderStatus: "shipping",     // Đang giao
  paymentStatus: "paid",       // Đã thanh toán
  returnStatus: null
}
```

### Case 3: Khách yêu cầu hủy đơn VNPay
```javascript
{
  orderStatus: "cancelled",    // Đã hủy
  paymentStatus: "refunding",  // Đang hoàn tiền
  returnStatus: "requested"    // Yêu cầu hoàn
}
```

### Case 4: Đã hoàn tiền xong
```javascript
{
  orderStatus: "cancelled",
  paymentStatus: "refunded",   // Đã hoàn tiền
  returnStatus: "completed"    // Hoàn tất
}
```

### Case 5: Khách trả hàng sau khi nhận
```javascript
{
  orderStatus: "completed",    // Đơn đã giao
  paymentStatus: "refunding",  // Đang hoàn tiền
  returnStatus: "shipping"     // Hàng đang về
}
```

---

## 🔧 Helper Functions

### Import
```javascript
const {
  getOrderStatusConfig,
  getPaymentStatusConfig,
  getReturnStatusConfig,
  canCancelOrder,
  canRequestReturn,
  convertOldStatusToNew,
  convertNewStatusToOld,
  getOrderProgress,
  getProgressColor
} = require('./utils/orderStatusHelper');
```

### Sử dụng

#### 1. Lấy config cho UI
```javascript
const orderConfig = getOrderStatusConfig(order.orderStatus);
// { label: 'Đang giao hàng', color: 'purple', icon: 'truck', ... }

const paymentConfig = getPaymentStatusConfig(order.paymentStatus);
// { label: 'Đã thanh toán', color: 'green', icon: 'check', ... }

const returnConfig = getReturnStatusConfig(order.returnStatus);
// { label: 'Yêu cầu hoàn trả', color: 'orange', icon: 'rollback', ... }
```

#### 2. Kiểm tra quyền
```javascript
// Có thể hủy đơn không?
if (canCancelOrder(order)) {
  // Show cancel button
}

// Có thể yêu cầu hoàn trả không?
if (canRequestReturn(order)) {
  // Show return button
}
```

#### 3. Chuyển đổi status
```javascript
// Old → New
const newStatus = convertOldStatusToNew('paid', 'vnpay');
// { orderStatus: 'confirmed', paymentStatus: 'paid', returnStatus: null }

// New → Old (để backward compatible)
const oldStatus = convertNewStatusToOld('shipping', 'paid', null);
// 'shipping'
```

#### 4. Progress bar
```javascript
const progress = getOrderProgress(order);  // 0-100
const color = getProgressColor(order);     // 'blue', 'green', 'red'
```

---

## 🚀 Migration Results

```
📊 Found 17 orders to migrate

✅ Migrated: 17 orders
⏭️  Skipped: 0 orders
❌ Errors: 0 orders

🎉 Migration completed successfully!
```

### Breakdown:
- `paid` → `orderStatus=confirmed, paymentStatus=paid` (7 orders)
- `pending` → `orderStatus=pending, paymentStatus=unpaid` (3 orders)
- `cancelled` → `orderStatus=cancelled, paymentStatus=pending` (4 orders)
- `refund_completed` → `orderStatus=cancelled, paymentStatus=refunded, returnStatus=completed` (3 orders)

---

## 📝 Next Steps

### 1. Update Controllers (TODO)
Sửa các controller để sử dụng 3 trạng thái mới:

```javascript
// ❌ Old
order.status = 'paid';

// ✅ New
order.orderStatus = 'confirmed';
order.paymentStatus = 'paid';
```

### 2. Update Frontend (TODO)
Hiển thị 3 trạng thái riêng biệt:

```tsx
<Tag color={getOrderStatusConfig(order.orderStatus).color}>
  {getOrderStatusConfig(order.orderStatus).label}
</Tag>

<Tag color={getPaymentStatusConfig(order.paymentStatus).color}>
  {getPaymentStatusConfig(order.paymentStatus).label}
</Tag>

{order.returnStatus && (
  <Tag color={getReturnStatusConfig(order.returnStatus).color}>
    {getReturnStatusConfig(order.returnStatus).label}
  </Tag>
)}
```

### 3. Update API Responses (TODO)
Trả về cả 3 trạng thái trong API:

```javascript
res.json({
  success: true,
  data: {
    ...order,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    returnStatus: order.returnStatus,
    // Giữ lại status cũ để backward compatible
    status: convertNewStatusToOld(order.orderStatus, order.paymentStatus, order.returnStatus)
  }
});
```

### 4. Remove Old Status Field (LATER)
Sau khi confirm mọi thứ hoạt động tốt (1-2 tháng), có thể xóa field `status` cũ:

```javascript
// Remove from model
// Remove from controllers
// Remove from frontend
```

---

## 🎨 UI Design Suggestions

### Order Detail Page
```
┌─────────────────────────────────────────┐
│ Đơn hàng #ABC123                        │
├─────────────────────────────────────────┤
│ 📦 Trạng thái đơn:  [Đang giao hàng]   │
│ 💰 Thanh toán:      [Đã thanh toán]    │
│ 🔄 Hoàn trả:        [Không có]          │
├─────────────────────────────────────────┤
│ Progress: [████████░░] 75%              │
└─────────────────────────────────────────┘
```

### Order List
```
┌──────────────────────────────────────────────────┐
│ #123 | Áo thun | 200,000đ                        │
│ 📦 Đang giao | 💰 Đã TT | 🔄 Không có           │
├──────────────────────────────────────────────────┤
│ #124 | Quần jean | 500,000đ                      │
│ 📦 Hoàn thành | 💰 Đã TT | 🔄 Yêu cầu hoàn trả  │
└──────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Issue 1: Old status still showing
**Solution:** Đảm bảo đã chạy migration script

### Issue 2: New fields are null
**Solution:** Check migration logs, re-run if needed

### Issue 3: Frontend not showing new statuses
**Solution:** Update frontend to use new fields

---

## 📚 Files Changed

1. ✅ `backend/src/models/Order.js` - Added 3 new fields
2. ✅ `backend/migrate-order-status.js` - Migration script
3. ✅ `backend/src/utils/orderStatusHelper.js` - Helper functions
4. ✅ `ORDER_STATUS_REFACTOR.md` - This documentation

---

## 🎯 Benefits

### Before ❌
- 1 field với 16+ giá trị
- Khó hiểu, khó maintain
- Không rõ ràng
- Khó mở rộng

### After ✅
- 3 fields riêng biệt
- Rõ ràng, dễ hiểu
- Dễ query, dễ filter
- Dễ mở rộng
- Backward compatible

---

## 🚀 Conclusion

**Hệ thống trạng thái đơn hàng đã được refactor thành công!**

- ✅ Model updated
- ✅ Migration completed (17/17 orders)
- ✅ Helper functions created
- ✅ Documentation complete

**Next:** Update controllers và frontend để sử dụng 3 trạng thái mới! 🎉
