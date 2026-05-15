const mongoose = require('mongoose');
require('dotenv').config();

// Import models to ensure they're registered
require('../models/User');
require('../models/Pet');
require('../models/AdoptionRequest');
require('../models/Product');
require('../models/Order');
require('../models/Notification');
require('../models/Review');
require('../models/Donation');

const addDatabaseIndexes = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // User indexes
    console.log('📊 Adding User indexes...');
    await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.db.collection('users').createIndex({ googleId: 1 }, { sparse: true });
    await mongoose.connection.db.collection('users').createIndex({ role: 1 });
    await mongoose.connection.db.collection('users').createIndex({ isVerified: 1 });
    await mongoose.connection.db.collection('users').createIndex({ isBanned: 1 });

    // Pet indexes
    console.log('📊 Adding Pet indexes...');
    await mongoose.connection.db.collection('pets').createIndex({ status: 1 });
    await mongoose.connection.db.collection('pets').createIndex({ species: 1 });
    await mongoose.connection.db.collection('pets').createIndex({ location: 1 });
    await mongoose.connection.db.collection('pets').createIndex({ owner: 1 });
    await mongoose.connection.db.collection('pets').createIndex({ createdAt: -1 });
    await mongoose.connection.db.collection('pets').createIndex({ 
      name: 'text', 
      description: 'text', 
      breed: 'text' 
    });

    // AdoptionRequest indexes
    console.log('📊 Adding AdoptionRequest indexes...');
    await mongoose.connection.db.collection('adoptionrequests').createIndex({ status: 1 });
    await mongoose.connection.db.collection('adoptionrequests').createIndex({ user: 1 });
    await mongoose.connection.db.collection('adoptionrequests').createIndex({ pet: 1 });
    await mongoose.connection.db.collection('adoptionrequests').createIndex({ createdAt: -1 });

    // Product indexes
    console.log('📊 Adding Product indexes...');
    await mongoose.connection.db.collection('products').createIndex({ category: 1 });
    await mongoose.connection.db.collection('products').createIndex({ price: 1 });
    await mongoose.connection.db.collection('products').createIndex({ stock: 1 });
    await mongoose.connection.db.collection('products').createIndex({ isActive: 1 });
    await mongoose.connection.db.collection('products').createIndex({ 
      name: 'text', 
      description: 'text' 
    });

    // Order indexes
    console.log('📊 Adding Order indexes...');
    await mongoose.connection.db.collection('orders').createIndex({ user: 1 });
    await mongoose.connection.db.collection('orders').createIndex({ status: 1 });
    await mongoose.connection.db.collection('orders').createIndex({ createdAt: -1 });
    await mongoose.connection.db.collection('orders').createIndex({ paymentStatus: 1 });

    // Notification indexes
    console.log('📊 Adding Notification indexes...');
    await mongoose.connection.db.collection('notifications').createIndex({ user: 1 });
    await mongoose.connection.db.collection('notifications').createIndex({ isRead: 1 });
    await mongoose.connection.db.collection('notifications').createIndex({ createdAt: -1 });

    // Review indexes
    console.log('📊 Adding Review indexes...');
    await mongoose.connection.db.collection('reviews').createIndex({ user: 1 });
    await mongoose.connection.db.collection('reviews').createIndex({ pet: 1 });
    await mongoose.connection.db.collection('reviews').createIndex({ product: 1 });
    await mongoose.connection.db.collection('reviews').createIndex({ rating: 1 });

    // Donation indexes
    console.log('📊 Adding Donation indexes...');
    await mongoose.connection.db.collection('donations').createIndex({ createdAt: -1 });
    await mongoose.connection.db.collection('donations').createIndex({ amount: -1 });
    await mongoose.connection.db.collection('donations').createIndex({ isAnonymous: 1 });

    // VaccinationSchedule indexes
    console.log('📊 Adding VaccinationSchedule indexes...');
    await mongoose.connection.db.collection('vaccinationschedules').createIndex({ pet: 1 });
    await mongoose.connection.db.collection('vaccinationschedules').createIndex({ owner: 1 });
    await mongoose.connection.db.collection('vaccinationschedules').createIndex({ nextDueDate: 1 });
    await mongoose.connection.db.collection('vaccinationschedules').createIndex({ isCompleted: 1 });

    // Voucher indexes
    console.log('📊 Adding Voucher indexes...');
    await mongoose.connection.db.collection('vouchers').createIndex({ code: 1 }, { unique: true });
    await mongoose.connection.db.collection('vouchers').createIndex({ expiryDate: 1 });
    await mongoose.connection.db.collection('vouchers').createIndex({ isActive: 1 });

    console.log('✅ All database indexes added successfully!');
    
    // List all indexes for verification
    console.log('\n📋 Verifying indexes...');
    const collections = ['users', 'pets', 'adoptionrequests', 'products', 'orders', 'notifications', 'reviews', 'donations'];
    
    for (const collectionName of collections) {
      try {
        const indexes = await mongoose.connection.db.collection(collectionName).listIndexes().toArray();
        console.log(`${collectionName}: ${indexes.length} indexes`);
      } catch (error) {
        console.log(`${collectionName}: Collection not found (will be created when first document is inserted)`);
      }
    }

  } catch (error) {
    console.error('❌ Error adding database indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
if (require.main === module) {
  addDatabaseIndexes();
}

module.exports = addDatabaseIndexes;