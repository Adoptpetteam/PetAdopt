const mongoose = require('mongoose');
const Category = require('../models/Category');

// Load environment variables
require('dotenv').config();

const productCategories = [
  {
    name: 'Thức ăn & Dinh dưỡng',
    description: 'Thức ăn khô, ướt, snack và các sản phẩm dinh dưỡng cho thú cưng',
    type: 'product',
    isActive: true
  },
  {
    name: 'Đồ chơi & Huấn luyện',
    description: 'Đồ chơi giải trí, dụng cụ huấn luyện và phát triển trí tuệ cho thú cưng',
    type: 'product',
    isActive: true
  },
  {
    name: 'Chăm sóc sức khỏe & Y tế',
    description: 'Thuốc, vitamin, dụng cụ y tế và sản phẩm chăm sóc sức khỏe',
    type: 'product',
    isActive: true
  },
  {
    name: 'Vệ sinh & Làm sạch',
    description: 'Cát vệ sinh, khay toilet, sản phẩm tắm gội và vệ sinh môi trường',
    type: 'product',
    isActive: true
  },
  {
    name: 'Chăm sóc sắc đẹp',
    description: 'Dụng cụ chải lông, cắt móng, tắm gội và làm đẹp cho thú cưng',
    type: 'product',
    isActive: true
  },
  {
    name: 'Đồ dùng sinh hoạt & Chỗ ở',
    description: 'Chuồng, lồng, giường, chăn đệm và đồ dùng sinh hoạt hàng ngày',
    type: 'product',
    isActive: true
  },
  {
    name: 'Phụ kiện thời trang',
    description: 'Vòng cổ, dây dắt, quần áo và phụ kiện thời trang cho thú cưng',
    type: 'product',
    isActive: true
  },
  {
    name: 'Thiết bị công nghệ',
    description: 'Camera giám sát, GPS tracker, máy cho ăn tự động và thiết bị thông minh',
    type: 'product',
    isActive: true
  },
  {
    name: 'Dụng cụ vận chuyển',
    description: 'Túi xách, ba lô, lồng vận chuyển và phụ kiện đi du lịch',
    type: 'product',
    isActive: true
  },
  {
    name: 'Sản phẩm đặc biệt',
    description: 'Sản phẩm cao cấp, limited edition và các món đồ đặc biệt khác',
    type: 'product',
    isActive: true
  }
];

const petCategories = [
  {
    name: 'Chó',
    description: 'Các giống chó từ nhỏ đến lớn, thân thiện và trung thành',
    type: 'pet',
    isActive: true
  },
  {
    name: 'Mèo',
    description: 'Các giống mèo dễ thương, độc lập và tình cảm',
    type: 'pet',
    isActive: true
  },
  {
    name: 'Chim',
    description: 'Các loài chim cảnh xinh đẹp và thông minh',
    type: 'pet',
    isActive: true
  },
  {
    name: 'Cá cảnh',
    description: 'Các loài cá cảnh đẹp mắt và dễ chăm sóc',
    type: 'pet',
    isActive: true
  },
  {
    name: 'Thú nhỏ',
    description: 'Hamster, thỏ, chuột lang và các thú nhỏ khác',
    type: 'pet',
    isActive: true
  }
];

async function seedProductCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Xóa tất cả danh mục cũ (cả pet và product)
    const deleteResult = await Category.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} old categories`);

    // Thêm danh mục pet trước
    const createdPetCategories = await Category.insertMany(petCategories);
    console.log(`✅ Created ${createdPetCategories.length} pet categories:`);
    createdPetCategories.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category.name} (${category.type})`);
    });

    // Thêm danh mục sản phẩm
    const createdProductCategories = await Category.insertMany(productCategories);
    console.log(`✅ Created ${createdProductCategories.length} product categories:`);
    createdProductCategories.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category.name} (${category.type})`);
    });

    console.log('\n🎉 All categories seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding product categories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeder
if (require.main === module) {
  seedProductCategories();
}

module.exports = { seedProductCategories, productCategories, petCategories };