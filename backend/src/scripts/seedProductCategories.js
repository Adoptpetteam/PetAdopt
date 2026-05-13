const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pawpalace');

// Category schema (assuming it exists)
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  icon: String,
  color: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

const categories = [
  {
    name: "Thức ăn & Dinh dưỡng",
    description: "Thức ăn chính, bánh thưởng, dinh dưỡng bổ sung cho thú cưng",
    icon: "🍖",
    color: "#ff6b35"
  },
  {
    name: "Chăm sóc sức khỏe & Y tế", 
    description: "Thuốc đặc trị, thực phẩm chức năng, y tế cơ bản",
    icon: "🏥",
    color: "#4ecdc4"
  },
  {
    name: "Vệ sinh & Làm sạch",
    description: "Cát mèo, khay vệ sinh, kiểm soát mùi, vệ sinh khác",
    icon: "🧽",
    color: "#45b7d1"
  },
  {
    name: "Chăm sóc sắc đẹp",
    description: "Dụng cụ làm lông/móng, mỹ phẩm cho thú cưng",
    icon: "✨",
    color: "#f093fb"
  },
  {
    name: "Đồ dùng sinh hoạt & Chỗ ở",
    description: "Chỗ ngủ, bát ăn, nội thất thú cưng",
    icon: "🏠",
    color: "#feca57"
  },
  {
    name: "Phụ kiện đi dạo & Vận chuyển",
    description: "Vòng cổ, dây dắt, balo vận chuyển, thời trang",
    icon: "🚶",
    color: "#48dbfb"
  },
  {
    name: "Đồ chơi & Huấn luyện",
    description: "Đồ chơi giải trí, dụng cụ huấn luyện",
    icon: "🎾",
    color: "#ff9ff3"
  }
];

async function seedCategories() {
  try {
    console.log('🗑️  Xóa categories cũ...');
    await Category.deleteMany({});
    
    console.log('📦 Tạo categories mới...');
    const created = await Category.insertMany(categories);
    
    console.log(`✅ Đã tạo ${created.length} categories:`);
    created.forEach(cat => {
      console.log(`   ${cat.icon} ${cat.name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

seedCategories();