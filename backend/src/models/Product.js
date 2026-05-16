const mongoose = require('mongoose');

// Variant Schema - Biến thể sản phẩm
const variantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // Ví dụ: "1kg - Vị gà"
  sku: { type: String, trim: true }, // Mã SKU riêng cho variant
  price: { type: Number, required: true, min: 0 }, // Giá riêng cho variant
  quantity: { type: Number, required: true, min: 0, default: 0 }, // Số lượng riêng
  
  // Thuộc tính biến thể
  attributes: {
    size: { type: String, trim: true }, // Ví dụ: "1kg", "5kg", "10kg"
    weight: { type: String, trim: true }, // Trọng lượng: "1kg", "500g"
    flavor: { type: String, trim: true }, // Hương vị: "Gà", "Bò", "Cá hồi"
    color: { type: String, trim: true }, // Màu sắc (nếu cần)
    age: { type: String, trim: true }, // Độ tuổi: "Puppy", "Adult", "Senior"
  },
  
  image: { type: String, trim: true }, // Ảnh riêng cho variant (optional)
  isActive: { type: Boolean, default: true }, // Có đang bán không
}, { _id: true });

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 }, // Giá gốc/giá thấp nhất
    image: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0, default: 0 }, // Tổng số lượng
    description: { type: String, trim: true },
    category: { type: String, trim: true },
    brand: { type: String, trim: true },
    
    // Product Variants - Biến thể sản phẩm
    hasVariants: { type: Boolean, default: false }, // Có biến thể không
    variants: [variantSchema], // Mảng các biến thể
    
    // Rating & Reviews
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    
    totalReviews: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

// Indexes
productSchema.index({ name: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'variants.sku': 1 });

// Virtual: Tính tổng số lượng từ variants
productSchema.virtual('totalQuantity').get(function() {
  if (this.hasVariants && this.variants.length > 0) {
    return this.variants.reduce((sum, variant) => sum + variant.quantity, 0);
  }
  return this.quantity;
});

// Virtual: Giá thấp nhất từ variants
productSchema.virtual('minPrice').get(function() {
  if (this.hasVariants && this.variants.length > 0) {
    const prices = this.variants.map(v => v.price);
    return Math.min(...prices);
  }
  return this.price;
});

// Virtual: Giá cao nhất từ variants
productSchema.virtual('maxPrice').get(function() {
  if (this.hasVariants && this.variants.length > 0) {
    const prices = this.variants.map(v => v.price);
    return Math.max(...prices);
  }
  return this.price;
});

// Middleware: Cập nhật quantity và price khi có variants
productSchema.pre('save', async function() {
  if (this.hasVariants && this.variants.length > 0) {
    // Tính tổng quantity
    this.quantity = this.variants.reduce((sum, variant) => sum + variant.quantity, 0);
    
    // Lấy giá thấp nhất
    const prices = this.variants.map(v => v.price);
    this.price = Math.min(...prices);
  }
});

module.exports = mongoose.model('Product', productSchema);

