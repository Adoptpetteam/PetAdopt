# 🔄 Hệ thống Hoàn hủy đơn hàng

## 🎯 Tính năng

- ✅ **Hoàn tiền** - User/Admin yêu cầu, Admin xử lý
- ✅ **Trả hàng** - User trả hàng lỗi, nhận lại tiền
- ✅ **Đổi hàng** - User đổi hàng lỗi, nhận hàng mới (giá 0đ)
- ✅ **Thời hạn 3 ngày** - Tự động kiểm tra
- ✅ **Tự động hoàn kho + voucher**
- ✅ **Email thông báo tự động**

## 📚 Documentation

- **Chi tiết đầy đủ:** [REFUND_RETURN_EXCHANGE_FLOW.md](./REFUND_RETURN_EXCHANGE_FLOW.md)
- **Hướng dẫn nhanh:** [REFUND_QUICK_GUIDE.md](./REFUND_QUICK_GUIDE.md)
- **Tổng hợp triển khai:** [REFUND_IMPLEMENTATION_SUMMARY.md](./REFUND_IMPLEMENTATION_SUMMARY.md)

## 🚀 Quick Start

### 1. Migration (nếu có đơn hàng cũ)
```bash
node migrate-orders-refund-fields.js
```

### 2. Restart server
```bash
npm start
```

### 3. Test
```bash
node test-refund-flow.js
```

## 📡 API Endpoints

### User APIs
```
POST /api/orders/:id/request-refund
POST /api/orders/:id/request-return-exchange
```

### Admin APIs
```
POST /api/orders/:id/process-refund
POST /api/orders/:id/process-return
POST /api/orders/:id/process-exchange
POST /api/orders/:id/update-return-status
```

## 📊 Trạng thái mới

### Hoàn tiền
- `refund_pending` → `refund_processing` → `refund_completed`

### Trả hàng
- `return_requested` → `return_shipping` → `return_received` → `refund_pending`

### Đổi hàng
- `exchange_requested` → `exchange_completed` (+ tạo đơn mới)

## 💡 Ví dụ nhanh

### User yêu cầu hoàn tiền
```bash
POST /api/orders/123/request-refund
{
  "reason": "Không còn nhu cầu",
  "bankAccount": "1234567890",
  "bankName": "Vietcombank",
  "accountHolder": "NGUYEN VAN A"
}
```

### Admin xử lý hoàn tiền
```bash
POST /api/orders/123/process-refund
{
  "status": "refund_completed",
  "note": "Đã chuyển khoản"
}
```

### User yêu cầu đổi hàng
```bash
POST /api/orders/123/request-return-exchange
{
  "type": "exchange",
  "reason": "Sản phẩm lỗi",
  "images": ["url.jpg"]
}
```

### Admin chấp nhận đổi hàng
```bash
POST /api/orders/123/process-exchange
{
  "action": "approve",
  "note": "Đã tạo đơn mới"
}
```

## ⚡ Files đã thay đổi

- ✅ `src/models/Order.js` - Schema mới
- ✅ `src/controllers/orderController.js` - 6 functions mới
- ✅ `src/routes/order.routes.js` - 6 endpoints mới

## 🎉 Sẵn sàng sử dụng!

Xem chi tiết trong các file documentation.
