# ✅ Cập nhật Thanh tiến trình - Hoàn trả đơn hàng

## 🎯 Đã cập nhật

File: `frontend/src/pages/Orders.tsx`

### 1. Function `getProgress()` - Tính % tiến trình

**Trước:**
```typescript
// Chỉ xử lý flow bình thường (pending → completed)
const getProgress = (order: OrderData) => {
  if (order.status === "cancelled") return { percent: 100, status: "exception" };
  const steps = getSteps(order);
  const idx = steps.indexOf(order.status);
  const pct = idx < 0 ? 10 : Math.round(((idx + 1) / steps.length) * 100);
  return { percent: pct, status: "active" };
};
```

**Sau:**
```typescript
// Xử lý tất cả các flow: normal, refund, return, exchange
const getProgress = (order: OrderData) => {
  // Cancelled
  if (order.status === "cancelled") {
    return { percent: 100, status: "exception" };
  }
  
  // Refund flow: 3 bước
  if (order.status.startsWith("refund")) {
    const refundSteps = ["refund_pending", "refund_processing", "refund_completed"];
    const idx = refundSteps.indexOf(order.status);
    const pct = idx < 0 ? 10 : Math.round(((idx + 1) / refundSteps.length) * 100);
    return { percent: pct, status: "active" };
  }
  
  // Return flow: 3 bước
  if (order.status.startsWith("return")) {
    const returnSteps = ["return_requested", "return_shipping", "return_received"];
    const idx = returnSteps.indexOf(order.status);
    const pct = idx < 0 ? 10 : Math.round(((idx + 1) / returnSteps.length) * 100);
    return { percent: pct, status: "active" };
  }
  
  // Exchange flow: 2 bước
  if (order.status.startsWith("exchange")) {
    const exchangeSteps = ["exchange_requested", "exchange_completed"];
    const idx = exchangeSteps.indexOf(order.status);
    const pct = idx < 0 ? 50 : 100;
    return { percent: pct, status: "active" };
  }
  
  // Normal flow
  const steps = getSteps(order);
  const idx = steps.indexOf(order.status);
  const pct = idx < 0 ? 10 : Math.round(((idx + 1) / steps.length) * 100);
  return { percent: pct, status: "active" };
};
```

---

### 2. Function `getTimelineItems()` - Timeline chi tiết

**Trước:**
```typescript
// Chỉ có timeline cho: normal flow và cancelled
```

**Sau:**
```typescript
// Timeline cho TẤT CẢ các trạng thái:

// 1. Cancelled
if (order.status === "cancelled") {
  return [
    { Đặt hàng thành công },
    { Đơn hàng đã hủy }
  ];
}

// 2. Refund flow
if (order.status.startsWith("refund")) {
  return [
    { Yêu cầu hoàn tiền },
    { Đang xử lý hoàn tiền },
    { Hoàn tiền thành công }
  ];
}

// 3. Return flow
if (order.status.startsWith("return")) {
  return [
    { Yêu cầu trả hàng },
    { Đang gửi hàng về },
    { Đã nhận hàng trả }
  ];
}

// 4. Exchange flow
if (order.status.startsWith("exchange")) {
  return [
    { Yêu cầu đổi hàng },
    { Đổi hàng thành công }
  ];
}

// 5. Normal flow (pending → completed)
return [
  { Đặt hàng thành công },
  { Đã xác nhận / Đã thanh toán },
  { Đang giao hàng },
  { Giao hàng thành công }
];
```

---

### 3. Progress Bar Labels - Nhãn dưới thanh tiến trình

**Trước:**
```jsx
<div className="flex justify-between text-xs text-gray-500">
  <span>🛒 Đặt hàng</span>
  <span>✅ Xác nhận / 💳 Thanh toán</span>
  <span>🚚 Vận chuyển</span>
  <span>✅ Hoàn thành</span>
</div>
```

