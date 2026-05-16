# 📋 Hướng dẫn Quản lý Danh mục

## Tổng quan

Hệ thống quản lý danh mục đã được **cải tiến và thống nhất** để dễ sử dụng hơn. Giờ đây bạn có thể quản lý cả **Danh mục Thú cưng** và **Danh mục Sản phẩm** trong một trang duy nhất với giao diện tab.

---

## 🎯 Các thay đổi chính

### ✅ Đã sửa

1. **Thống nhất API**: Tất cả các trang category giờ đây sử dụng cùng một API structure
   - Sử dụng `_id` (MongoDB ID) thay vì `id`
   - Sử dụng `isActive` (boolean) thay vì `status` (string)
   - Sử dụng `type` ('pet' hoặc 'product') để phân loại

2. **Giao diện thống nhất**: 
   - Trang **ListCategory** (`/admin/category`) giờ đây hiển thị cả Pet và Product categories trong 2 tabs
   - Giao diện đẹp hơn với gradient và card design
   - Form thêm/sửa đầy đủ các trường: name, description, icon, color, image, isActive

3. **Menu đơn giản hơn**:
   - Trước: 2 menu items riêng biệt (DM Thú cưng, DM Sản phẩm)
   - Sau: 1 menu item duy nhất "Danh mục" → mở trang với 2 tabs

---

## 📁 Cấu trúc Files

### Frontend

```
frontend/src/pages/Admin/Category/
├── ListCategory.tsx          ✅ TRANG CHÍNH - Sử dụng trang này
├── AddCategory.tsx           ✅ Đã cập nhật - Trang thêm mới riêng (nếu cần)
├── PetCategories.tsx         ⚠️  Giữ lại để tham khảo (không dùng trong menu)
└── ProductCategories.tsx     ⚠️  Giữ lại để tham khảo (không dùng trong menu)
```

### Backend

```
backend/src/
├── models/Category.js        ✅ Model với type: 'pet' | 'product'
└── routes/category.routes.js ✅ API routes đầy đủ CRUD
```

---

## 🔧 API Endpoints

### GET `/api/category`
Lấy danh sách danh mục

