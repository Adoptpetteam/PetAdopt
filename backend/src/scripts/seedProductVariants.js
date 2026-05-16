const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const productsWithVariants = [
  {
    name: 'Thức ăn hạt Royal Canin cho chó',
    description: 'Thức ăn cao cấp Royal Canin dành cho chó mọi lứa tuổi, giúp tăng cường sức khỏe và hệ tiêu hóa',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500',
    category: 'Thức ăn & Dinh dưỡng',
    brand: 'Royal Canin',
    price: 150000, // Giá thấp nhất
    quantity: 0, // Sẽ tự động tính
    hasVariants: true,
    variants: [
      {
        name: '1kg - Puppy (Cho chó con)',
        sku: 'RC-PUPPY-1KG',
        price: 150000,
        quantity: 50,
        attributes: {
          weight: '1kg',
          age: 'Puppy (2-12 tháng)',
          flavor: 'Gà & Gạo'
        },
        image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500'
      },
      {
        name: '3kg - Puppy (Cho chó con)',
        sku: 'RC-PUPPY-3KG',
        price: 400000,
        quantity: 30,
        attributes: {
          weight: '3kg',
          age: 'Puppy (2-12 tháng)',
          flavor: 'Gà & Gạo'
        }
      },
      {
        name: '1kg - Adult (Cho chó trưởng thành)',
        sku: 'RC-ADULT-1KG',
        price: 180000,
        quantity: 60,
        attributes: {
          weight: '1kg',
          age: 'Adult (1-7 tuổi)',
          flavor: 'Bò & Rau củ'
        }
      },
      {
        name: '3kg - Adult (Cho chó trưởng thành)',
        sku: 'RC-ADULT-3KG',
        price: 480000,
        quantity: 40,
        attributes: {
          weight: '3kg',
          age: 'Adult (1-7 tuổi)',
          flavor: 'Bò & Rau củ'
        }
      },
      {
        name: '1kg - Senior (Cho chó già)',
        sku: 'RC-SENIOR-1KG',
        price: 200000,
        quantity: 25,
        attributes: {
          weight: '1kg',
          age: 'Senior (7+ tuổi)',
          flavor: 'Cá hồi & Khoai lang'
        }
      }
    ]
  },
  {
    name: 'Pate Whiskas cho mèo',
    description: 'Pate mềm Whiskas với nhiều hương vị thơm ngon, bổ dưỡng cho mèo',
    image: 'https://images.unsplash.com/photo-1589883661923-6476cb0ae9f2?w=500',
    category: 'Thức ăn & Dinh dưỡng',
    brand: 'Whiskas',
    price: 15000,
    quantity: 0,
    hasVariants: true,
    variants: [
      {
        name: 'Gói 80g - Vị cá ngừ',
        sku: 'WK-TUNA-80G',
        price: 15000,
        quantity: 100,
        attributes: {
          weight: '80g',
          flavor: 'Cá ngừ',
          age: 'Adult'
        }
      },
      {
        name: 'Gói 80g - Vị gà',
        sku: 'WK-CHICKEN-80G',
        price: 15000,
        quantity: 100,
        attributes: {
          weight: '80g',
          flavor: 'Gà',
          age: 'Adult'
        }
      },
      {
        name: 'Gói 80g - Vị cá hồi',
        sku: 'WK-SALMON-80G',
        price: 18000,
        quantity: 80,
        attributes: {
          weight: '80g',
          flavor: 'Cá hồi',
          age: 'Adult'
        }
      },
      {
        name: 'Hộp 400g - Vị cá ngừ',
        sku: 'WK-TUNA-400G',
        price: 65000,
        quantity: 50,
        attributes: {
          weight: '400g',
          flavor: 'Cá ngừ',
          age: 'Adult'
        }
      }
    ]
  },
  {
    name: 'Snack thưởng cho chó Pedigree Dentastix',
    description: 'Snack làm sạch răng, giảm mảng bám và hơi thở thơm mát',
    image: 'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=500',
    category: 'Đồ chơi & Huấn luyện',
    brand: 'Pedigree',
    price: 45000,
    quantity: 0,
    hasVariants: true,
    variants: [
      {
        name: 'Gói 7 que - Size nhỏ (5-10kg)',
        sku: 'PD-DENTA-SMALL-7',
        price: 45000,
        quantity: 60,
        attributes: {
          size: 'Small',
          weight: '110g',
          age: 'Adult'
        }
      },
      {
        name: 'Gói 7 que - Size vừa (10-25kg)',
        sku: 'PD-DENTA-MEDIUM-7',
        price: 55000,
        quantity: 50,
        attributes: {
          size: 'Medium',
          weight: '180g',
          age: 'Adult'
        }
      },
      {
        name: 'Gói 7 que - Size lớn (25kg+)',
        sku: 'PD-DENTA-LARGE-7',
        price: 65000,
        quantity: 40,
        attributes: {
          size: 'Large',
          weight: '270g',
          age: 'Adult'
        }
      },
      {
        name: 'Hộp 28 que - Size vừa (10-25kg)',
        sku: 'PD-DENTA-MEDIUM-28',
        price: 200000,
        quantity: 20,
        attributes: {
          size: 'Medium',
          weight: '720g',
          age: 'Adult'
        }
      }
    ]
  },
  {
    name: 'Sữa tắm cho chó mèo Bio-Groom',
    description: 'Sữa tắm cao cấp Bio-Groom, an toàn cho da nhạy cảm',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500',
    category: 'Vệ sinh & Làm sạch',
    brand: 'Bio-Groom',
    price: 120000,
    quantity: 0,
    hasVariants: true,
    variants: [
      {
        name: '250ml - Dành cho chó',
        sku: 'BG-DOG-250ML',
        price: 120000,
        quantity: 40,
        attributes: {
          weight: '250ml',
          flavor: 'Hương lavender',
          age: 'All ages'
        }
      },
      {
        name: '500ml - Dành cho chó',
        sku: 'BG-DOG-500ML',
        price: 220000,
        quantity: 30,
        attributes: {
          weight: '500ml',
          flavor: 'Hương lavender',
          age: 'All ages'
        }
      },
      {
        name: '250ml - Dành cho mèo',
        sku: 'BG-CAT-250ML',
        price: 130000,
        quantity: 35,
        attributes: {
          weight: '250ml',
          flavor: 'Hương baby powder',
          age: 'All ages'
        }
      },
      {
        name: '500ml - Dành cho mèo',
        sku: 'BG-CAT-500ML',
        price: 240000,
        quantity: 25,
        attributes: {
          weight: '500ml',
          flavor: 'Hương baby powder',
          age: 'All ages'
        }
      }
    ]
  }
];

async function seedProductVariants() {
  try {
    console.log('🌱 Seeding products with variants...\n');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/petadopt');
    console.log('✅ Connected to MongoDB\n');

    // Xóa sản phẩm cũ có variants (nếu có)
    const oldProducts = await Product.find({ hasVariants: true });
    if (oldProducts.length > 0) {
      await Product.deleteMany({ hasVariants: true });
      console.log(`🗑️  Deleted ${oldProducts.length} old products with variants\n`);
    }

    // Thêm sản phẩm mới
    console.log('📦 Creating products with variants...\n');
    
    for (const productData of productsWithVariants) {
      const product = await Product.create(productData);
      console.log(`✅ Created: ${product.name}`);
      console.log(`   - Variants: ${product.variants.length}`);
      console.log(`   - Total quantity: ${product.quantity}`);
      console.log(`   - Price range: ${product.price.toLocaleString()}đ - ${product.maxPrice.toLocaleString()}đ\n`);
    }

    console.log('✅ Seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Products created: ${productsWithVariants.length}`);
    console.log(`   - Total variants: ${productsWithVariants.reduce((sum, p) => sum + p.variants.length, 0)}`);

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedProductVariants();
