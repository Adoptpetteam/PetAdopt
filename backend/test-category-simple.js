require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');

async function testCategory() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');
    
    // Test tạo category trực tiếp
    console.log('Creating test category...');
    const category = await Category.create({
      name: 'Test Direct ' + Date.now(),
      description: 'Test description',
      type: 'pet',
      icon: '🐕',
      color: '#6272B6',
      isActive: true
    });
    
    console.log('✅ Category created successfully!');
    console.log('Category:', category);
    
    // Xóa category test
    await Category.findByIdAndDelete(category._id);
    console.log('\n✅ Test category deleted');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testCategory();
