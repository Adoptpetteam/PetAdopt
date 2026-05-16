# 📋 Danh mục - Quick Reference Card

## 🚀 Truy cập nhanh

```
Menu Admin → Danh mục → /admin/category
```

---

## 📊 Cấu trúc

```
Danh mục
├── Tab 1: 🐾 Danh mục Thú cưng
│   ├── Chó, Mèo, Chim, Thỏ, Hamster...
│   └── [+ Thêm danh mục]
│
└── Tab 2: 📦 Danh mục Sản phẩm
    ├── Thức ăn, Đồ chơi, Phụ kiện...
    └── [+ Thêm danh mục]
```

---

## ⚡ Thao tác nhanh

### Thêm danh mục
```
1. Chọn tab (Pet/Product)
2. Click [+ Thêm danh mục]
3. Điền form → [Thêm mới]
```

### Sửa danh mục
```
1. Tìm danh mục trong bảng
2. Click [✏️ Edit]
3. Sửa thông tin → [Cập nhật]
```

### Xóa danh mục
```
1. Click [🗑️ Delete]
2. Xác nhận → Xóa
```

### Tạm dừng danh mục
```
1. Click [✏️ Edit]
2. Trạng thái → "Tạm dừng"
3. [Cập nhật]
```

---

## 📝 Form Fields

| Field | Required | Example | Note |
|-------|----------|---------|------|
| Tên danh mục | ✅ | "Chó", "Thức ăn" | Unique per type |
| Loại | ✅ | pet/product | Auto-set in ListCategory |
| Mô tả | ❌ | "Các giống chó" | Optional |
| Icon | ❌ | 🐕, 🍖 | Emoji |
| Màu | ❌ | #6272B6, blue | Hex or name |
| Hình ảnh | ❌ | /uploads/dog.jpg | URL or path |
| Trạng thái | ✅ | Hoạt động | Default: true |

---

## 🔌 API Endpoints

```bash
# GET - Lấy danh sách
GET /api/category?type=pet
GET /api/category?type=product
GET /api/category?isActive=true

# GET - Chi tiết
GET /api/category/:id

# POST - Tạo mới (Admin)
POST /api/category
Body: { name, type, description, icon, color, image, isActive }

# PUT - Cập nhật (Admin)
PUT /api/category/:id
Body: { name, description, icon, color, image, isActive }

# DELETE - Xóa (Admin)
DELETE /api/category/:id
```

---

## 🎨 Màu sắc gợi ý

### Pet Categories
```
🐕 Chó:      #6272B6 (blue)
🐈 Mèo:      #10b981 (green)
🐦 Chim:     #f59e0b (yellow)
🐰 Thỏ:      #ec4899 (pink)
🐹 Hamster:  #8b5cf6 (purple)
```

### Product Categories
```
🍖 Thức ăn:   #ef4444 (red)
🧸 Đồ chơi:   #8b5cf6 (purple)
🏠 Phụ kiện:  #f97316 (orange)
💊 Y tế:      #10b981 (green)
🛁 Vệ sinh:   #06b6d4 (cyan)
```

---

## 🐛 Troubleshooting

### "Không thể tải danh mục"
```bash
# Kiểm tra backend
cd backend
npm start

# Kiểm tra MongoDB
mongosh
> use petadopt
> db.categories.find()
```

### "Danh mục đã tồn tại"
```
→ Tên bị trùng trong cùng loại
→ Đổi tên hoặc xóa danh mục cũ
```

### "Không thể xóa"
```
→ Có sản phẩm/pet đang dùng
→ Xóa/chuyển chúng trước
→ Hoặc chỉ "Tạm dừng"
```

### Hình ảnh không hiển thị
```
→ Kiểm tra URL đúng format
→ File tồn tại trong /uploads
→ Hoặc dùng URL đầy đủ
```

---

## 💡 Tips & Tricks

### 1. Sử dụng Icon Emoji
```
Windows: Win + .
Mac: Cmd + Ctrl + Space
Web: https://emojipedia.org
```

