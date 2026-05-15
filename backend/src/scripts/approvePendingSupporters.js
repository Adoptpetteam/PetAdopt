const mongoose = require('mongoose');
const Supporter = require('../models/Supporter');
require('dotenv').config();

async function approvePendingSupporters() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Cập nhật tất cả pending → completed
    const result = await Supporter.updateMany(
      { status: 'pending' },
      { 
        $set: { 
          status: 'completed',
          'vnpayData.responseCode': '00'
        } 
      }
    );

    console.log(`✅ Approved ${result.modifiedCount} pending supporters!`);
    
    // Hiển thị danh sách
    const supporters = await Supporter.find({ status: 'completed' })
      .sort({ amount: -1 })
      .select('name email amount status');
    
    console.log('\n📋 Danh sách người ủng hộ đã duyệt:');
    supporters.forEach((s, i) => {
      console.log(`${i + 1}. ${s.name} - ${s.amount.toLocaleString('vi-VN')}đ - ${s.email}`);
    });

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

approvePendingSupporters();
