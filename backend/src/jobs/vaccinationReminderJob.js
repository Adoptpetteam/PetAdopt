const cron = require('node-cron');
const vaccinationController = require('../controllers/vaccinationController');

let started = false;

/**
 * Chạy mỗi ngày 08:00 (giờ server).
 */
function startVaccinationReminderJob() {
  if (started) return;
  started = true;

  cron.schedule('0 8 * * *', async () => {
    try {
      const result = await vaccinationController.runDueReminders();
      console.log('[VaccinationReminder] Job hoàn tất:', result);
    } catch (e) {
      console.error('[VaccinationReminder] Job lỗi:', e.message);
    }
  });

  console.log('[VaccinationReminder] Đã lên lịch nhắc lịch tiêm: 08:00 hàng ngày');
}

module.exports = { startVaccinationReminderJob };
