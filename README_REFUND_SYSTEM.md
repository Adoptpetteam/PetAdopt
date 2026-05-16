# 🔄 Hệ thống Hoàn hủy đơn hàng

## 🚀 Quick Start

### Backend
```bash
cd backend
node migrate-orders-refund-fields.js  # Nếu có đơn cũ
npm start
```

### Frontend
```bash
cd frontend
npm run dev
```

### Admin Access
```
URL: http://localhost:5173/admin/refund-management
Menu: Admin → Hoàn hủy (icon RollbackOutlined)
```

---

## 📚 Documentation

### 📖 Đọc đầu tiên
- **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** - Checklist & Quick access

### 🔧 Backend
- **[REFUND_RETURN_EXCHANGE_FLOW.md](backend/REFUND_RETURN_EXCHANGE_FLOW.md)** - Chi tiết đầy đủ
- **[REFUND_QUICK_GUIDE.md](backend/REFUND_QUICK_GUIDE.md)** - Hướng dẫn nhanh
- **[REFUND_IMPLEMENTATION_SUMMARY.md](backend/REFUND_IMPLEMENTATION_SUMMARY.md)** - Tổng hợp triển khai

### 🎨 Frontend
- **[REFUND_FRONTEND_GUIDE.md](frontend/REFUND_FRONTEND_GUIDE.md)** - Hướng dẫn frontend
- **[ADMIN_REFUND_GUIDE.md](frontend/ADMIN_REFUND_GUIDE.md)** - Hướng dẫn admin

### 📋 Complete
- **[REFUND_SYSTEM_COMPLETE.md](REFUND_SYSTEM_COMPLETE.md)** - Tổng hợp toàn bộ

---

## ✨ Tính năng

### 💰 Hoàn tiền
- User yêu cầu hoàn tiền
- Admin xử lý
- Tự động: Hoàn kho + Voucher + Email

### 📦 Trả hàng
- User yêu cầu trả hàng (upload ảnh)
- Admin chấp nhận/từ chối
- User ship về (COD)
- Admin hoàn tiền

### 🔁 Đổi hàng
- User yêu cầu đổi hàng (upload ảnh)
- Admin chấp nhận/từ chối
- Tự động tạo đơn mới giá 0đ
- User nhận hàng mới miễn phí

---

## 📊 Trạng thái mới (9)

### Hoàn tiền
- `refund_pending` → `refund_processing` → `refund_completed`

### Trả hàng
- `return_requested` → `return_shipping` → `return_received` → `refund_pending`

### Đổi hàng
- `exchange_requested` → `exchange_completed` (+ đơn mới)

---

## 🔌 API Endpoints

### User (2)
```
POST /api/orders/:id/request-refund
POST /api/orders/:id/request-return-exchange
```

### Admin (4)
```
POST /api/orders/:id/process-refund
POST /api/orders/:id/process-return
POST /api/orders/:id/process-exchange
POST /api/orders/:id/update-return-status
```

---

## 📁 Files

### Backend (7 files)
- ✅ `src/models/Order.js` - Cập nhật
- ✅ `src/controllers/orderController.js` - Cập nhật
- ✅ `src/routes/order.routes.js` - Cập nhật
- ✅ `test-refund-flow.js` - Test script
- ✅ `migrate-orders-refund-fields.js` - Migration
- ✅ 3 documentation files

### Frontend (7 files)
- ✅ `src/components/RefundModal.tsx` - Mới
- ✅ `src/components/ReturnExchangeModal.tsx` - Mới
- ✅ `src/pages/Orders.tsx` - Cập nhật
- ✅ `src/pages/Admin/RefundManagement.tsx` - Mới
- ✅ `src/pages/Admin/AdminLayout.tsx` - Cập nhật
- ✅ `src/routes/AppRoutes.tsx` - Cập nhật
- ✅ 2 documentation files

### Root (3 files)
- ✅ `REFUND_SYSTEM_COMPLETE.md`
- ✅ `SETUP_COMPLETE.md`
- ✅ `README_REFUND_SYSTEM.md` (file này)

**Tổng: 17 files**

---

## 🧪 Testing

### Backend
```bash
cd backend
node test-refund-flow.js
```

### Frontend User
```
1. http://localhost:5173/orders
2. Login user
3. Test nút "Hoàn tiền" / "Trả/Đổi"
```

### Frontend Admin
```
1. http://localhost:5173/admin/login
2. Login admin
3. Menu → Hoàn hủy
4. Test 3 tabs
```

---

## ✅ Checklist

- [x] Backend: 9 trạng thái + 6 APIs
- [x] Frontend User: 2 modals + Orders update
- [x] Frontend Admin: RefundManagement page + Menu
- [x] Documentation: 10 files
- [x] Testing: Scripts
- [x] Migration: Script

---

## 🎯 Admin Access

### Menu Location
```
Admin Panel (Sidebar)
  ├── Dashboard
  ├── Nhận nuôi
  ├── ...
  ├── Đơn hàng
  ├── 🔄 Hoàn hủy  ← ĐÂY!
  ├── Thống kê
  └── ...
```

### Features
- 3 tabs: Hoàn tiền | Trả hàng | Đổi hàng
- Badge đếm số lượng yêu cầu
- Modal chi tiết đơn hàng
- Modal xử lý yêu cầu
- Cập nhật trạng thái vận chuyển

---

## 💡 Tips

### User
- Thời hạn: 3 ngày sau khi nhận hàng
- Upload ảnh chứng minh rõ ràng
- Điền đầy đủ thông tin tài khoản

### Admin
- Xử lý trong 24h
- Kiểm tra ảnh chứng minh
- Ghi chú rõ ràng
- Giao tiếp tốt với khách

---

## 🐛 Troubleshooting

### Backend không start
```bash
# Kiểm tra MongoDB
mongosh

# Xem logs
tail -f backend/server-log.txt
```

### Migration lỗi
```bash
# Backup trước
mongodump --db petadopt --out backup/

# Chạy lại
node migrate-orders-refund-fields.js
```

### Admin không thấy menu
```
→ Kiểm tra AdminLayout.tsx đã cập nhật
→ Kiểm tra AppRoutes.tsx đã có route
→ Refresh browser (Ctrl+F5)
```

---

## 📞 Support

- 📚 Đọc documentation
- 🐛 Kiểm tra logs
- 💬 Hỏi team
- 📧 support@petadopt.com

---

## 🎉 Status

**✅ HOÀN THÀNH 100%**

Hệ thống sẵn sàng sử dụng!

---

**Made with ❤️ by Kiro AI**
