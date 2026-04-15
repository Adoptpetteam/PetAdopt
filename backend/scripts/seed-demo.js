/**
 * Seed tài khoản + thú cưng + lịch tiêm demo (chạy local MongoDB).
 * Usage: npm run seed:demo  (từ thư mục backend)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Pet = require('../src/models/Pet');
const VaccinationSchedule = require('../src/models/VaccinationSchedule');

const DEMO_USER = {
  name: 'Khách Demo',
  email: 'petdemo@demo.com',
  password: 'Demo123!',
  role: 'user',
};

const DEMO_ADMIN = {
  name: 'Admin Demo',
  email: 'admindemo@demo.com',
  password: 'Admin123!',
  role: 'admin',
};

async function upsertUser({ name, email, password, role }) {
  let u = await User.findOne({ email });
  if (!u) {
    u = await User.create({
      name,
      email,
      password,
      role,
      isVerified: true,
    });
    console.log('  + Tạo user:', email);
  } else {
    u.name = name;
    u.password = password;
    u.role = role;
    u.isVerified = true;
    await u.save();
    console.log('  ~ Cập nhật user:', email, '(mật khẩu reset về mật khẩu demo)');
  }
  return u;
}

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/petadopt';
  await mongoose.connect(uri);
  console.log('Đã kết nối MongoDB');

  const user = await upsertUser(DEMO_USER);
  const admin = await upsertUser(DEMO_ADMIN);

  let pet = await Pet.findOne({ name: 'Mèo Demo Vaccine' });
  if (!pet) {
    pet = await Pet.create({
      name: 'Mèo Demo Vaccine',
      species: 'cat',
      breed: 'Ta',
      age: 1,
      createdBy: admin._id,
      status: 'available',
    });
    console.log('  + Tạo thú cưng demo:', pet.name);
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const existing = await VaccinationSchedule.findOne({
    ownerEmail: 'petdemo@demo.com',
    vaccineName: 'Vaccine 5 bệnh (demo)',
  });
  if (!existing) {
    await VaccinationSchedule.create({
      pet: pet._id,
      petNameSnapshot: pet.name,
      ownerName: user.name,
      ownerEmail: user.email,
      ownerPhone: '0900000000',
      vaccineName: 'Vaccine 5 bệnh (demo)',
      doseNumber: 1,
      scheduledAt: tomorrow,
      status: 'scheduled',
      notes: 'Tạo bởi npm run seed:demo — xóa được trong admin.',
      createdBy: admin._id,
    });
    console.log('  + Tạo lịch tiêm demo (ngày mai 10:00)');
  } else {
    console.log('  = Đã có lịch tiêm demo, giữ nguyên');
  }

  await mongoose.disconnect();
  console.log('\n=== XONG ===');
  console.log('Đăng nhập API (frontend /login):');
  console.log('  Khách:  ', DEMO_USER.email, ' / ', DEMO_USER.password);
  console.log('  Admin:  ', DEMO_ADMIN.email, ' / ', DEMO_ADMIN.password);
  console.log('\nURL:');
  console.log('  Lịch của khách:  /vaccination-schedule');
  console.log('  Quản lý admin:    /admin/vaccination-care');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
