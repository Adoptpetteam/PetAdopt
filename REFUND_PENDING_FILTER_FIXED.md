# Admin Refund Pending Filter - Fixed ✅

## Vấn đề
Sau khi user hủy đơn VNPay đã thanh toán, admin không thấy đơn hàng trong filter "Chờ duyệt hủy" (refund_pending).

## Nguyên nhân
1. **Backend `requestCancelOrder`**: Chỉ set `status` (old field), không set `orderStatus` (new field)
2. **Backend `listAllOrders`**: Chỉ filter theo `status`, không filter theo `orderStatus`
3. **Frontend**: Hiển thị dựa trên `orderStatus` hoặc `status`, nhưng backend không đồng bộ

## Giải pháp

### 1. Fix `requestCancelOrder` - Set cả old và new status fields
**File**: `backend/src/controllers/orderController.js`

```javascript
// Chuyển sang refund_pending (set cả old và new status fields)
const updated = await Order.findByIdAndUpdate(
  order._id,
  {
    status: 'refund_pending',           // ✅ Old field
    orderStatus: 'refund_pending',      // ✅ New field
    paymentStatus: 'refunding',         // ✅ Payment status
    returnStatus: 'requested',          // ✅ Return status
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

### 2. Fix `listAllOrders` - Filter theo cả 2 fields
**File**: `backend/src/controllers/orderController.js`

```javascript
exports.listAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    
    // Filter theo cả old status và new orderStatus để đảm bảo backward compatible
    if (status) {
      filter.$or = [
        { status: status },
        { orderStatus: status }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
```

## Flow hoàn chỉnh

### User hủy đơn VNPay đã thanh toán:
1. User click "Hủy đơn" → Frontend gọi `PUT /orders/me/:id/request-cancel`
2. Backend set:
   - `status: 'refund_pending'`
   - `orderStatus: 'refund_pending'`
   - `paymentStatus: 'refunding'`
   - `returnStatus: 'requested'`
3. Admin vào trang Orders → Chọn filter "Chờ duyệt hủy"
4. Frontend gọi `GET /orders?status=refund_pending`
5. Backend filter theo `$or: [{ status: 'refund_pending' }, { orderStatus: 'refund_pending' }]`
6. Admin thấy đơn hàng cần duyệt ✅

## Frontend đã có sẵn
**File**: `frontend/src/pages/Admin/order.tsx`

```tsx
<Select.Option value="refund_pending">
  <Badge status="processing" />
  Chờ duyệt hủy
</Select.Option>
```

## Kết quả
✅ User hủy đơn VNPay → Status chuyển sang `refund_pending`
✅ Admin filter "Chờ duyệt hủy" → Thấy đơn hàng
✅ Backward compatible với cả old và new status fields
✅ Đồng bộ giữa frontend và backend

---
**Status**: ✅ HOÀN THÀNH
**Date**: May 17, 2026
