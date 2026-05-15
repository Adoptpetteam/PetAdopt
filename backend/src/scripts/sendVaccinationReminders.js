const mongoose = require('mongoose');
const cron = require('node-cron');
require('dotenv').config({ path: '../.env' });

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pawpalace');

const VaccinationSchedule = require('../models/VaccinationSchedule');
const { sendVaccinationReminder } = require('../utils/emailService');

// ===============================
// SEND VACCINATION REMINDERS
// ===============================
async function sendVaccinationReminders() {
  try {
    console.log('🔍 Đang tìm kiếm lịch tiêm cần nhắc nhở...');
    
    const schedulesNeedingReminder = await VaccinationSchedule.findSchedulesNeedingReminder();
    
    console.log(`📋 Tìm thấy ${schedulesNeedingReminder.length} lịch tiêm cần nhắc nhở`);
    
    if (schedulesNeedingReminder.length === 0) {
      console.log('✅ Không có lịch tiêm nào cần nhắc nhở hôm nay');
      return;
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const schedule of schedulesNeedingReminder) {
      try {
        console.log(`📧 Đang gửi email cho ${schedule.ownerName} - ${schedule.petName}...`);
        
        // Tính số ngày còn lại
        const today = new Date();
        const scheduledDate = new Date(schedule.scheduledDate);
        const diffTime = scheduledDate - today;
        const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        await sendVaccinationReminder(schedule.ownerEmail, {
          ownerName: schedule.ownerName,
          petName: schedule.petName,
          vaccineName: schedule.vaccineName,
          scheduledDate: schedule.scheduledDate,
          daysUntil: daysUntil,
          veterinarian: schedule.veterinarian
        });

        // Đánh dấu đã gửi reminder
        schedule.reminderSent = true;
        schedule.reminderSentAt = new Date();
        schedule.status = 'reminded';
        await schedule.save();

        console.log(`✅ Đã gửi email cho ${schedule.ownerName}`);
        sentCount++;
        
        // Delay nhỏ để tránh spam
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (emailErr) {
        console.error(`❌ Lỗi gửi email cho ${schedule.ownerName}:`, emailErr.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Kết quả:`);
    console.log(`   ✅ Đã gửi: ${sentCount} email`);
    console.log(`   ❌ Lỗi: ${errorCount} email`);
    console.log(`   📧 Tổng: ${schedulesNeedingReminder.length} email`);
    
  } catch (error) {
    console.error('❌ Lỗi trong quá trình gửi nhắc nhở:', error);
  }
}

// ===============================
// MANUAL RUN
// ===============================
if (require.main === module) {
  console.log('🚀 Bắt đầu gửi nhắc nhở tiêm phòng...');
  sendVaccinationReminders()
    .then(() => {
      console.log('✅ Hoàn thành gửi nhắc nhở');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Lỗi:', error);
      process.exit(1);
    });
}

// ===============================
// CRON JOB - Chạy hàng ngày lúc 8:00 AM
// ===============================
function startVaccinationReminderCron() {
  console.log('⏰ Khởi động cron job nhắc nhở tiêm phòng...');
  
  // Chạy hàng ngày lúc 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('\n⏰ Cron job: Bắt đầu gửi nhắc nhở tiêm phòng hàng ngày...');
    await sendVaccinationReminders();
  }, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh"
  });

  // Chạy thêm lúc 6:00 PM để nhắc nhở lần nữa
  cron.schedule('0 18 * * *', async () => {
    console.log('\n⏰ Cron job: Nhắc nhở tiêm phòng buổi chiều...');
    
    // Chỉ gửi cho những lịch tiêm ngày mai và hôm nay
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const urgentSchedules = await VaccinationSchedule.find({
      status: 'scheduled',
      scheduledDate: {
        $gte: today,
        $lte: tomorrow
      }
    });
    
    console.log(`📋 Tìm thấy ${urgentSchedules.length} lịch tiêm khẩn cấp`);
    
    for (const schedule of urgentSchedules) {
      try {
        const scheduledDate = new Date(schedule.scheduledDate);
        const diffTime = scheduledDate - today;
        const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (daysUntil <= 1) { // Hôm nay hoặc ngày mai
          await sendVaccinationReminder(schedule.ownerEmail, {
            ownerName: schedule.ownerName,
            petName: schedule.petName,
            vaccineName: schedule.vaccineName,
            scheduledDate: schedule.scheduledDate,
            daysUntil: daysUntil,
            veterinarian: schedule.veterinarian
          });
          
          console.log(`✅ Đã gửi nhắc nhở khẩn cấp cho ${schedule.ownerName}`);
        }
      } catch (error) {
        console.error(`❌ Lỗi gửi nhắc nhở khẩn cấp:`, error.message);
      }
    }
  }, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh"
  });

  console.log('✅ Cron job đã được thiết lập:');
  console.log('   - 08:00 AM: Gửi nhắc nhở hàng ngày');
  console.log('   - 06:00 PM: Nhắc nhở khẩn cấp cho lịch tiêm ngày mai');
}

module.exports = {
  sendVaccinationReminders,
  startVaccinationReminderCron
};
