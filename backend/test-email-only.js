const { sendVaccinationConfirmation, sendVaccinationReminder } = require('./src/utils/emailService');

// Load environment variables
require('dotenv').config();

async function testEmailOnly() {
  console.log('📧 Testing Email System Only...\n');

  const testData = {
    ownerName: 'Nguyễn Văn A',
    petName: 'Lucky',
    vaccineName: 'Vaccine 5 bệnh (DHPP)',
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    veterinarian: {
      name: 'Bác sĩ Trần Thị B',
      clinic: 'Phòng khám thú y Pet Care',
      phone: '0987654321'
    }
  };

  const testEmail = 'ngoquangtruong2610@gmail.com'; // Your email

  try {
    // Test confirmation email
    console.log('📧 Sending confirmation email...');
    await sendVaccinationConfirmation(testEmail, testData);
    console.log('✅ Confirmation email sent successfully!');

    // Test reminder email
    console.log('\n📧 Sending reminder email...');
    await sendVaccinationReminder(testEmail, {
      ...testData,
      daysUntil: 3
    });
    console.log('✅ Reminder email sent successfully!');

    console.log('\n🎉 All emails sent successfully!');
    console.log(`📬 Check your email: ${testEmail}`);

  } catch (error) {
    console.error('❌ Email error:', error);
  }
}

// Run the test
testEmailOnly();