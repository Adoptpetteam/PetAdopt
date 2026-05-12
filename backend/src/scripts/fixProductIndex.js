/**
 * Script xóa index cũ `id_1` trên collection products
 * Chạy: node src/scripts/fixProductIndex.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');

async function fix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('products');

    // Liệt kê tất cả index hiện tại
    const indexes = await collection.indexes();
    console.log('\n📋 Indexes hiện tại:');
    indexes.forEach(idx => console.log(' -', idx.name, JSON.stringify(idx.key)));

    // Xóa index id_1 nếu tồn tại
    const hasIdIndex = indexes.some(idx => idx.name === 'id_1');
    if (hasIdIndex) {
      await collection.dropIndex('id_1');
      console.log('\n✅ Đã xóa index id_1 thành công!');
    } else {
      console.log('\nℹ️  Không tìm thấy index id_1, không cần xóa.');
    }

    // Liệt kê lại sau khi xóa
    const newIndexes = await collection.indexes();
    console.log('\n📋 Indexes sau khi fix:');
    newIndexes.forEach(idx => console.log(' -', idx.name, JSON.stringify(idx.key)));

  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected.');
    process.exit(0);
  }
}

fix();
