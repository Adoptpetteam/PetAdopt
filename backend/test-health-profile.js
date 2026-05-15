const mongoose = require('mongoose');
const VaccinationSchedule = require('./src/models/VaccinationSchedule');
const HealthRecord = require('./src/models/HealthRecord');
const Pet = require('./src/models/Pet');
const User = require('./src/models/User');
const AdoptionRequest = require('./src/models/AdoptionRequest');

// Load environment variables
require('dotenv').config();

async function testHealthProfile() {
  console.log('🧪 Testing Health Profile System...\n');

  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find test data
    const user = await User.findOne({ email: { $exists: true } });
    const pet = await Pet.findOne();

    if (!user || !pet) {
      console.log('❌ No test user or pet found');
      return;
    }

    console.log(`Using user: ${user.name} (${user.email})`);
    console.log(`Using pet: ${pet.name} (${pet.breed})`);

    // Create adoption request if not exists
    let adoption = await AdoptionRequest.findOne({
      user: user._id,
      pet: pet._id,
      status: 'approved'
    });

    if (!adoption) {
      adoption = await AdoptionRequest.create({
        user: user._id,
        pet: pet._id,
        status: 'approved',
        fullName: user.name,
        email: user.email,
        phone: user.phone || '0123456789',
        address: 'Test Address',
        reason: 'Test adoption for health profile',
        experience: 'experienced',
        housingType: 'house',
        familyMembers: 2,
        hasOtherPets: false,
        agreeToTerms: true,
        monthlyIncome: '10m_20m', // Use valid enum value
        occupation: 'Test Job' // Add if required
      });
      console.log('✅ Created test adoption request');
    }

    // Create health records
    console.log('\n📋 Creating health records...');
    
    const healthRecords = [
      {
        pet: pet._id,
        user: user._id,
        type: 'checkup',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        veterinarian: 'Bác sĩ Nguyễn Văn A',
        description: 'Khám sức khỏe tổng quát định kỳ',
        weight: 15.5,
        temperature: 38.2,
        nextCheckup: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
      },
      {
        pet: pet._id,
        user: user._id,
        type: 'vaccination',
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        veterinarian: 'Bác sĩ Trần Thị B',
        description: 'Tiêm vaccine 5 bệnh',
        weight: 15.8
      },
      {
        pet: pet._id,
        user: user._id,
        type: 'treatment',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        veterinarian: 'Bác sĩ Lê Văn C',
        description: 'Điều trị viêm tai',
        weight: 16.0,
        notes: 'Đã khỏi hoàn toàn'
      }
    ];

    for (const record of healthRecords) {
      await HealthRecord.findOneAndUpdate(
        { pet: record.pet, user: record.user, type: record.type, date: record.date },
        record,
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Created ${healthRecords.length} health records`);

    // Create vaccination schedules
    console.log('\n💉 Creating vaccination schedules...');
    
    const vaccinations = [
      {
        pet: pet._id,
        petName: pet.name,
        owner: user._id,
        ownerName: user.name,
        ownerEmail: user.email,
        ownerPhone: user.phone || '0123456789',
        vaccineName: 'Vaccine 5 bệnh (DHPP)',
        vaccineType: 'combo',
        scheduledDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        status: 'completed',
        completedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        description: 'Vaccine phòng 5 bệnh chính',
        veterinarian: {
          name: 'Bác sĩ Trần Thị B',
          clinic: 'Phòng khám thú y Pet Care',
          phone: '0987654321'
        },
        doseNumber: 1,
        totalDoses: 2
      },
      {
        pet: pet._id,
        petName: pet.name,
        owner: user._id,
        ownerName: user.name,
        ownerEmail: user.email,
        ownerPhone: user.phone || '0123456789',
        vaccineName: 'Vaccine dại',
        vaccineType: 'rabies',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'scheduled',
        description: 'Vaccine phòng bệnh dại',
        veterinarian: {
          name: 'Bác sĩ Nguyễn Văn A',
          clinic: 'Bệnh viện thú y Sài Gòn',
          phone: '0912345678'
        },
        doseNumber: 1,
        totalDoses: 1
      },
      {
        pet: pet._id,
        petName: pet.name,
        owner: user._id,
        ownerName: user.name,
        ownerEmail: user.email,
        ownerPhone: user.phone || '0123456789',
        vaccineName: 'Vaccine 5 bệnh (DHPP) - Liều 2',
        vaccineType: 'combo',
        scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        status: 'scheduled',
        description: 'Liều thứ 2 của vaccine 5 bệnh',
        veterinarian: {
          name: 'Bác sĩ Trần Thị B',
          clinic: 'Phòng khám thú y Pet Care',
          phone: '0987654321'
        },
        doseNumber: 2,
        totalDoses: 2
      }
    ];

    for (const vaccination of vaccinations) {
      await VaccinationSchedule.findOneAndUpdate(
        { 
          pet: vaccination.pet, 
          owner: vaccination.owner, 
          vaccineName: vaccination.vaccineName,
          scheduledDate: vaccination.scheduledDate
        },
        vaccination,
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Created ${vaccinations.length} vaccination schedules`);

    // Test the health profile API simulation
    console.log('\n📊 Testing health profile calculation...');
    
    const healthRecordsCount = await HealthRecord.countDocuments({ pet: pet._id, user: user._id });
    const vaccinationsCount = await VaccinationSchedule.countDocuments({ pet: pet._id, owner: user._id });
    const completedVaccinations = await VaccinationSchedule.countDocuments({ 
      pet: pet._id, 
      owner: user._id, 
      status: 'completed' 
    });

    const vaccinationStats = {
      total: vaccinationsCount,
      completed: completedVaccinations,
      scheduled: await VaccinationSchedule.countDocuments({ 
        pet: pet._id, 
        owner: user._id, 
        status: 'scheduled' 
      }),
      completionRate: vaccinationsCount > 0 ? Math.round((completedVaccinations / vaccinationsCount) * 100) : 0
    };

    const healthStats = {
      totalRecords: healthRecordsCount,
      vaccinations: await HealthRecord.countDocuments({ pet: pet._id, user: user._id, type: 'vaccination' }),
      checkups: await HealthRecord.countDocuments({ pet: pet._id, user: user._id, type: 'checkup' }),
      treatments: await HealthRecord.countDocuments({ pet: pet._id, user: user._id, type: 'treatment' })
    };

    console.log('📈 Health Profile Statistics:');
    console.log(`   - Total Health Records: ${healthStats.totalRecords}`);
    console.log(`   - Vaccinations: ${healthStats.vaccinations}`);
    console.log(`   - Checkups: ${healthStats.checkups}`);
    console.log(`   - Treatments: ${healthStats.treatments}`);
    console.log(`   - Total Vaccination Schedules: ${vaccinationStats.total}`);
    console.log(`   - Completed Vaccinations: ${vaccinationStats.completed}`);
    console.log(`   - Vaccination Completion Rate: ${vaccinationStats.completionRate}%`);

    // Calculate health score
    const vaccinationScore = vaccinationStats.completionRate;
    const checkupScore = healthStats.checkups > 0 ? 100 : 0;
    const recordScore = Math.min(100, healthStats.totalRecords * 20);
    const healthScore = Math.round((vaccinationScore * 0.5 + checkupScore * 0.3 + recordScore * 0.2));

    console.log(`   - Health Score: ${healthScore}/100`);

    console.log('\n🎉 Health profile test completed successfully!');
    console.log('\n📝 Test Summary:');
    console.log(`   - Pet: ${pet.name} (${pet.breed})`);
    console.log(`   - Owner: ${user.name}`);
    console.log(`   - Health Records: ${healthRecordsCount}`);
    console.log(`   - Vaccination Schedules: ${vaccinationsCount}`);
    console.log(`   - Health Score: ${healthScore}/100`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testHealthProfile();
