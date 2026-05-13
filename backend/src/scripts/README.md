# 📦 Scripts Seed Database

Thư mục này chứa các script để khởi tạo dữ liệu mẫu cho hệ thống Pet Adopt.

## 🚀 Các Script Có Sẵn

### 1. `seedProductCategories.js`
Tạo 7 danh mục sản phẩm chuyên nghiệp:
- 🍖 Thức ăn & Dinh dưỡng
- 🏥 Chăm sóc sức khỏe & Y tế  
- 🧽 Vệ sinh & Làm sạch
- ✨ Chăm sóc sắc đẹp
- 🏠 Đồ dùng sinh hoạt & Chỗ ở
- 🚶 Phụ kiện đi dạo & Vận chuyển
- 🎾 Đồ chơi & Huấn luyện

### 2. `seedProducts.js`
Tạo 22 sản phẩm chuyên nghiệp với thông tin chi tiết:
- Tên sản phẩm chuyên nghiệp
- Mô tả chi tiết
- Giá cả hợp lý
- Thương hiệu nổi tiếng
- Hình ảnh chất lượng cao

### 3. `seedCategories.js`
Script cũ cho danh mục thú cưng

### 4. `seedPets.js`
Script tạo dữ liệu thú cưng mẫu

### 5. `fixProductIndex.js` & `fixProductIndexStrong.js`
Script sửa lỗi index database

## 🔧 Cách Sử Dụng

```bash
# Chạy từ thư mục backend
cd backend

# Tạo categories trước
node src/scripts/seedProductCategories.js

# Sau đó tạo products
node src/scripts/seedProducts.js
```

## ⚠️ Lưu Ý
- Script sẽ **XÓA** toàn bộ dữ liệu cũ trước khi tạo mới
- Đảm bảo database đang chạy trước khi thực thi
- Kiểm tra file `.env` để đảm bảo connection string đúng