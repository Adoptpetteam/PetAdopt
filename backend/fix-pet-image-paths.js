require('dotenv').config();
const mongoose = require('mongoose');
const Pet = require('./src/models/Pet');

async function fixImagePaths() {
  try {
    console.log('🔧 Fixing pet image paths...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Tìm tất cả pets có images
    const pets = await Pet.find({ images: { $exists: true, $ne: [] } });
    console.log(`📊 Found ${pets.length} pets with images\n`);
    
    let fixedCount = 0;
    let alreadyCorrectCount = 0;
    
    for (const pet of pets) {
      let needsUpdate = false;
      const fixedImages = pet.images.map(img => {
        // Nếu path là /uploads/pet-... (thiếu s)
        if (img.startsWith('/uploads/pet-')) {
          needsUpdate = true;
          // Thêm chữ s: /uploads/pets/pet-...
          return img.replace('/uploads/pet-', '/uploads/pets/pet-');
        }
        return img;
      });
      
      if (needsUpdate) {
        console.log(`🔄 Fixing pet: ${pet.name} (${pet._id})`);
        console.log(`   Before: ${pet.images[0]}`);
        console.log(`   After:  ${fixedImages[0]}`);
        
        pet.images = fixedImages;
        await pet.save();
        fixedCount++;
      } else {
        alreadyCorrectCount++;
      }
    }
    
    console.log('\n📈 Summary:');
    console.log(`   ✅ Fixed: ${fixedCount} pets`);
    console.log(`   ✓  Already correct: ${alreadyCorrectCount} pets`);
    console.log(`   📊 Total: ${pets.length} pets`);
    
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fixImagePaths();
