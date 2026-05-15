const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

async function sendRemindersNow() {
  console.log('📧 Gửi nhắc nhở tiêm phòng ngay bây giờ...\n');

  try {
    // Connect to database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB');
    }

    // Import after connection
    const { sendVaccinationReminders } = require('./src/scripts/sendVaccinationReminders');

    // Send reminders
    await sendVaccinationReminders();

    console.log('\n🎉 Hoàn thành gửi nhắc nhở!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('\n🔌 Disconnected from MongoDB');
    }
  }
}

// Run immediately
sendRemindersNow();
