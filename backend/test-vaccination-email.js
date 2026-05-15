const { sendVaccinationConfirmation, sendVaccinationReminder } = require('./src/utils/emailService');
require('dotenv').config();

async function testVaccinationEmails() {
  console.log('🧪 Testing vaccination emails...');
  
  const testData = {
    ownerName: 'Nguyễn Văn A',
    petName: 'Buddy',
    vaccineName: 'Vaccine 5 bệnh',
    scheduledDate: new Date('2026-05-16T10:00:00'),
    daysUntil: 3,
    veterinarian: {
      name: 'BS. Trần Thị B',
      clinic: 'Phòng khám thú y ABC',
      phone: '0123456789'
    }
  };

  try {
    // Test confirmation email
    console.log('📧 Sending confirmation email...');
    await sendVaccinationConfirmation('test@example.com', testData);
    console.log('✅ Confirmation email sent successfully!');

    // Test reminder email
    console.log('📧 Sending reminder email...');
    await sendVaccinationReminder('test@example.com', testData);
    console.log('✅ Reminder email sent successfully!');

  } catch (error) {
    console.error('❌ Error sending emails:', error.message);
  }
}

testVaccinationEmails();