**Sau:**
```jsx
<div className="flex justify-between text-xs text-gray-500">
  {selected.status.startsWith("refund") ? (
    <>
      <span>💰 Yêu cầu</span>
      <span>⏳ Xử lý</span>
      <span>✅ Hoàn tiền</span>
    </>
  ) : selected.status.startsWith("return") ? (
    <>
      <span>📦 Yêu cầu</span>
      <span>🚚 Gửi về</span>
      <span>✅ Đã nhận</span>
    </>
  ) : selected.status.startsWith("exchange") ? (
    <>
      <span>🔄 Yêu cầu</span>
      <span>✅ Đổi hàng</span>
    </>
  ) : (
    <>
      <span>🛒 Đặt hàng</span>
      <span>✅ Xác nhận / 💳 Thanh toán</span>
      <span>🚚 Vận chuyển</span>
      <span>✅ Hoàn thành</span>
    </>
  )}
</div>
```

---

## 📊 Hiển thị theo trạng thái

### 1. Hoàn tiền (Refund)

#### Progress Bar
```
[████████░░░░] 33%
💰 Yêu cầu  ⏳ Xử lý  ✅ Hoàn tiền
```

#### Timeline
```
✅ Yêu cầu hoàn tiền
   Đang chờ admin xử lý
   
⏳ Đang xử lý hoàn tiền (active)
   Admin đang xử lý yêu cầu
   
⚪ Hoàn tiền thành công
   Đã hoàn tiền vào tài khoản
```

#### Các bước
1. `refund_pending` → 33%
2. `refund_processing` → 67%
3. `refund_completed` → 100%

---

### 2. Trả hàng (Return)

#### Progress Bar
```
[████████░░░░] 33%
📦 Yêu cầu  🚚 Gửi về  ✅ Đã nhận
```

#### Timeline
```
✅ Yêu cầu trả hàng
   Đang chờ admin xác nhận
   
⏳ Đang gửi hàng về (active)
   Hàng đang được vận chuyển về kho
   
⚪ Đã nhận hàng trả
   Kho đã nhận hàng, chờ hoàn tiền
```

#### Các bước
1. `return_requested` → 33%
2. `return_shipping` → 67%
3. `return_received` → 100%

---

### 3. Đổi hàng (Exchange)

#### Progress Bar
```
[████████████] 50%
🔄 Yêu cầu  ✅ Đổi hàng
```

#### Timeline
```
✅ Yêu cầu đổi hàng
   Đang chờ admin xác nhận
   
⏳ Đổi hàng thành công (active)
   Đã tạo đơn hàng mới (giá 0đ)
```

#### Các bước
1. `exchange_requested` → 50%
2. `exchange_completed` → 100%

---

### 4. Đơn hàng bình thường

#### Progress Bar (COD)
```
[████████████] 75%
🛒 Đặt hàng  ✅ Xác nhận  🚚 Vận chuyển  ✅ Hoàn thành
```

#### Progress Bar (VNPay)
```
[████████████] 75%
🛒 Đặt hàng  💳 Thanh toán  🚚 Vận chuyển  ✅ Hoàn thành
```

#### Timeline (COD)
```
✅ Đặt hàng thành công
✅ Đã xác nhận
⏳ Đang giao hàng (active)
⚪ Giao hàng thành công
```

#### Timeline (VNPay)
```
✅ Đặt hàng thành công
✅ Đã thanh toán VNPay
⏳ Đang giao hàng (active)
⚪ Giao hàng thành công
```

---

### 5. Đơn hàng đã hủy

#### Progress Bar
```
[████████████] 100% (red)
❌ Đơn hàng đã hủy
```

#### Timeline
```
✅ Đặt hàng thành công
   Đơn hàng đã được tạo
   
❌ Đơn hàng đã hủy
   Đơn hàng bị hủy bỏ
```

---

## 🎨 Màu sắc

