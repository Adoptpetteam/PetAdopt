# Tính Năng Chờ Duyệt Hủy Đơn (refund_pending) - HOÀN THIỆN ✅

## Vấn Đề
User hủy đơn VNPay đã thanh toán → chuyển sang trạng thái `refund_pending` → Admin KHÔNG thấy đơn trong danh sách "Chờ duyệt hủy"

## Nguyên Nhân
1. **Backend**: Hàm `requestCancelOrder` chỉ set `status` (old field), không set `orderStatus` (new field)
2. **Backend**: Hàm `listAllOrders` chỉ filter theo `status`, không filter theo `orderStatus`
3. **Frontend User**: Thiếu tab "Chờ duyệt hủy" để user theo dõi đơn đang chờ admin xét duyệt

## Giải Pháp Đã Áp Dụng

### 1. Backend - orderController.js

#### A. Hàm `requestCancelOrder` (dòng 730-740)
**Trước:**
```javascript
const updated = await Order.findByIdAndUpdate(
  order._id,
  {
    status: 'refund_pending',
    $push: { 
      statusHistory: { 
        status: 'refund_pending', 
        note: 'Khách hàng yêu cầu hủy đơn và hoàn tiền' 
      } 
    },
  },
  { new: true }
).populate('user', 'name email');
```

**Sau:**
```javascript
const updated = await Order.findByIdAndUpdate(
  order._id,
  {
    status: 'refund_pending',
    orderStatus: 'refund_pending',           // ✅ Thêm new field
    paymentStatus: 'refunding',              // ✅ Thêm payment status
    returnStatus: 'requested',               // ✅ Thêm return status
    $push: { 
      statusHistory: { 
        status: 'refund_pending', 
        note: 'Khách hàng yêu cầu hủy đơn và hoàn tiền' 
      } 
    },
  },
  { new: true }
).populate('user', 'name email');
```

#### B. Hàm `listAllOrders` (dòng 459-478)
**Trước:**
```javascript
const filter = {};
if (status) filter.status = status;
```

**Sau:**
```javascript
const filter = {};

// Filter theo cả old status và new orderStatus để đảm bảo backward compatible
if (status) {
  filter.$or = [
    { status: status },
    { orderStatus: status }
  ];
}
```

### 2. Frontend Admin - order.tsx

#### Đã có sẵn (TASK 7):
- ✅ Config `refund_pending` trong `orderStatusConfig`
- ✅ Option "Chờ duyệt hủy" trong Select filter
- ✅ Badge hiển thị số lượng đơn chờ duyệt

```typescript
const orderStatusConfig = {
  // ...
  refund_pending: { 
    color: "volcano", 
    label: "Chờ duyệt hủy", 
    icon: <StopOutlined />, 
    desc: "Khách yêu cầu hủy đơn, chờ admin xét duyệt" 
  },
};

// Select filter
<Select.Option value="refund_pending">
  <Badge status="processing" />
  Chờ duyệt hủy
</Select.Option>
```

### 3. Frontend User - Orders.tsx

#### Thêm tab "Chờ duyệt hủy"
```typescript
const TAB_ITEMS = [
  { key: "all",            label: "Tất cả" },
  { key: "pending",        label: "Chờ xử lý" },
  { key: "confirmed",      label: "Đã xác nhận" },
  { key: "paid",           label: "Đã thanh toán" },
  { key: "shipping",       label: "Đang giao" },
  { key: "completed",      label: "Hoàn thành" },
  { key: "refund_pending", label: "Chờ duyệt hủy" },  // ✅ Thêm tab mới
  { key: "cancelled",      label: "Đã hủy" },
];
```

## Luồng Hoạt Động Hoàn Chỉnh

### User hủy đơn VNPay đã thanh toán:

1. **User**: Click "Hủy đơn" trên đơn VNPay đã thanh toán (status = pending, paymentStatus = paid)
2. **Frontend**: Hiển thị modal xác nhận "Gửi yêu cầu hủy đơn"
3. **Frontend**: Gọi API `PUT /orders/me/:id/request-cancel`
4. **Backend**: 
   - Set `status = 'refund_pending'`
   - Set `orderStatus = 'refund_pending'`
   - Set `paymentStatus = 'refunding'`
   - Set `returnStatus = 'requested'`
5. **User**: Thấy đơn chuyển sang tab "Chờ duyệt hủy" với badge màu cam
6. **Admin**: Vào trang Orders → Filter "Chờ duyệt hủy" → Thấy đơn cần xét duyệt
7. **Admin**: Xét duyệt → Chấp nhận hoặc từ chối

## Kiểm Tra

### Backend
```bash
# Test API filter refund_pending
GET /api/orders?status=refund_pending
Authorization: Bearer <admin_token>

# Kết quả: Trả về tất cả đơn có status='refund_pending' HOẶC orderStatus='refund_pending'
```

### Frontend Admin
1. Vào trang Admin Orders
2. Click dropdown filter → Chọn "Chờ duyệt hủy"
3. Kết quả: Hiển thị tất cả đơn đang chờ admin xét duyệt hủy

### Frontend User
1. User hủy đơn VNPay đã thanh toán
2. Vào trang "Lịch sử mua hàng"
3. Click tab "Chờ duyệt hủy"
4. Kết quả: Thấy đơn vừa hủy với trạng thái "Chờ duyệt hủy"

## Files Đã Sửa

### Backend
- `backend/src/controllers/orderController.js`
  - Hàm `requestCancelOrder` (dòng 730-740)
  - Hàm `listAllOrders` (dòng 459-478)

### Frontend
- `frontend/src/pages/Admin/order.tsx` (đã có sẵn từ TASK 7)
- `frontend/src/pages/Orders.tsx` (thêm tab "Chờ duyệt hủy")

## Kết Quả

✅ User hủy đơn VNPay → Chuyển sang `refund_pending`
✅ Admin filter "Chờ duyệt hủy" → Thấy đơn cần xét duyệt
✅ User vào tab "Chờ duyệt hủy" → Thấy đơn đang chờ admin duyệt
✅ Backward compatible với cả old status và new orderStatus
✅ Hoàn thiện 100%

---
**Ngày hoàn thành**: 17/05/2026
**Status**: ✅ DONE
