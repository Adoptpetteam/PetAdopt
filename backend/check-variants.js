const mongoose = require('mongoose');
const Product = require('./src/models/Product');
require('dotenv').config();

async function checkVariants() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/petadopt');
    console.log('✅ Connected to MongoDB\n');

    const products = await Product.find({ hasVariants: true });
    
    console.log(`📦 Found ${products.length} products with variants:\n`);
    
    products.forEach(product => {
      console.log(`✅ ${product.name}`);
      console.log(`   - Price range: ${product.price.toLocaleString()}đ - ${product.maxPrice.toLocaleString()}đ`);
      console.log(`   - Total quantity: ${product.quantity}`);
      console.log(`   - Variants (${product.variants.length}):`);
      
      product.variants.forEach((variant, index) => {
        console.log(`     ${index + 1}. ${variant.name}`);
        console.log(`        Price: ${variant.price.toLocaleString()}đ | Qty: ${variant.quantity}`);
        if (variant.attributes) {
          const attrs = Object.entries(variant.attributes)
            .filter(([k, v]) => v)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
          if (attrs) console.log(`        ${attrs}`);
        }
      });
      console.log('');
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkVariants();