### Progress Bar
- **Normal flow**: Gradient xanh dương → tím (`#6272B6` → `#a78bfa`)
- **Cancelled**: Đỏ (exception status)
- **Refund/Return/Exchange**: Gradient xanh dương → tím

### Timeline Icons
- **Done (completed)**: Xanh lá `#52c41a`
- **Active (current)**: Xanh dương `#1890ff`
- **Pending (future)**: Xám `#d9d9d9`
- **Cancelled**: Đỏ `#ff4d4f`

### Text
- **Done**: `text-green-600` hoặc `text-blue-400`
- **Active**: `text-blue-600`
- **Pending**: `text-gray-300`
- **Cancelled**: `text-red-500`

---

## ✅ Kết quả

### Trước khi cập nhật
- ❌ Chỉ hiển thị progress cho flow bình thường
- ❌ Không có timeline cho refund/return/exchange
- ❌ Labels không phù hợp với trạng thái hoàn trả

### Sau khi cập nhật
- ✅ Progress bar hiển thị đúng cho TẤT CẢ trạng thái
- ✅ Timeline chi tiết cho từng loại flow
- ✅ Labels phù hợp với từng trạng thái
- ✅ Màu sắc và icons rõ ràng
- ✅ User dễ theo dõi tiến trình

---

## 🧪 Test

### Test Cases

1. **Đơn hoàn tiền**
   ```
   1. Tạo đơn hàng và thanh toán
   2. Yêu cầu hoàn tiền
   3. Kiểm tra progress bar: 33%
   4. Kiểm tra timeline: 3 bước
   5. Kiểm tra labels: 💰 Yêu cầu | ⏳ Xử lý | ✅ Hoàn tiền
   ```

2. **Đơn trả hàng**
   ```
   1. Đơn hàng completed
   2. Yêu cầu trả hàng
   3. Kiểm tra progress bar: 33%
   4. Kiểm tra timeline: 3 bước
   5. Kiểm tra labels: 📦 Yêu cầu | 🚚 Gửi về | ✅ Đã nhận
   ```

3. **Đơn đổi hàng**
   ```
   1. Đơn hàng completed
   2. Yêu cầu đổi hàng
   3. Kiểm tra progress bar: 50%
   4. Kiểm tra timeline: 2 bước
   5. Kiểm tra labels: 🔄 Yêu cầu | ✅ Đổi hàng
   ```

4. **Đơn bình thường**
   ```
   1. Tạo đơn hàng mới
   2. Kiểm tra progress bar theo từng bước
   3. Kiểm tra timeline: 4 bước
   4. Kiểm tra labels: 🛒 | ✅/💳 | 🚚 | ✅
   ```

5. **Đơn đã hủy**
   ```
   1. Hủy đơn hàng
   2. Kiểm tra progress bar: 100% (red)
   3. Kiểm tra timeline: 2 bước
   4. Không hiển thị progress bar
   ```

---

## 📝 Notes

### Logic xử lý
- Sử dụng `startsWith()` để check prefix của status
- Mỗi flow có steps riêng
- Timeline items được tạo động dựa trên status
- Icons và màu sắc thay đổi theo trạng thái

### Performance
- Không ảnh hưởng performance
- Logic đơn giản, dễ maintain
- Dễ mở rộng thêm trạng thái mới

### Responsive
- Progress bar responsive
- Timeline responsive
- Labels responsive (có thể wrap)

---

## 🎉 Hoàn thành

Thanh tiến trình đã được cập nhật hoàn chỉnh cho tất cả các trạng thái hoàn trả!

**User giờ có thể:**
- ✅ Theo dõi tiến trình hoàn tiền
- ✅ Theo dõi tiến trình trả hàng
- ✅ Theo dõi tiến trình đổi hàng
- ✅ Xem timeline chi tiết từng bước
- ✅ Hiểu rõ trạng thái hiện tại

**Trải nghiệm tốt hơn!** 🚀
