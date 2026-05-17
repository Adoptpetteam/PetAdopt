# Form Hoàn Tiền Khi Admin Duyệt Hủy Đơn - HOÀN THIỆN ✅

## Vấn Đề
User hủy đơn VNPay đã thanh toán → Đơn chuyển sang `refund_pending` → Admin duyệt (chuyển sang `cancelled`) → **THIẾU** form hoàn tiền gửi cho user

## Nguyên Nhân
Hàm `updateOrderStatus` chỉ xử lý gửi form khi admin **trực tiếp hủy** đơn đang `paid/confirmed/shipping`, KHÔNG xử lý khi admin **duyệt đơn** đang ở trạng thái `refund_pending`.

## Giải Pháp

### Logic Mới Trong `updateOrderStatus`

Khi admin chuyển đơn từ bất kỳ trạng thái nào → `cancelled`:

1. **Kiểm tra 2 điều kiện**:
   - Đơn có phải VNPay đã thanh toán không? (`paymentMethod = 'vnpay'` && `paymentStatus = 'paid'`)
   - Đơn có đang ở trạng thái `refund_pending` không? (user đã yêu cầu hủy trước đó)

2. **Nếu là VNPay đã thanh toán**:
   - Tạo `RefundRequest` (nếu chưa có)
   - Set `status = 'awaiting_info'`
   - Gửi email form hoàn tiền
   - Tạo notification với link đến form

3. **Phân biệt 2 trường hợp**:
   - **Trường hợp 1**: Admin duyệt đơn `refund_pending` (user đã yêu cầu hủy)
     - Title: "✅ Yêu cầu hủy đơn #XXXXX đã được duyệt"
     - Message: "Yêu cầu hủy đơn của bạn đã được chấp thuận. Vui lòng cập nhật thông tin ngân hàng..."
   
   - **Trường hợp 2**: Admin trực tiếp hủy đơn
     - Title: "Đơn hàng #XXXXX đã bị hủy - Cần cập nhật thông tin hoàn tiền"
     - Message: "Lý do hủy: [lý do]. Đơn hàng của bạn đã được thanh toán qua VNPay..."

## Code Implementation

### Backend - `orderController.js` (dòng 550-650)

