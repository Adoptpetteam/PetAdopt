# 🎨 PRODUCT VARIANTS SYSTEM - HƯỚNG DẪN

## 📋 Tổng Quan

Hệ thống biến thể sản phẩm cho phép một sản phẩm có nhiều phiên bản khác nhau (size, flavor, weight, age...) mà khách hàng có thể chọn khi mua hàng.

---

## 🏗️ Cấu Trúc Database

### Product Model

```javascript
{
  name: "Thức ăn hạt Royal Canin cho chó",
  price: 150000, // Giá thấp nhất
  quantity: 205, // Tổng số lượng tất cả variants
  hasVariants: true, // Có biến thể
  
  variants: [
    {
      _id: ObjectId,
      name: "1kg - Puppy (Cho chó con)",
      sku: "RC-PUPPY-1KG",
      price: 150000,
      quantity: 50,
      attributes: {
        weight: "1kg",
        age: "Puppy (2-12 tháng)",
        flavor: "Gà & Gạo"
      },
      image: "...",
      isActive: true
    },
    // ... more variants
  ]
}
```

### Order Item Model

```javascript
{
  product: ObjectId,
  name: "Thức ăn hạt Royal Canin cho chó",
  price: 150000,
  quantity: 2,
  
  // Thông tin biến thể đã chọn
  variantId: ObjectId,
  variantName: "1kg - Puppy (Cho chó con)",
  variantAttributes: {
    weight: "1kg",
    age: "Puppy (2-12 tháng)",
    flavor: "Gà & Gạo"
  }
}
```

---

## 📦 Sản Phẩm Đã Seed

### 1. Thức ăn hạt Royal Canin cho chó
**Brand:** Royal Canin  
**Category:** Thức ăn & Dinh dưỡng  
**Variants:** 5

| Variant | SKU | Price | Quantity | Attributes |
|---------|-----|-------|----------|------------|
| 1kg - Puppy | RC-PUPPY-1KG | 150,000đ | 50 | Weight: 1kg, Age: Puppy, Flavor: Gà & Gạo |
| 3kg - Puppy | RC-PUPPY-3KG | 400,000đ | 30 | Weight: 3kg, Age: Puppy, Flavor: Gà & Gạo |
| 1kg - Adult | RC-ADULT-1KG | 180,000đ | 60 | Weight: 1kg, Age: Adult, Flavor: Bò & Rau củ |
| 3kg - Adult | RC-ADULT-3KG | 480,000đ | 40 | Weight: 3kg, Age: Adult, Flavor: Bò & Rau củ |
| 1kg - Senior | RC-SENIOR-1KG | 200,000đ | 25 | Weight: 1kg, Age: Senior, Flavor: Cá hồi & Khoai lang |

### 2. Pate Whiskas cho mèo
**Brand:** Whiskas  
**Category:** Thức ăn & Dinh dưỡng  
**Variants:** 4

| Variant | SKU | Price | Quantity | Attributes |
|---------|-----|-------|----------|------------|
| 80g - Vị cá ngừ | WK-TUNA-80G | 15,000đ | 100 | Weight: 80g, Flavor: Cá ngừ |
| 80g - Vị gà | WK-CHICKEN-80G | 15,000đ | 100 | Weight: 80g, Flavor: Gà |
| 80g - Vị cá hồi | WK-SALMON-80G | 18,000đ | 80 | Weight: 80g, Flavor: Cá hồi |
| 400g - Vị cá ngừ | WK-TUNA-400G | 65,000đ | 50 | Weight: 400g, Flavor: Cá ngừ |

### 3. Snack thưởng cho chó Pedigree Dentastix
**Brand:** Pedigree  
**Category:** Đồ chơi & Huấn luyện  
**Variants:** 4

| Variant | SKU | Price | Quantity | Attributes |
|---------|-----|-------|----------|------------|
| 7 que - Small | PD-DENTA-SMALL-7 | 45,000đ | 60 | Size: Small (5-10kg), Weight: 110g |
| 7 que - Medium | PD-DENTA-MEDIUM-7 | 55,000đ | 50 | Size: Medium (10-25kg), Weight: 180g |
| 7 que - Large | PD-DENTA-LARGE-7 | 65,000đ | 40 | Size: Large (25kg+), Weight: 270g |
| 28 que - Medium | PD-DENTA-MEDIUM-28 | 200,000đ | 20 | Size: Medium, Weight: 720g |

### 4. Sữa tắm cho chó mèo Bio-Groom
**Brand:** Bio-Groom  
**Category:** Vệ sinh & Làm sạch  
**Variants:** 4

| Variant | SKU | Price | Quantity | Attributes |
|---------|-----|-------|----------|------------|
| 250ml - Cho chó | BG-DOG-250ML | 120,000đ | 40 | Weight: 250ml, Flavor: Lavender |
| 500ml - Cho chó | BG-DOG-500ML | 220,000đ | 30 | Weight: 500ml, Flavor: Lavender |
| 250ml - Cho mèo | BG-CAT-250ML | 130,000đ | 35 | Weight: 250ml, Flavor: Baby powder |
| 500ml - Cho mèo | BG-CAT-500ML | 240,000đ | 25 | Weight: 500ml, Flavor: Baby powder |

