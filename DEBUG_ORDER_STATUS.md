# 🔧 DEBUG - Trạng thái đơn hàng không thay đổi

## ❓ Vấn đề
Admin không thể thay đổi trạng thái đơn hàng qua dropdown.

## 🔍 Các nguyên nhân có thể

### 1. Frontend chưa rebuild
Frontend React cần rebuild sau khi thay đổi code.

### 2. Backend chưa restart
Backend Node.js cần restart để load code mới.

### 3. Cache browser
Browser cache có thể giữ code cũ.

### 4. API endpoint sai
API có thể không nhận đúng tham số.

---

## ✅ GIẢI PHÁP

### Bước 1: Kiểm tra Backend đang chạy

```bash
# Windows PowerShell
Get-Process node

# Hoặc
netstat -ano | findstr :5000
```

Nếu backend đang chạy, **RESTART** nó:
```bash
# Dừng tất cả process Node.js
taskkill /F /IM node.exe

# Hoặc chỉ dừng process cụ thể
taskkill /F /PID <process_id>

# Khởi động lại backend
cd backend
npm start
```

### Bước 2: Rebuild Frontend

```bash
cd frontend

# Xóa cache
rm -rf node_modules/.cache
# Hoặc trên Windows
rmdir /s /q node_modules\.cache

# Rebuild
npm run build

# Hoặc chạy dev mode
npm run dev
```

### Bước 3: Clear Browser Cache

**Chrome/Edge:**
1. Mở DevTools (F12)
2. Right-click vào nút Refresh
3. Chọn "Empty Cache and Hard Reload"

**Hoặc:**
- Ctrl + Shift + Delete
- Chọn "Cached images and files"
- Clear

### Bước 4: Kiểm tra Console

**Mở DevTools (F12) → Console tab**

Khi click dropdown, xem có lỗi gì không:
- ❌ 404 Not Found → API endpoint sai
- ❌ 401 Unauthorized → Token hết hạn
- ❌ 500 Server Error → Backend lỗi
- ✅ 200 OK → Thành công

### Bước 5: Kiểm tra Network

**Mở DevTools (F12) → Network tab**

Khi thay đổi trạng thái, xem request:
```
PUT /api/orders/:id/status
Request Payload:
{
  "orderStatus": "confirmed",
  "note": "Admin cập nhật..."
}

Response:
{
  "success": true,
  "data": {
    "orderStatus": "confirmed",
    "paymentStatus": "unpaid",
    ...
  }
}
```

---

## 🧪 TEST API TRỰC TIẾP

### Cách 1: Dùng script test

```bash
cd backend

# Sửa file test-update-status.js:
# - Thay ADMIN_TOKEN
# - Thay ORDER_ID

node test-update-status.js
```

### Cách 2: Dùng Postman/Thunder Client

```http
PUT http://localhost:5000/api/orders/:orderId/status
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

Body:
{
  "orderStatus": "confirmed",
  "note": "Test update"
}
```

### Cách 3: Dùng curl

```bash
curl -X PUT http://localhost:5000/api/orders/:orderId/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderStatus":"confirmed","note":"Test"}'
```

---

## 🔍 KIỂM TRA DATABASE

### Kết nối MongoDB

```bash
# MongoDB Compass hoặc mongosh
mongosh "mongodb://localhost:27017/petadopt"

# Kiểm tra 1 đơn hàng
db.orders.findOne({}, {
  _id: 1,
  status: 1,
  orderStatus: 1,
  paymentStatus: 1,
  returnStatus: 1
})
```

**Kết quả mong đợi:**
```json
{
  "_id": "...",
  "status": "pending",
  "orderStatus": "pending",
  "paymentStatus": "unpaid",
  "returnStatus": null
}
```

Nếu **KHÔNG CÓ** `orderStatus`, `paymentStatus`, `returnStatus`:
→ Chạy lại migration:
```bash
cd backend
node migrate-order-status.js
```

---

## 🐛 DEBUG FRONTEND

### Thêm console.log vào code

**File: `frontend/src/pages/Admin/order.tsx`**

