# 🐛 DEBUG: Trang Statistics không hiển thị dữ liệu

## ✅ Đã kiểm tra

### 1. Database có dữ liệu
```
✅ Tổng 22 đơn hàng
✅ 7 đơn status='completed' (match filter statistics)
✅ Doanh thu: 3.965.000đ
```

### 2. Backend API hoạt động tốt
```bash
node backend/test-statistics-api.js
```
**Kết quả:**
- ✅ GET /api/statistics/overview → 22 đơn, 3.965.000đ
- ✅ GET /api/statistics/revenue-by-time → 5 điểm dữ liệu
- ✅ GET /api/statistics/top-products → 5 sản phẩm
- ✅ GET /api/statistics/inventory → 26 sản phẩm

### 3. Routes đã đăng ký
```javascript
// backend/server.js
app.use('/api/statistics', statisticsRoutes);
```

### 4. Frontend code đúng
- ✅ Component Statistics.tsx gọi API đúng
- ✅ statisticsApi.ts có đầy đủ functions
- ✅ Đã thêm console.log để debug

---

## 🔍 Cần kiểm tra tiếp

### Frontend Console Log
Mở DevTools Console (F12) khi vào trang `/admin/statistics` và xem:

1. **Có log "📊 Fetching statistics..." không?**
   - Nếu KHÔNG → Component chưa mount hoặc useEffect không chạy
   - Nếu CÓ → Tiếp tục kiểm tra

2. **Có log "✅ Overview data:" không?**
   - Nếu KHÔNG → API call bị lỗi, xem log "❌ Statistics fetch error"
   - Nếu CÓ → Dữ liệu đã về, vấn đề là rendering

3. **Có lỗi 401 Unauthorized không?**
   - Kiểm tra admin token: `localStorage.getItem('admin_token')`
   - Nếu null → Cần login lại admin
   - Nếu có token → Token có thể hết hạn

4. **Có lỗi CORS không?**
   - Kiểm tra Network tab → Xem request có bị block không
   - Backend đã config CORS cho localhost:5173

5. **Có lỗi Network không?**
   - Backend có đang chạy không? (http://localhost:5000)
   - Frontend đang gọi đúng URL không?

---

## 🛠️ Các bước debug

### Bước 1: Kiểm tra backend đang chạy
```bash
curl http://localhost:5000/
```
Phải trả về: `{"success":true,"message":"API is running",...}`

### Bước 2: Kiểm tra admin token
Mở Console trong trình duyệt:
```javascript
console.log('Admin token:', localStorage.getItem('admin_token'));
```

### Bước 3: Test API trực tiếp từ Console
```javascript
fetch('http://localhost:5000/api/statistics/overview', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('admin_token')
  }
})
.then(r => r.json())
.then(d => console.log('API response:', d))
.catch(e => console.error('API error:', e));
```

### Bước 4: Kiểm tra Network tab
1. Mở DevTools → Network tab
2. Refresh trang Statistics
3. Tìm request `/api/statistics/overview`
4. Xem:
   - Status code (200 OK? 401? 500?)
   - Response body
   - Request headers (có Authorization không?)

---

## 💡 Các nguyên nhân có thể

### 1. Admin chưa login
**Triệu chứng:** Lỗi 401 Unauthorized
**Giải pháp:** Login lại admin tại `/admin/login`

### 2. Token hết hạn
**Triệu chứng:** Lỗi 401 hoặc "Token đã hết hạn"
**Giải pháp:** Login lại admin

### 3. Backend chưa chạy
**Triệu chứng:** Network error, ERR_CONNECTION_REFUSED
**Giải pháp:** 
```bash
cd backend
node server.js
```

### 4. Frontend gọi sai URL
**Triệu chứng:** 404 Not Found
**Giải pháp:** Kiểm tra `frontend/src/api/http.ts` → baseURL phải là `http://localhost:5000/api`

### 5. CORS issue
**Triệu chứng:** CORS policy error trong console
**Giải pháp:** Kiểm tra backend CORS config cho phép localhost:5173

### 6. Data về nhưng không render
**Triệu chứng:** Console log "✅ Overview data" nhưng UI vẫn trắng
**Giải pháp:** Kiểm tra component render logic, có thể data structure không đúng

---

## 📝 Next Steps

1. **Mở trang `/admin/statistics`**
2. **Mở DevTools Console (F12)**
3. **Refresh trang (F5)**
4. **Chụp màn hình Console log**
5. **Chụp màn hình Network tab**
6. **Gửi cho tôi để debug tiếp**

---

## 🔧 Files đã tạo để debug

- `backend/check-order-status.js` - Kiểm tra status đơn hàng trong DB
- `backend/test-statistics-api.js` - Test API statistics
- `frontend/src/pages/Admin/Statistics.tsx` - Đã thêm console.log

---

## 📊 Kết quả mong đợi

Sau khi fix, trang Statistics phải hiển thị:
- 📦 Tổng đơn hàng: 22
- 💰 Doanh thu: 3.965.000đ
- 🧾 Giá trị TB/đơn: 566.429đ
- ✅ Đơn đã thanh toán: 7 đơn
- 📈 Biểu đồ doanh thu theo ngày (5 điểm)
- 🏆 Top 5 sản phẩm bán chạy
- 📦 Tồn kho: 26 sản phẩm, giá trị 234.425.000đ
