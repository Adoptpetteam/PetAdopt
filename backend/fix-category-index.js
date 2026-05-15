const mongoose = require('mongoose');
require('dotenv').config();

async function fixCategoryIndex() {
  try {
    console.log('🔧 Fixing Category Index...\n');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/petadopt');
    console.log('✅ Connected to MongoDB');

    const Category = mongoose.connection.collection('categories');

    // 1. Drop all indexes except _id
    console.log('\n1️⃣ Dropping existing indexes...');
    const indexes = await Category.indexes();
    console.log('   Current indexes:', indexes.map(i => i.name).join(', '));
    
    for (const index of indexes) {
      if (index.name !== '_id_') {
        try {
          await Category.dropIndex(index.name);
          console.log(`   ✅ Dropped: ${index.name}`);
        } catch (error) {
          console.log(`   ⚠️  Could not drop ${index.name}:`, error.message);
        }
      }
    }

    // 2. Create new index (name + type unique)
    console.log('\n2️⃣ Creating new index...');
    await Category.createIndex(
      { name: 1, type: 1 },
      { unique: true, name: 'name_type_unique' }
    );
    console.log('   ✅ Created: name_type_unique');

    // 3. Create performance index
    await Category.createIndex(
      { type: 1, isActive: 1 },
      { name: 'type_isActive' }
    );
    console.log('   ✅ Created: type_isActive');

    // 4. Verify
    console.log('\n3️⃣ Verifying indexes...');
    const newIndexes = await Category.indexes();
    console.log('   Final indexes:');
    newIndexes.forEach(index => {
      console.log(`   - ${index.name}:`, JSON.stringify(index.key));
    });

    // 5. Check for duplicates
    console.log('\n4️⃣ Checking for duplicate categories...');
    const duplicates = await Category.aggregate([
      {
        $group: {
          _id: { name: '$name', type: '$type' },
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    if (duplicates.length > 0) {
      console.log('   ⚠️  Found duplicates:');
      for (const dup of duplicates) {
        console.log(`   - ${dup._id.name} (${dup._id.type}): ${dup.count} copies`);
        // Keep first, delete rest
        const idsToDelete = dup.ids.slice(1);
        await Category.deleteMany({ _id: { $in: idsToDelete } });
        console.log(`     ✅ Deleted ${idsToDelete.length} duplicates`);
      }
    } else {
      console.log('   ✅ No duplicates found');
    }

    console.log('\n✅ Category index fixed successfully!');
    console.log('\n💡 Now restart your backend server:');
    console.log('   cd backend');
    console.log('   npm start');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixCategoryIndex();