**Query params:**
- `type`: 'pet' hoặc 'product' (optional)
- `isActive`: true/false (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Chó",
      "description": "Các giống chó",
      "type": "pet",
      "icon": "🐕",
      "color": "#6272B6",
      "image": "/uploads/dog.jpg",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET `/api/category/:id`
Lấy chi tiết một danh mục

### POST `/api/category` (Admin only)
Tạo danh mục mới

**Body:**
```json
{
  "name": "Chó",
  "description": "Các giống chó",
  "type": "pet",
  "icon": "🐕",
  "color": "#6272B6",
  "image": "/uploads/dog.jpg",
  "isActive": true
}
```

### PUT `/api/category/:id` (Admin only)
Cập nhật danh mục

### DELETE `/api/category/:id` (Admin only)
Xóa danh mục

---

## 🎨 Giao diện

### Trang ListCategory (`/admin/category`)

**Tính năng:**
- ✅ 2 tabs: "🐾 Danh mục Thú cưng" và "📦 Danh mục Sản phẩm"
- ✅ Bảng hiển thị với các cột: Hình ảnh, Tên, Mô tả, Icon, Màu, Trạng thái, Hành động
- ✅ Nút "Thêm danh mục" cho mỗi tab
- ✅ Modal thêm/sửa với form đầy đủ
- ✅ Xác nhận trước khi xóa
- ✅ Tự động refresh sau khi thêm/sửa/xóa

**Các trường trong form:**
1. **Tên danh mục** (required): Ví dụ: "Chó", "Mèo", "Thức ăn cho chó"
2. **Mô tả**: Mô tả chi tiết về danh mục
3. **Icon**: Emoji icon (🐕, 🐈, 📦, 🧸)
4. **Màu chủ đề**: Mã màu hex (#6272B6) hoặc tên màu (blue, green)
5. **URL hình ảnh**: Link ảnh hoặc đường dẫn local (/uploads/image.jpg)
6. **Trạng thái**: Hoạt động / Tạm dừng

---

## 💡 Hướng dẫn sử dụng

### 1. Thêm danh mục mới

1. Vào menu **"Danh mục"** ở sidebar
2. Chọn tab **"Thú cưng"** hoặc **"Sản phẩm"**
3. Click nút **"Thêm danh mục"**
4. Điền thông tin vào form:
   - Tên danh mục (bắt buộc)
   - Mô tả, icon, màu, hình ảnh (tùy chọn)
   - Chọn trạng thái (mặc định: Hoạt động)
5. Click **"Thêm mới"**

### 2. Sửa danh mục

1. Tìm danh mục cần sửa trong bảng
2. Click nút **✏️ Edit** (màu xanh)
3. Cập nhật thông tin trong form
4. Click **"Cập nhật"**

### 3. Xóa danh mục

1. Tìm danh mục cần xóa
2. Click nút **🗑️ Delete** (màu đỏ)
3. Xác nhận xóa trong popup

⚠️ **Lưu ý**: Không thể xóa danh mục nếu đang có sản phẩm/thú cưng liên kết

### 4. Tạm dừng danh mục

Thay vì xóa, bạn có thể **tạm dừng** danh mục:
1. Click **✏️ Edit**
2. Chọn trạng thái **"Tạm dừng"**
3. Click **"Cập nhật"**

Danh mục tạm dừng sẽ không hiển thị cho người dùng nhưng vẫn giữ dữ liệu.

---

## 🔍 Kiểm tra và Debug

### Kiểm tra API hoạt động

```bash
# Lấy tất cả danh mục pet
curl http://localhost:5000/api/category?type=pet

# Lấy tất cả danh mục product
curl http://localhost:5000/api/category?type=product

# Lấy danh mục đang hoạt động
curl http://localhost:5000/api/category?isActive=true
```

### Kiểm tra trong MongoDB

```javascript
// Xem tất cả categories
db.categories.find().pretty()

// Xem pet categories
db.categories.find({ type: 'pet' }).pretty()

// Xem product categories
db.categories.find({ type: 'product' }).pretty()
```

---

## 🐛 Các lỗi thường gặp

### 1. "Không thể tải danh mục"
**Nguyên nhân**: Backend không chạy hoặc API endpoint sai
**Giải pháp**: 
- Kiểm tra backend đang chạy: `npm start` trong folder `backend`
- Kiểm tra URL API trong `apiClient` config

### 2. "Danh mục này đã tồn tại"
**Nguyên nhân**: Tên danh mục bị trùng trong cùng loại (pet/product)
**Giải pháp**: Đổi tên khác hoặc xóa danh mục cũ

### 3. "Không thể xóa danh mục"
**Nguyên nhân**: Có sản phẩm/thú cưng đang sử dụng danh mục này
**Giải pháp**: 
- Xóa hoặc chuyển sản phẩm/thú cưng sang danh mục khác trước
- Hoặc chỉ tạm dừng danh mục thay vì xóa

### 4. Hình ảnh không hiển thị
**Nguyên nhân**: Đường dẫn ảnh sai
**Giải pháp**:
- Dùng URL đầy đủ: `https://example.com/image.jpg`
- Hoặc đường dẫn local: `/uploads/image.jpg`
- Kiểm tra file ảnh có tồn tại trong folder `backend/uploads`

---

## 📝 Schema Database

```javascript
{
  _id: ObjectId,
  name: String (required, unique per type),
  description: String,
  type: String (enum: ['pet', 'product'], required),
  image: String,
  icon: String,
  color: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ type: 1, isActive: 1 }
{ name: 1, type: 1 } (unique)
```

---

## 🚀 Tính năng tương lai (có thể mở rộng)

- [ ] Upload ảnh trực tiếp thay vì nhập URL
- [ ] Sắp xếp thứ tự hiển thị danh mục
- [ ] Thống kê số lượng sản phẩm/thú cưng theo danh mục
- [ ] Import/Export danh mục từ file Excel
- [ ] Danh mục con (subcategories)

---

## 📞 Liên hệ

Nếu gặp vấn đề, hãy kiểm tra:
1. Console log trong browser (F12)
2. Server log trong terminal backend
3. MongoDB connection status

**Chúc bạn quản lý danh mục thành công! 🎉**
