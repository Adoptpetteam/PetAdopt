# 🚀 Order Status - Quick Reference

## 📊 3 Trạng thái mới

```javascript
{
  orderStatus: "shipping",     // Trạng thái đơn hàng
  paymentStatus: "paid",       // Trạng thái thanh toán  
  returnStatus: null           // Trạng thái hoàn trả
}
```

---

## 🎯 Order Status

| Value | Label | Màu |
|-------|-------|-----|
| `pending` | Chờ xác nhận | 🟠 Orange |
| `confirmed` | Đã xác nhận | 🔵 Cyan |
| `processing` | Đang chuẩn bị | 🔵 Blue |
| `shipping` | Đang giao hàng | 🟣 Purple |
| `completed` | Hoàn thành | 🟢 Green |
| `cancelled` | Đã hủy | 🔴 Red |

---

## 💰 Payment Status

| Value | Label | Màu |
|-------|-------|-----|
| `unpaid` | Chưa thanh toán | ⚪ Default |
| `pending` | Chờ thanh toán | 🟠 Orange |
| `paid` | Đã thanh toán | 🟢 Green |
| `refunding` | Đang hoàn tiền | 🔵 Blue |
| `refunded` | Đã hoàn tiền | 🟢 Green |
| `failed` | Thất bại | 🔴 Red |

---

## 🔄 Return Status

| Value | Label | Màu |
|-------|-------|-----|
| `null` | Không có | ⚪ Default |
| `requested` | Yêu cầu hoàn trả | 🟠 Orange |
| `approved` | Đã chấp thuận | 🔵 Cyan |
| `rejected` | Đã từ chối | 🔴 Red |
| `shipping` | Đang gửi về | 🟣 Purple |
| `received` | Đã nhận hàng | 🔵 Blue |
| `completed` | Hoàn tất | 🟢 Green |

---

## 💡 Common Cases

### COD mới tạo
```js
{ orderStatus: "pending", paymentStatus: "unpaid", returnStatus: null }
```

### VNPay đã thanh toán
```js
{ orderStatus: "confirmed", paymentStatus: "paid", returnStatus: null }
```

### Đang giao hàng
```js
{ orderStatus: "shipping", paymentStatus: "paid", returnStatus: null }
```

### Yêu cầu hủy VNPay
```js
{ orderStatus: "cancelled", paymentStatus: "refunding", returnStatus: "requested" }
```

### Đã hoàn tiền
```js
{ orderStatus: "cancelled", paymentStatus: "refunded", returnStatus: "completed" }
```

### Trả hàng sau khi nhận
```js
{ orderStatus: "completed", paymentStatus: "refunding", returnStatus: "shipping" }
```

---

## 🔧 Helper Functions

```javascript
const { 
  getOrderStatusConfig,
  getPaymentStatusConfig,
  getReturnStatusConfig,
  canCancelOrder,
  canRequestReturn 
} = require('./utils/orderStatusHelper');

// Get config
const config = getOrderStatusConfig('shipping');
// { label: 'Đang giao hàng', color: 'purple', icon: 'truck' }

// Check permissions
if (canCancelOrder(order)) { /* show cancel button */ }
if (canRequestReturn(order)) { /* show return button */ }
```

---

## 📝 Migration

```bash
# Run migration
cd backend
node migrate-order-status.js

# Result: 17/17 orders migrated ✅
```

---

## 🎨 UI Example

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

---

## ✅ Checklist

- [x] Model updated
- [x] Migration completed
- [x] Helper functions created
- [ ] Controllers updated
- [ ] Frontend updated
- [ ] API responses updated
- [ ] Testing completed

---

**Read full docs:** `ORDER_STATUS_REFACTOR.md`
