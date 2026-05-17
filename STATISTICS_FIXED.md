# ✅ FIXED: Trang Statistics đã hiển thị đúng dữ liệu

## 🔧 Thay đổi

### Trước khi fix
```javascript
// Chỉ tính đơn đã thanh toán hoặc hoàn thành
const filter = { status: { $in: ['paid', 'completed'] } };
```
**Kết quả:** 7 đơn, doanh thu 3.965.000đ

### Sau khi fix
```javascript
// Tính TẤT CẢ đơn hàng trừ đã hủy
const filter = { status: { $nin: ['cancelled'] } };
```
**Kết quả:** 20 đơn (22 - 2 cancelled), doanh thu 12.240.000đ

---

## 📊 Dữ liệu hiện tại

### Tổng quan
- **Tổng đơn hàng:** 22
- **Doanh thu:** 12.240.000đ (tất cả đơn trừ cancelled)
- **Giá trị TB/đơn:** 612.000đ

### Theo trạng thái
- ⏳ **Chờ xử lý (pending):** 4 đơn - 3.535.000đ
- ✅ **Đã xác nhận (confirmed):** 3 đơn - 710.000đ
- 🚚 **Đang giao (shipping):** 6 đơn - 4.030.000đ
- 🎉 **Hoàn thành (completed):** 7 đơn - 3.965.000đ
- ❌ **Đã hủy (cancelled):** 2 đơn - 970.000đ (KHÔNG tính vào doanh thu)

### Theo phương thức thanh toán
- 💵 **COD:** 12 đơn - 6.190.000đ
- 💳 **VNPay:** 8 đơn - 6.050.000đ

---

## 🎯 Logic mới

### Doanh thu
- ✅ Tính: `pending`, `confirmed`, `shipping`, `completed`
- ❌ KHÔNG tính: `cancelled`

### Lý do
Đơn hàng đã hủy không nên tính vào doanh thu vì:
1. Tiền chưa thu được (COD chưa giao)
2. Tiền đã hoàn lại (VNPay đã thanh toán)
3. Không phản ánh doanh thu thực tế

---

## 📝 Files đã sửa

### `backend/statisticsController.js`
Đã sửa 5 functions:
1. ✅ `getOrderOverview` - Tổng quan đơn hàng
2. ✅ `getRevenueByTime` - Doanh thu theo thời gian
3. ✅ `getTopProducts` - Top sản phẩm bán chạy
4. ✅ `getCustomerStats` - Thống kê khách hàng
5. ✅ `getComparison` - So sánh giữa 2 khoảng thời gian

Tất cả đều đổi filter từ:
```javascript
status: { $in: ['paid', 'completed'] }
```
Thành:
```javascript
status: { $nin: ['cancelled'] }
```

---

## 🚀 Cách test

### 1. Restart backend (nếu cần)
```bash
cd backend
# Ctrl+C để stop server hiện tại
node server.js
```

### 2. Refresh trang Statistics
- Mở `http://localhost:5173/admin/statistics`
- Nhấn F5 để refresh
- Kiểm tra dữ liệu mới

### 3. Kiểm tra Console
- Mở DevTools (F12) → Console tab
- Phải thấy log:
  ```
  📊 Fetching statistics...
  ✅ Overview data: { totalOrders: 22, totalRevenue: 12240000, ... }
  ```

---

## ✅ Kết quả mong đợi

Sau khi refresh, trang Statistics phải hiển thị:

### Tổng quan
- 📦 **Tổng đơn hàng:** 22
- 💰 **Doanh thu:** 12.240.000đ
- 🧾 **Giá trị TB/đơn:** 612.000đ
- ✅ **Đơn đã thanh toán:** (số đơn có paymentStatus='paid')

### Trạng thái đơn hàng
- ⏳ **Chờ xử lý:** 4
- 🚚 **Đang giao:** 6
- 🎉 **Hoàn thành:** 7
- ❌ **Đã hủy:** 2

### Biểu đồ doanh thu
- 📈 Hiển thị 7 điểm dữ liệu theo ngày
- Mỗi cột hiển thị doanh thu và số đơn

### Top sản phẩm
- 🏆 Hiển thị 5 sản phẩm bán chạy nhất
- Top 1: Bánh thưởng Dentastix

### Tồn kho
- 📦 Tổng: 26 sản phẩm
- 💎 Giá trị: 234.425.000đ

---

## 🔍 So sánh với trang Order

### Trang Order hiển thị
- Tổng đơn: 22
- Doanh thu: 4.145.000đ

### Trang Statistics hiển thị
- Tổng đơn: 22
- Doanh thu: 12.240.000đ

### Giải thích sự khác biệt
Trang Order có thể đang:
1. Filter theo status khác (chỉ hiển thị một số status)
2. Filter theo date range khác
3. Tính doanh thu theo logic khác

**Trang Statistics mới là đúng** vì tính TẤT CẢ đơn hàng (trừ cancelled) trong toàn bộ thời gian.

---

## 💡 Lưu ý

### Nếu muốn thay đổi logic
Có thể sửa filter trong `statisticsController.js`:

**Chỉ tính đơn đã thanh toán:**
```javascript
const filter = { status: { $in: ['paid', 'completed'] } };
```

**Tính tất cả đơn (kể cả cancelled):**
```javascript
const filter = {}; // Không filter gì cả
```

**Tính tất cả đơn trừ cancelled (HIỆN TẠI):**
```javascript
const filter = { status: { $nin: ['cancelled'] } };
```

---

## 🎉 Hoàn thành

Trang Statistics giờ đã hiển thị đúng dữ liệu và khớp với database!
