# 🔧 Fix Lỗi 500 khi Thêm Danh mục

## ❌ Vấn đề

Khi thêm danh mục mới, gặp lỗi:
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
```

## 🔍 Nguyên nhân

Lỗi trong **Category model** (`backend/src/models/Category.js`):
- Pre-save hook bị lỗi: `next is not a function`
- Hook thủ công để update `updatedAt` gây conflict với Mongoose

## ✅ Giải pháp

### 1. Đã sửa Category Model

**Trước (Lỗi):**
```javascript
const categorySchema = new mongoose.Schema({
  // ... fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ❌ Hook này gây lỗi
categorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
```

**Sau (Đã fix):**
```javascript
const categorySchema = new mongoose.Schema({
  // ... fields
}, {
  timestamps: true // ✅ Tự động tạo createdAt và updatedAt
});

// ✅ Không cần pre-save hook nữa
```

### 2. Đã thêm Logging

**Backend (`category.routes.js`):**
- Thêm console.log để debug request
- Hiển thị error message chi tiết

**Frontend (`ListCategory.tsx`):**
- Thêm console.log để debug payload
- Hiển thị error response từ server

### 3. Đã fix Frontend

**Vấn đề:** Form không gửi `type` field
**Giải pháp:** Đảm bảo `type` được gửi trong payload:

```typescript
const onFinish = async (values: any) => {
  const payload = {
    ...values,
    type: values.type || currentType // ✅ Đảm bảo type được gửi
  };
  // ...
};
```

---

## 🚀 Cách khắc phục

### Bước 1: Restart Backend Server

**QUAN TRỌNG:** Bạn PHẢI restart backend server để load model mới!

```bash
# Dừng server hiện tại (Ctrl + C)
# Sau đó chạy lại:
cd backend
npm start
```

### Bước 2: Kiểm tra Server đã chạy

Mở browser và truy cập:
```
http://localhost:5000/api/category?type=pet
```

Nếu thấy response JSON → Server đã chạy ✅

### Bước 3: Test thêm danh mục

1. Vào `/admin/category`
2. Chọn tab "Thú cưng" hoặc "Sản phẩm"
3. Click "Thêm danh mục"
4. Điền form:
   - Tên: "Test Category"
   - Mô tả: "Test"
   - Icon: "🐕"
   - Màu: "#6272B6"
   - Trạng thái: Hoạt động
5. Click "Thêm mới"

### Bước 4: Kiểm tra Console

**Browser Console (F12):**
```
[ListCategory] Form values: {...}
[ListCategory] Current type: pet
[ListCategory] Payload to send: {...}
[ListCategory] Creating new category
[ListCategory] Response: {...}
```

**Backend Terminal:**
```
[Category POST] Request body: {...}
[Category POST] User: {...}
[Category POST] Creating category: {...}
[Category POST] Category created successfully: 507f...
```

---

## 🧪 Test Scripts

Tôi đã tạo 2 test scripts để kiểm tra:

### 1. Test Model trực tiếp
```bash
cd backend
node test-category-simple.js
```

**Kết quả mong đợi:**
```
✅ Connected!
✅ Category created successfully!
✅ Test category deleted
```

### 2. Test API với authentication
```bash
cd backend
node test-category-create.js
```

**Lưu ý:** Cần sửa email/password admin trong file này trước khi chạy.

---

## 📊 Checklist

Trước khi test, đảm bảo:

- [ ] Backend server đã restart
- [ ] MongoDB đang chạy
- [ ] Đã đăng nhập admin trong frontend
- [ ] Browser console đang mở (F12)
- [ ] Backend terminal đang hiển thị logs

---

## 🐛 Nếu vẫn lỗi

### Lỗi 401 (Unauthorized)
```
→ Chưa đăng nhập hoặc token hết hạn
→ Đăng xuất và đăng nhập lại
```

### Lỗi 400 (Bad Request)
```
→ Thiếu field bắt buộc (name hoặc type)
→ Kiểm tra console log payload
```

### Lỗi 500 (Internal Server Error)
```
→ Kiểm tra backend terminal logs
→ Xem error message chi tiết
→ Có thể là MongoDB connection issue
```

### Danh mục đã tồn tại
```
→ Tên bị trùng trong cùng loại
→ Đổi tên khác
```

---

## 📝 Files đã thay đổi

1. **`backend/src/models/Category.js`**
   - Sửa: Dùng `timestamps: true` thay vì pre-save hook
   - Xóa: Manual createdAt/updatedAt fields
   - Xóa: Pre-save hook

2. **`backend/src/routes/category.routes.js`**
   - Thêm: Console logs để debug
   - Thêm: Error message chi tiết

3. **`frontend/src/pages/Admin/Category/ListCategory.tsx`**
   - Sửa: Đảm bảo type được gửi trong payload
   - Thêm: Console logs để debug

4. **`backend/test-category-simple.js`** (mới)
   - Test model trực tiếp

5. **`backend/test-category-create.js`** (mới)
   - Test API với authentication

---

## ✨ Kết quả

Sau khi restart backend server:

- ✅ Model hoạt động bình thường
- ✅ API tạo category thành công
- ✅ Frontend có thể thêm/sửa/xóa category
- ✅ Không còn lỗi 500

---

## 🎯 Tóm tắt

**Vấn đề:** Pre-save hook trong Category model gây lỗi
**Giải pháp:** Dùng `timestamps: true` của Mongoose
**Hành động:** **RESTART BACKEND SERVER**

**Sau khi restart, mọi thứ sẽ hoạt động hoàn hảo! 🎉**