### 2. Chọn màu đẹp
```
Coolors: https://coolors.co
Flat UI Colors: https://flatuicolors.com
```

### 3. Tìm hình ảnh
```
Unsplash: https://unsplash.com
Pexels: https://pexels.com
```

### 4. Tạm dừng thay vì xóa
```
✅ Giữ dữ liệu
✅ Có thể kích hoạt lại
✅ Không ảnh hưởng sản phẩm cũ
```

### 5. Đặt tên rõ ràng
```
✅ "Thức ăn cho chó"
✅ "Đồ chơi cho mèo"
❌ "Đồ ăn"
❌ "Đồ chơi"
```

---

## 📊 Database Schema

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "Chó",
  description: "Các giống chó",
  type: "pet",
  icon: "🐕",
  color: "#6272B6",
  image: "/uploads/dog.jpg",
  isActive: true,
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

---

## 🔐 Permissions

| Action | User | Admin |
|--------|------|-------|
| Xem danh mục | ✅ | ✅ |
| Thêm danh mục | ❌ | ✅ |
| Sửa danh mục | ❌ | ✅ |
| Xóa danh mục | ❌ | ✅ |

---

## 📱 Responsive

```
Desktop: Full table với tất cả columns
Tablet:  Ẩn một số columns
Mobile:  Card view thay vì table
```

---

## 🎯 Best Practices

### ✅ DO
- Đặt tên rõ ràng, dễ hiểu
- Thêm mô tả chi tiết
- Sử dụng icon và màu phù hợp
- Tạm dừng thay vì xóa
- Kiểm tra trước khi xóa

### ❌ DON'T
- Đặt tên trùng lặp
- Bỏ trống mô tả
- Xóa danh mục đang dùng
- Dùng màu không phù hợp
- Quên backup trước khi xóa

---

## 📞 Support

### Files liên quan
```
Frontend:
- ListCategory.tsx
- AddCategory.tsx
- AdminLayout.tsx

Backend:
- Category.js (model)
- category.routes.js

Docs:
- CATEGORY_MANAGEMENT_GUIDE.md
- CATEGORY_FIX_SUMMARY.md
- CATEGORY_BEFORE_AFTER.md
```

### Kiểm tra logs
```bash
# Frontend console
F12 → Console

# Backend logs
cd backend
npm start
# Xem terminal output
```

---

## 🚀 Keyboard Shortcuts

```
Ctrl + F: Tìm kiếm trong bảng
Enter:    Submit form
Esc:      Đóng modal
Tab:      Chuyển field
```

---

## 📈 Statistics

```
Tổng danh mục:     db.categories.countDocuments()
Pet categories:    db.categories.countDocuments({type:'pet'})
Product categories: db.categories.countDocuments({type:'product'})
Active categories:  db.categories.countDocuments({isActive:true})
```

---

## ✨ Quick Commands

### MongoDB
```javascript
// Xem tất cả
db.categories.find().pretty()

// Xem pet
db.categories.find({type:'pet'}).pretty()

// Xem product
db.categories.find({type:'product'}).pretty()

// Xem active
db.categories.find({isActive:true}).pretty()

// Đếm
db.categories.countDocuments()

// Xóa tất cả (NGUY HIỂM!)
// db.categories.deleteMany({})
```

### cURL
```bash
# GET all pet categories
curl http://localhost:5000/api/category?type=pet

# GET all product categories
curl http://localhost:5000/api/category?type=product

# GET active categories
curl http://localhost:5000/api/category?isActive=true
```

---

## 🎓 Learning Resources

- [Ant Design Table](https://ant.design/components/table)
- [Ant Design Tabs](https://ant.design/components/tabs)
- [Ant Design Form](https://ant.design/components/form)
- [MongoDB Queries](https://docs.mongodb.com/manual/tutorial/query-documents/)
- [Express Routes](https://expressjs.com/en/guide/routing.html)

---

**📌 Bookmark trang này để tham khảo nhanh!**