```typescript
const handleUpdateOrderStatus = async (orderId: string, newOrderStatus: string) => {
  try {
    console.log('🔄 Updating order status:', { orderId, newOrderStatus });
    
    const response = await apiClient.put(`/orders/${orderId}/status`, { 
      orderStatus: newOrderStatus,
      note: `Admin cập nhật trạng thái đơn hàng: ${newOrderStatus}`
    });
    
    console.log('✅ Update success:', response.data);
    
    message.success("Cập nhật trạng thái đơn hàng thành công");
    loadOrders();
    
    if (detailOrder?._id === orderId) {
      setDetailOrder({ ...detailOrder, orderStatus: newOrderStatus as any });
    }
  } catch (e: any) {
    console.error('❌ Update failed:', e.response?.data || e.message);
    message.error(e?.response?.data?.message || "Cập nhật thất bại");
  }
};
```

Sau đó:
1. Save file
2. Rebuild frontend
3. Refresh browser (Ctrl + Shift + R)
4. Mở Console (F12)
5. Thử thay đổi trạng thái
6. Xem log trong Console

---

## 🐛 DEBUG BACKEND

### Thêm console.log vào controller

**File: `backend/src/controllers/orderController.js`**

Tìm hàm `updateOrderStatus` và thêm log:

```javascript
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note, orderStatus, paymentStatus, returnStatus } = req.body;
    
    console.log('📥 Received update request:', {
      orderId: req.params.id,
      status,
      orderStatus,
      paymentStatus,
      returnStatus,
      note
    });
    
    // ... rest of code
    
    console.log('✅ Update successful:', {
      orderId: updated._id,
      orderStatus: updated.orderStatus,
      paymentStatus: updated.paymentStatus
    });
    
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error('❌ Update failed:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
```

Sau đó:
1. Save file
2. Restart backend
3. Thử thay đổi trạng thái
4. Xem log trong terminal backend

---

## 📋 CHECKLIST DEBUG

- [ ] Backend đang chạy (port 5000)
- [ ] Frontend đang chạy (port 5173 hoặc 3000)
- [ ] Database có trường `orderStatus`, `paymentStatus`, `returnStatus`
- [ ] Migration đã chạy thành công
- [ ] Browser cache đã clear
- [ ] Console không có lỗi
- [ ] Network tab thấy request PUT /api/orders/:id/status
- [ ] Response status 200 OK
- [ ] Token admin còn hạn
- [ ] Admin có quyền cập nhật đơn hàng

---

## 🎯 KIỂM TRA NHANH

### Test 1: API hoạt động?
```bash
curl http://localhost:5000/api/orders
```
→ Nếu lỗi: Backend chưa chạy hoặc port sai

### Test 2: Frontend kết nối được backend?
Mở DevTools → Network → Thử load trang admin
→ Xem có request đến `http://localhost:5000` không

### Test 3: Dropdown có hiển thị đúng options?
Mở dropdown trạng thái → Xem có 5 options:
- Chờ xác nhận
- Đã xác nhận
- Đang giao hàng
- Giao hàng thành công
- Đã hủy

### Test 4: Click dropdown có gọi API?
Mở Network tab → Chọn 1 option → Xem có request PUT không

---

## 💡 GỢI Ý

### Nếu vẫn không được:

1. **Kiểm tra file `.env`**
   ```
   FRONTEND_URL=http://localhost:5173
   API_URL=http://localhost:5000/api
   ```

2. **Kiểm tra CORS**
   Backend phải cho phép frontend origin:
   ```javascript
   // backend/server.js
   app.use(cors({
     origin: 'http://localhost:5173',
     credentials: true
   }));
   ```

3. **Kiểm tra route**
   ```javascript
   // backend/src/routes/order.routes.js
   router.put('/:id/status', authenticate, isAdmin, orderController.updateOrderStatus);
   ```

4. **Kiểm tra middleware**
   - `authenticate`: Token có hợp lệ?
   - `isAdmin`: User có role admin?

---

## 📞 HỖ TRỢ

Nếu vẫn không được, cung cấp thông tin sau:

1. **Console log** (F12 → Console)
2. **Network request** (F12 → Network → Request/Response)
3. **Backend log** (Terminal backend)
4. **Database query result**:
   ```javascript
   db.orders.findOne({}, {orderStatus:1, paymentStatus:1})
   ```

Tôi sẽ giúp bạn debug cụ thể hơn! 🚀
