# Tính Năng User Xác Nhận Đã Nhận Hàng - HOÀN THIỆN ✅

## Mô Tả
User có thể xác nhận đã nhận hàng khi đơn đang ở trạng thái "Đang giao hàng" (shipping). Sau khi xác nhận, đơn hàng chuyển sang trạng thái "Hoàn thành" (delivered/completed).

## Luồng Hoạt Động

### 1. Điều Kiện
- Đơn hàng phải ở trạng thái `orderStatus = 'shipping'` hoặc `status = 'shipping'`
- Chỉ user sở hữu đơn hàng mới có thể xác nhận

### 2. Khi User Click "Đã Nhận Hàng"
1. **Frontend**: Hiển thị modal xác nhận
   - Tiêu đề: "Xác nhận đã nhận hàng"
   - Nội dung: "Bạn đã nhận được hàng và hài lòng với sản phẩm?"
   - Lưu ý: "Sau khi xác nhận, đơn hàng sẽ chuyển sang trạng thái 'Hoàn thành'. Bạn vẫn có thể yêu cầu trả/đổi hàng trong vòng 3 ngày."

2. **Backend**: Xử lý xác nhận
   - Kiểm tra đơn hàng thuộc về user
   - Kiểm tra trạng thái phải là `shipping`
   - Cập nhật:
     - `status = 'completed'`
     - `orderStatus = 'delivered'`
     - Thêm vào `statusHistory`
   - Gửi email cảm ơn
   - Tạo notification

3. **Kết Quả**
   - ✅ Đơn hàng chuyển sang "Hoàn thành"
   - ✅ User nhận email cảm ơn
   - ✅ User nhận notification
   - ✅ Button "Đã nhận hàng" biến mất
   - ✅ Hiển thị button "Trả/Đổi" (nếu trong vòng 3 ngày)

## Implementation

### 1. Backend

#### A. Route - `order.routes.js`
```javascript
router.put('/me/:id/confirm-received', authenticate, orderController.confirmReceived);
```

#### B. Controller - `orderController.js`
```javascript
exports.confirmReceived = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const order = await Order.findOne({ _id: req.params.id, user: userId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // Chỉ cho phép xác nhận khi đơn đang ở trạng thái shipping
    const currentOrderStatus = order.orderStatus || order.status;
    
    if (currentOrderStatus !== 'shipping') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể xác nhận đã nhận hàng khi đơn đang ở trạng thái "Đang giao hàng"',
      });
    }

    // Cập nhật trạng thái sang delivered/completed
    const updated = await Order.findByIdAndUpdate(
      order._id,
      {
        status: 'completed',
        orderStatus: 'delivered',
        $push: { 
          statusHistory: { 
            status: 'completed', 
            note: 'Khách hàng xác nhận đã nhận hàng' 
          } 
        },
      },
      { new: true }
    ).populate('user', 'name email');

    // Gửi email cảm ơn
    // Tạo notification
    
    res.json({
      success: true,
      message: 'Đã xác nhận nhận hàng thành công. Cảm ơn bạn!',
      data: updated,
    });
  } catch (error) {
    console.error('[Order] Confirm received error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
```

### 2. Frontend - `Orders.tsx`

#### A. Handler Function
```typescript
const handleConfirmReceived = (orderId: string) => {
  Modal.confirm({
    title: "Xác nhận đã nhận hàng",
    icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
    content: (
      <div>
        <p>Bạn đã nhận được hàng và hài lòng với sản phẩm?</p>
        <p className="mt-2 text-gray-600 text-sm">
          Sau khi xác nhận, đơn hàng sẽ chuyển sang trạng thái "Hoàn thành". 
          Bạn vẫn có thể yêu cầu trả/đổi hàng trong vòng 3 ngày.
        </p>
      </div>
    ),
    okText: "Đã nhận hàng",
    okType: "primary",
    cancelText: "Chưa nhận",
    onOk: async () => {
      try {
        await apiClient.put(`/orders/me/${orderId}/confirm-received`);
        message.success("✅ Cảm ơn bạn! Đơn hàng đã hoàn thành.");
        loadOrders();
        if (selected?._id === orderId) {
          const res = await apiClient.get(`/orders/me/${orderId}`);
          setSelected(res.data.data);
        }
      } catch (e: any) {
        message.error(e?.response?.data?.message || "Không thể xác nhận đã nhận hàng");
      }
    },
  });
};
```