---

## 🔧 API Endpoints

### Get Product with Variants

```javascript
GET /api/products/:id

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Thức ăn hạt Royal Canin cho chó",
    "price": 150000,
    "quantity": 205,
    "hasVariants": true,
    "variants": [
      {
        "_id": "...",
        "name": "1kg - Puppy",
        "sku": "RC-PUPPY-1KG",
        "price": 150000,
        "quantity": 50,
        "attributes": {
          "weight": "1kg",
          "age": "Puppy",
          "flavor": "Gà & Gạo"
        }
      }
    ]
  }
}
```

### Create Order with Variant

```javascript
POST /api/orders

Body:
{
  "items": [
    {
      "product": "product_id",
      "variantId": "variant_id", // ID của variant đã chọn
      "quantity": 2
    }
  ],
  "shippingAddress": {...},
  "paymentMethod": "COD"
}
```

---

## 💻 Frontend Implementation

### 1. Hiển thị Variants trong Product Detail

```tsx
// ProductDetail.tsx
const [selectedVariant, setSelectedVariant] = useState(null);

{product.hasVariants && (
  <div className="variants-section">
    <h3>Chọn phiên bản:</h3>
    {product.variants.map(variant => (
      <button
        key={variant._id}
        className={selectedVariant?._id === variant._id ? 'selected' : ''}
        onClick={() => setSelectedVariant(variant)}
        disabled={variant.quantity === 0}
      >
        <div>{variant.name}</div>
        <div>{variant.price.toLocaleString()}đ</div>
        {variant.quantity === 0 && <span>Hết hàng</span>}
      </button>
    ))}
  </div>
)}
```

### 2. Add to Cart với Variant

```tsx
const handleAddToCart = () => {
  if (product.hasVariants && !selectedVariant) {
    message.error('Vui lòng chọn phiên bản sản phẩm');
    return;
  }

  const cartItem = {
    product: product._id,
    name: product.name,
    image: selectedVariant?.image || product.image,
    price: selectedVariant?.price || product.price,
    quantity: quantity,
    variantId: selectedVariant?._id,
    variantName: selectedVariant?.name,
    variantAttributes: selectedVariant?.attributes
  };

  addToCart(cartItem);
};
```

### 3. Hiển thị trong Cart

```tsx
// Cart.tsx
{item.variantName && (
  <div className="variant-info">
    <Tag color="blue">{item.variantName}</Tag>
    {item.variantAttributes && (
      <div className="attributes">
        {item.variantAttributes.weight && (
          <span>Trọng lượng: {item.variantAttributes.weight}</span>
        )}
        {item.variantAttributes.flavor && (
          <span>Hương vị: {item.variantAttributes.flavor}</span>
        )}
      </div>
    )}
  </div>
)}
```

---

## 🎯 Use Cases

### 1. Khách hàng mua thức ăn cho chó con
1. Vào trang sản phẩm "Thức ăn hạt Royal Canin"
2. Chọn variant "1kg - Puppy (Cho chó con)"
3. Thêm vào giỏ hàng
4. Checkout → Order sẽ lưu thông tin variant đã chọn

### 2. Admin quản lý tồn kho theo variant
1. Vào trang quản lý sản phẩm
2. Xem số lượng từng variant
3. Cập nhật giá/số lượng cho từng variant riêng biệt

### 3. Khách hàng xem lịch sử đơn hàng
1. Vào "Đơn hàng của tôi"
2. Xem chi tiết đơn hàng
3. Thấy rõ variant đã mua: "1kg - Puppy (Cho chó con)"

---

## 🚀 Commands

### Seed Products with Variants
```bash
cd backend
node src/scripts/seedProductVariants.js
```

### Check Products in Database
```bash
mongosh
use petadopt
db.products.find({ hasVariants: true }).pretty()
```

### Count Variants
```bash
db.products.aggregate([
  { $match: { hasVariants: true } },
  { $project: { name: 1, variantCount: { $size: "$variants" } } }
])
```

---

## ✅ Benefits

1. **Flexible:** Một sản phẩm có nhiều phiên bản
2. **Clear Inventory:** Quản lý tồn kho chính xác cho từng variant
3. **Better UX:** Khách hàng chọn đúng sản phẩm họ cần
4. **Accurate Orders:** Đơn hàng lưu đầy đủ thông tin variant
5. **Easy Management:** Admin dễ dàng quản lý giá và số lượng

---

## 📝 Notes

- Sản phẩm có `hasVariants: true` thì **BẮT BUỘC** phải chọn variant khi mua
- Giá hiển thị trên danh sách là giá **thấp nhất** trong các variants
- Số lượng tổng = tổng số lượng tất cả variants
- Mỗi variant có thể có ảnh riêng hoặc dùng ảnh chung của sản phẩm
- SKU giúp tracking và quản lý kho dễ dàng hơn

---

**Created:** 2026-05-15  
**Status:** ✅ Production Ready
