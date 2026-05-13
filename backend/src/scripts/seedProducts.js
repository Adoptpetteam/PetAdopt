const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pawpalace');

// Product schema (assuming it exists)
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
  category: String,
  image: String,
  brand: String,
  weight: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

const products = [
  // 1. THỨC ĂN & DINH DƯỠNG
  {
    name: "Royal Canin Adult - Thức ăn hạt khô cho chó trưởng thành",
    description: "Thức ăn cao cấp dành cho chó trưởng thành từ 1-7 tuổi. Công thức cân bằng dinh dưỡng, hỗ trợ tiêu hóa và tăng cường miễn dịch.",
    price: 450000,
    quantity: 50,
    category: "Thức ăn & Dinh dưỡng",
    image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400",
    brand: "Royal Canin",
    weight: "2kg"
  },
  {
    name: "Whiskas Pate - Thức ăn ướt cho mèo vị cá ngừ",
    description: "Pate mềm mịn với hương vị cá ngừ thơm ngon, bổ sung đầy đủ vitamin và khoáng chất cho mèo mọi lứa tuổi.",
    price: 25000,
    quantity: 100,
    category: "Thức ăn & Dinh dưỡng", 
    image: "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=400",
    brand: "Whiskas",
    weight: "85g"
  },
  {
    name: "Bánh thưởng Dentastix - Xương gặm sạch răng cho chó",
    description: "Bánh thưởng đặc biệt giúp làm sạch răng, giảm cao răng và hơi thở có mùi. Hương vị thịt gà hấp dẫn.",
    price: 85000,
    quantity: 75,
    category: "Thức ăn & Dinh dưỡng",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
    brand: "Pedigree",
    weight: "180g"
  },
  {
    name: "Cỏ mèo tươi - Hỗ trợ tiêu hóa tự nhiên",
    description: "Cỏ mèo tươi giúp mèo nôn lông, hỗ trợ tiêu hóa và bổ sung chất xơ tự nhiên. Trồng sẵn trong chậu tiện lợi.",
    price: 35000,
    quantity: 30,
    category: "Thức ăn & Dinh dưỡng",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
    brand: "Pet Grass",
    weight: "1 chậu"
  },

  // 2. CHĂM SÓC SỨC KHỎE & Y TẾ
  {
    name: "Thuốc tẩy giun Drontal Plus - Cho chó mèo",
    description: "Thuốc tẩy giun phổ rộng, hiệu quả cao chống lại giun đũa, giun móc, giun dây. An toàn cho thú cưng từ 2 tháng tuổi.",
    price: 120000,
    quantity: 40,
    category: "Chăm sóc sức khỏe & Y tế",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400",
    brand: "Bayer",
    weight: "1 viên"
  },
  {
    name: "Vitamin tổng hợp Nutri-Cal - Gel dinh dưỡng",
    description: "Gel dinh dưỡng cao năng lượng, bổ sung vitamin và khoáng chất thiết yếu. Phù hợp cho thú cưng ốm yếu, kén ăn.",
    price: 180000,
    quantity: 25,
    category: "Chăm sóc sức khỏe & Y tế",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
    brand: "Tomlyn",
    weight: "120ml"
  },
  {
    name: "Nước rửa tai Epi-Otic - Vệ sinh tai cho chó mèo",
    description: "Dung dịch rửa tai chuyên dụng, làm sạch ráy tai, khử mùi hôi và ngăn ngừa viêm nhiễm tai hiệu quả.",
    price: 95000,
    quantity: 60,
    category: "Chăm sóc sức khỏe & Y tế",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400",
    brand: "Virbac",
    weight: "125ml"
  },

  // 3. VỆ SINH & LÀM SẠCH
  {
    name: "Cát mèo Ever Clean - Khử mùi siêu mạnh",
    description: "Cát mèo cao cấp với công nghệ khử mùi 24/7, vón cục nhanh, dễ dọn dẹp. Không bụi, an toàn cho hô hấp.",
    price: 320000,
    quantity: 35,
    category: "Vệ sinh & Làm sạch",
    image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400",
    brand: "Ever Clean",
    weight: "10kg"
  },
  {
    name: "Khay vệ sinh mèo có nắp đậy - Size lớn",
    description: "Khay vệ sinh kín đáo với nắp đậy, giảm mùi hôi và tung tóe cát. Thiết kế hiện đại, dễ vệ sinh.",
    price: 450000,
    quantity: 20,
    category: "Vệ sinh & Làm sạch",
    image: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400",
    brand: "Petmate",
    weight: "2.5kg"
  },
  {
    name: "Xịt khử mùi Pet Odor Eliminator - Khử mùi thú cưng",
    description: "Xịt khử mùi sinh học, phân hủy hoàn toàn mùi hôi từ nước tiểu, phân và mùi cơ thể thú cưng. An toàn, không độc hại.",
    price: 75000,
    quantity: 80,
    category: "Vệ sinh & Làm sạch",
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400",
    brand: "Nature's Miracle",
    weight: "500ml"
  },

  // 4. CHĂM SÓC SẮC ĐẸP
  {
    name: "Lược chải lông FURminator - Giảm rụng lông 90%",
    description: "Lược chải lông chuyên nghiệp, loại bỏ lông chết và lông rụng hiệu quả. Thiết kế ergonomic, thoải mái sử dụng.",
    price: 650000,
    quantity: 15,
    category: "Chăm sóc sắc đẹp",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
    brand: "FURminator",
    weight: "200g"
  },
  {
    name: "Sữa tắm Bio-Groom - Dành cho lông nhạy cảm",
    description: "Sữa tắm cao cấp với thành phần tự nhiên, dịu nhẹ cho da nhạy cảm. Tạo bọt mịn, làm sạch sâu và mượt lông.",
    price: 180000,
    quantity: 45,
    category: "Chăm sóc sắc đẹp",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    brand: "Bio-Groom",
    weight: "355ml"
  },
  {
    name: "Kìm cắt móng Millers Forge - Chuyên nghiệp",
    description: "Kìm cắt móng chất lượng cao với lưỡi cắt sắc bén, an toàn. Tay cầm chống trượt, dễ kiểm soát lực cắt.",
    price: 220000,
    quantity: 30,
    category: "Chăm sóc sắc đẹp",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
    brand: "Millers Forge",
    weight: "150g"
  },

  // 5. ĐỒ DÙNG SINH HOẠT & CHỖ Ở
  {
    name: "Nệm ngủ Memory Foam - Chống thấm nước",
    description: "Nệm ngủ cao cấp với lớp đệm memory foam, ôm sát cơ thể, giảm áp lực lên khớp. Vỏ chống thấm, có thể giặt máy.",
    price: 850000,
    quantity: 12,
    category: "Đồ dùng sinh hoạt & Chỗ ở",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
    brand: "PetFusion",
    weight: "3kg"
  },
  {
    name: "Bát ăn inox đôi có chân đế - Chống trượt",
    description: "Bộ bát ăn inox 304 cao cấp với chân đế chống trượt. Thiết kế nghiêng 15 độ, giúp thú cưng ăn uống thoải mái hơn.",
    price: 280000,
    quantity: 40,
    category: "Đồ dùng sinh hoạt & Chỗ ở",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400",
    brand: "Neater Feeder",
    weight: "1.2kg"
  },
  {
    name: "Cây cào móng Cat Tree - 5 tầng cao cấp",
    description: "Cây cào móng đa tầng với nhiều khu vực vui chơi, nghỉ ngơi. Bọc sisal tự nhiên, ổ ngủ mềm mại, đồ chơi lắc lư.",
    price: 1200000,
    quantity: 8,
    category: "Đồ dùng sinh hoạt & Chỗ ở",
    image: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400",
    brand: "Go Pet Club",
    weight: "25kg"
  },

  // 6. PHỤ KIỆN ĐI DẠO & VẬN CHUYỂN
  {
    name: "Dây dắt Flexi - Dây rút tự động 5m",
    description: "Dây dắt tự động cao cấp với hệ thống phanh một chạm. Dây dù bền chắc, tay cầm ergonomic chống mỏi tay.",
    price: 380000,
    quantity: 25,
    category: "Phụ kiện đi dạo & Vận chuyển",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
    brand: "Flexi",
    weight: "300g"
  },
  {
    name: "Balo phi hành gia - Cửa sổ trong suốt",
    description: "Balo vận chuyển thú cưng với cửa sổ trong suốt, lỗ thông khí 360 độ. Thiết kế chắc chắn, thoải mái cho cả chủ và thú cưng.",
    price: 750000,
    quantity: 18,
    category: "Phụ kiện đi dạo & Vận chuyển",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400",
    brand: "U-pet",
    weight: "1.8kg"
  },
  {
    name: "Áo hoodie cho chó - Chống nước, giữ ấm",
    description: "Áo hoodie thời trang với lớp lót giữ ấm, bề mặt chống nước nhẹ. Thiết kế năng động, phù hợp mọi hoạt động ngoài trời.",
    price: 150000,
    quantity: 50,
    category: "Phụ kiện đi dạo & Vận chuyển",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
    brand: "Ruffwear",
    weight: "200g"
  },

  // 7. ĐỒ CHƠI & HUẤN LUYỆN
  {
    name: "Cần câu mèo tự động - Chuyển động thông minh",
    description: "Đồ chơi tự động với cảm biến chuyển động, kích thích bản năng săn mồi của mèo. Pin sạc USB, hoạt động 2-3 tiếng liên tục.",
    price: 420000,
    quantity: 22,
    category: "Đồ chơi & Huấn luyện",
    image: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400",
    brand: "PetSafe",
    weight: "500g"
  },
  {
    name: "Bóng cao su Kong Classic - Siêu bền",
    description: "Bóng cao su tự nhiên siêu bền, nảy tốt, có thể nhồi thức ăn bên trong. Giúp làm sạch răng và giải tỏa stress.",
    price: 180000,
    quantity: 60,
    category: "Đồ chơi & Huấn luyện",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
    brand: "Kong",
    weight: "150g"
  },
  {
    name: "Clicker huấn luyện + Túi đựng thưởng",
    description: "Bộ dụng cụ huấn luyện chuyên nghiệp gồm clicker âm thanh rõ ràng và túi đựng thưởng tiện lợi. Phương pháp huấn luyện tích cực.",
    price: 85000,
    quantity: 45,
    category: "Đồ chơi & Huấn luyện",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400",
    brand: "StarMark",
    weight: "100g"
  }
];

async function seedProducts() {
  try {
    console.log('🗑️  Xóa sản phẩm cũ...');
    await Product.deleteMany({});
    
    console.log('📦 Tạo sản phẩm mới...');
    const created = await Product.insertMany(products);
    
    console.log(`✅ Đã tạo ${created.length} sản phẩm:`);
    
    // Group by category
    const byCategory = created.reduce((acc, product) => {
      if (!acc[product.category]) acc[product.category] = [];
      acc[product.category].push(product);
      return acc;
    }, {});
    
    Object.entries(byCategory).forEach(([category, products]) => {
      console.log(`\n📂 ${category} (${products.length} sản phẩm):`);
      products.forEach(p => {
        console.log(`   • ${p.name} - ${p.price.toLocaleString()}đ`);
      });
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

seedProducts();