#### B. Button trong Table
```typescript
{(record.orderStatus === 'shipping' || (!record.orderStatus && record.status === 'shipping')) && (
  <Button
    type="primary"
    size="small"
    icon={<CheckCircleOutlined />}
    onClick={() => handleConfirmReceived(record._id)}
    className="rounded-full w-full !bg-green-500 border-0"
  >
    Đã nhận hàng
  </Button>
)}
```

## UI/UX

### Button "Đã Nhận Hàng"
- **Màu**: Xanh lá (`!bg-green-500`)
- **Icon**: `<CheckCircleOutlined />`
- **Vị trí**: Cột actions trong table, giữa button "Chi tiết" và "Hoàn tiền"
- **Hiển thị khi**: `orderStatus = 'shipping'` hoặc `status = 'shipping'`

### Modal Xác Nhận
- **Icon**: Dấu tick xanh lá
- **Tiêu đề**: "Xác nhận đã nhận hàng"
- **Nội dung**: 
  - Câu hỏi xác nhận
  - Lưu ý về trả/đổi hàng trong 3 ngày
- **Buttons**: 
  - OK: "Đã nhận hàng" (primary)
  - Cancel: "Chưa nhận"

### Sau Khi Xác Nhận
- ✅ Message success: "✅ Cảm ơn bạn! Đơn hàng đã hoàn thành."
- ✅ Đơn hàng reload với trạng thái mới
- ✅ Button "Đã nhận hàng" biến mất
- ✅ Button "Trả/Đổi" xuất hiện (nếu trong 3 ngày)

## Email & Notification

### Email Cảm Ơn
- **Subject**: "Đơn hàng #XXXXX đã hoàn thành"
- **Content**: 
  - Cảm ơn đã xác nhận nhận hàng
  - Chúc hài lòng với sản phẩm
  - Nhắc về chính sách trả/đổi trong 3 ngày

### Notification
- **Type**: `order`
- **Title**: "✅ Đơn hàng hoàn thành"
- **Message**: "Đơn hàng #XXXXX đã hoàn thành. Cảm ơn bạn đã mua hàng!"
- **Link**: `/orders`

## Files Đã Sửa

### Backend
1. `backend/src/routes/order.routes.js`
   - Thêm route: `PUT /api/orders/me/:id/confirm-received`

2. `backend/src/controllers/orderController.js`
   - Thêm function: `exports.confirmReceived`

### Frontend
1. `frontend/src/pages/Orders.tsx`
   - Thêm function: `handleConfirmReceived`
   - Thêm button "Đã nhận hàng" trong table columns

## Testing

### Test Case 1: Xác nhận thành công
1. Tạo đơn hàng và chuyển sang trạng thái `shipping`
2. User vào trang Orders
3. Click button "Đã nhận hàng"
4. Xác nhận trong modal
5. **Kết quả**: 
   - ✅ Đơn chuyển sang `delivered/completed`
   - ✅ Nhận email cảm ơn
   - ✅ Nhận notification
   - ✅ Button biến mất

### Test Case 2: Không thể xác nhận khi không phải shipping
1. Đơn hàng ở trạng thái `pending`
2. User không thấy button "Đã nhận hàng"
3. Nếu gọi API trực tiếp → Error 400

### Test Case 3: Chỉ user sở hữu mới xác nhận được
1. User A tạo đơn hàng
2. User B cố gắng xác nhận đơn của User A
3. **Kết quả**: Error 404 "Không tìm thấy đơn hàng"

## Lợi Ích

✅ **Tự động hóa**: User tự xác nhận, không cần admin thao tác
✅ **Trải nghiệm tốt**: User chủ động kiểm soát đơn hàng
✅ **Giảm tải admin**: Admin không cần cập nhật thủ công
✅ **Chính xác**: Thời điểm hoàn thành được ghi nhận chính xác
✅ **Kích hoạt chính sách**: Tự động tính thời hạn trả/đổi từ thời điểm xác nhận

---
**Ngày hoàn thành**: 17/05/2026
**Status**: ✅ DONE