```javascript
// Hoàn kho và voucher khi admin hủy đơn
const isCancelling = (orderStatus === 'cancelled' || status === 'cancelled') && 
                     (order.orderStatus !== 'cancelled' && order.status !== 'cancelled');

if (isCancelling) {
  // Hoàn kho
  await Product.bulkWrite(...);
  
  // Hoàn voucher nếu cần
  if (voucherWasUsed) await releaseVoucher(order);
  
  // ===== XỬ LÝ HỦY ĐƠN VNPAY ĐÃ THANH TOÁN =====
  const isVNPayPaid = order.paymentMethod === 'vnpay' && 
                      (order.paymentStatus === 'paid' || order.status === 'paid');
  
  // Kiểm tra xem đơn có đang ở trạng thái refund_pending không
  const wasRefundPending = order.status === 'refund_pending' || 
                           order.orderStatus === 'refund_pending';
  
  if (isVNPayPaid) {
    console.log('[Cancel Order] VNPay paid order cancelled - creating RefundRequest');
    
    // Cập nhật trạng thái hoàn tiền
    updateData.paymentStatus = 'refunding';
    updateData.returnStatus = 'requested';
    
    // Tạo RefundRequest nếu chưa có
    const RefundRequest = require('../models/RefundRequest');
    let refund = await RefundRequest.findOne({ order: order._id });
    
    if (!refund) {
      refund = await RefundRequest.create({
        order: order._id,
        user: order.user,
        amount: order.totals.total,
        cancelReason: wasRefundPending 
          ? 'Khách hàng yêu cầu hủy đơn - Admin đã duyệt' 
          : (note || 'Admin hủy đơn hàng'),
        originalPaymentMethod: 'vnpay',
        status: 'awaiting_info',
      });
    }
    
    // Gửi email form hoàn tiền
    const sendRefundEmail = async () => {
      const User = require('../models/User');
      const user = await User.findById(order.user);
      if (user?.email) {
        const emailService = require('../utils/emailService');
        await emailService.sendRefundFormEmail(user.email, {
          customerName: order.customer.name,
          orderId: order._id,
          amount: order.totals.total,
          reason: wasRefundPending 
            ? 'Yêu cầu hủy đơn của bạn đã được chấp thuận' 
            : 'Admin hủy đơn hàng',
          items: order.items,
          totals: order.totals
        });
      }
    };
    
    // Tạo notification với link đến form
    const sendRefundNotification = async () => {
      const Notification = require('../models/Notification');
      const orderCode = order._id.toString().slice(-8).toUpperCase();
      
      await Notification.create({
        user: order.user,
        type: 'order_refund_required',
        title: wasRefundPending 
          ? `✅ Yêu cầu hủy đơn #${orderCode} đã được duyệt` 
          : `Đơn hàng #${orderCode} đã bị hủy - Cần cập nhật thông tin hoàn tiền`,
        message: wasRefundPending
          ? `Yêu cầu hủy đơn của bạn đã được chấp thuận. Vui lòng cập nhật thông tin ngân hàng để nhận hoàn tiền ${order.totals.total.toLocaleString('vi-VN')}đ.`
          : `Lý do hủy: ${note || 'Admin hủy đơn'}\n\nĐơn hàng của bạn đã được thanh toán qua VNPay. Vui lòng cập nhật thông tin ngân hàng để chúng tôi hoàn tiền cho bạn.`,
        order: order._id,
        refundRequest: refund._id,
        metadata: {
          reason: note || 'Admin hủy đơn',
          orderCode,
          amount: order.totals.total,
          refundAmount: order.totals.total,
          paymentMethod: 'vnpay',
          requiresRefundInfo: true,
          refundRequestId: refund._id.toString(),
          wasRefundPending
        },
        actionUrl: `/refund/${refund._id}`,
        actionLabel: 'Điền thông tin hoàn tiền'
      });
    };
    
    // Chạy async không chờ
    sendRefundEmail();
    sendRefundNotification();
  }
}
```

## Luồng Hoạt Động Hoàn Chỉnh

### Trường Hợp 1: User Yêu Cầu Hủy → Admin Duyệt

1. **User**: Hủy đơn VNPay đã thanh toán
   - Frontend gọi: `PUT /orders/me/:id/request-cancel`
   - Backend set: `status = 'refund_pending'`, `orderStatus = 'refund_pending'`

2. **Admin**: Vào trang Orders → Filter "Chờ duyệt hủy" → Thấy đơn
   - Admin chọn đơn → Chuyển trạng thái sang "Đã hủy" (`cancelled`)
   - Frontend gọi: `PUT /orders/:id/status` với `orderStatus = 'cancelled'`

3. **Backend**: Xử lý duyệt hủy
   - Kiểm tra: `wasRefundPending = true` (đơn đang ở `refund_pending`)
   - Kiểm tra: `isVNPayPaid = true` (VNPay đã thanh toán)
   - Tạo `RefundRequest` với `status = 'awaiting_info'`
   - Gửi email form hoàn tiền
   - Tạo notification: "✅ Yêu cầu hủy đơn #XXXXX đã được duyệt"

4. **User**: Nhận notification + email
   - Click vào notification → Chuyển đến `/refund/:id`
   - Điền form: Tên ngân hàng, số tài khoản, tên chủ tài khoản
   - Submit form

5. **Admin**: Xử lý hoàn tiền
   - Xem thông tin tài khoản user đã điền
   - Chuyển tiền thủ công
   - Cập nhật trạng thái RefundRequest → `completed`

### Trường Hợp 2: Admin Trực Tiếp Hủy Đơn

1. **Admin**: Hủy đơn VNPay đang `paid/confirmed/shipping`
   - Chọn đơn → Chuyển trạng thái sang "Đã hủy"
   - Hoặc click button "Hủy đơn" → Nhập lý do

2. **Backend**: Xử lý hủy
   - Kiểm tra: `wasRefundPending = false` (đơn không ở `refund_pending`)
   - Kiểm tra: `isVNPayPaid = true`
   - Tạo `RefundRequest`
   - Gửi email + notification: "Đơn hàng #XXXXX đã bị hủy - Cần cập nhật thông tin hoàn tiền"

3. **User**: Nhận thông báo và điền form (giống trường hợp 1)

## Notification Details

### Notification Type: `order_refund_required`

#### Metadata:
```javascript
{
  reason: "Lý do hủy",
  orderCode: "XXXXX",
  amount: 500000,
  refundAmount: 500000,
  paymentMethod: "vnpay",
  requiresRefundInfo: true,
  refundRequestId: "refund_id",
  wasRefundPending: true/false  // Phân biệt 2 trường hợp
}
```

#### Action:
- `actionUrl`: `/refund/:refundRequestId`
- `actionLabel`: "Điền thông tin hoàn tiền"

## Email Template

### Subject
- Trường hợp 1: "✅ Yêu cầu hủy đơn #XXXXX đã được duyệt"
- Trường hợp 2: "Đơn hàng #XXXXX đã bị hủy - Cần hoàn tiền"

### Content
```
Xin chào [Tên khách hàng],

