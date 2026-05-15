const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/petadopt');
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('products');

    // Xóa toàn bộ collection và tạo lại
    console.log('🗑️  Dropping products collection...');
    try {
      await collection.drop();
      console.log('✅ Dropped products collection');
    } catch (err) {
      console.log('ℹ️  Collection không tồn tại, bỏ qua');
    }

    // Tạo lại collection với schema mới
    console.log('📦 Creating new products collection...');
    await db.createCollection('products');

    // Tạo các index cần thiết
    console.log('📋 Creating indexes...');
    await collection.createIndex({ name: 'text' });
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ price: 1 });
    
    console.log('✅ All done! Collection và indexes đã được tạo lại.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

fixIndexes();