[Trường hợp 1]: Yêu cầu hủy đơn hàng #XXXXX của bạn đã được chấp thuận.
[Trường hợp 2]: Đơn hàng #XXXXX của bạn đã bị hủy bởi quản trị viên.
Lý do: [Lý do hủy]

Đơn hàng của bạn đã được thanh toán qua VNPay với số tiền: [Số tiền]đ

Để nhận hoàn tiền, vui lòng cập nhật thông tin ngân hàng của bạn tại:
[Link đến form]

Thông tin cần cung cấp:
- Tên ngân hàng
- Số tài khoản
- Tên chủ tài khoản

Chúng tôi sẽ xử lý hoàn tiền trong vòng 3-5 ngày làm việc.

Trân trọng,
PetAdopt Team
```

## Files Đã Sửa

### Backend
- `backend/src/controllers/orderController.js`
  - Hàm `updateOrderStatus` (dòng 550-650)
  - Thêm logic tạo RefundRequest khi duyệt hủy đơn `refund_pending`
  - Phân biệt 2 trường hợp: user yêu cầu vs admin trực tiếp hủy

## Testing

### Test Case 1: Admin duyệt đơn refund_pending
1. User hủy đơn VNPay → Đơn chuyển sang `refund_pending`
2. Admin filter "Chờ duyệt hủy" → Thấy đơn
3. Admin chuyển trạng thái sang "Đã hủy"
4. **Kết quả**:
   - ✅ RefundRequest được tạo
   - ✅ User nhận email form hoàn tiền
   - ✅ User nhận notification: "✅ Yêu cầu hủy đơn đã được duyệt"
   - ✅ Notification có link đến form

### Test Case 2: Admin trực tiếp hủy đơn VNPay
1. Admin hủy đơn VNPay đang `paid`
2. **Kết quả**:
   - ✅ RefundRequest được tạo
   - ✅ User nhận email + notification
   - ✅ Notification: "Đơn hàng đã bị hủy - Cần cập nhật thông tin hoàn tiền"

### Test Case 3: Admin hủy đơn COD
1. Admin hủy đơn COD
2. **Kết quả**:
   - ✅ KHÔNG tạo RefundRequest
   - ✅ User chỉ nhận notification hủy đơn thông thường

## Lợi Ích

✅ **Hoàn chỉnh luồng hoàn tiền**: User luôn nhận được form khi đơn VNPay bị hủy
✅ **Phân biệt rõ ràng**: Notification khác nhau cho 2 trường hợp
✅ **Tự động hóa**: Không cần admin thao tác thủ công
✅ **Trải nghiệm tốt**: User biết chính xác phải làm gì để nhận hoàn tiền
✅ **Theo dõi dễ dàng**: RefundRequest được tạo và quản lý tập trung

---
**Ngày hoàn thành**: 17/05/2026
**Status**: ✅ DONE
