const mongoose = require('mongoose');
const Supporter = require('../models/Supporter');
require('dotenv').config();

const supporters = [
  {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0901234567',
    amount: 5000000,
    message: 'Chúc các bé mau tìm được gia đình mới!',
    paymentMethod: 'vnpay',
    transactionId: 'DONATE001',
    status: 'completed',
    isAnonymous: false,
    displayName: 'Nguyễn Văn A'
  },
  {
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    phone: '0902345678',
    amount: 3000000,
    message: 'Ủng hộ các bé thú cưng!',
    paymentMethod: 'vnpay',
    transactionId: 'DONATE002',
    status: 'completed',
    isAnonymous: false,
    displayName: 'Trần Thị B'
  },
  {
    name: 'Lê Văn C',
    email: 'levanc@example.com',
    phone: '0903456789',
    amount: 2000000,
    message: 'Mong các bé được chăm sóc tốt',
    paymentMethod: 'vnpay',
    transactionId: 'DONATE003',
    status: 'completed',
    isAnonymous: false,
    displayName: 'Lê Văn C'
  },
  {
    name: 'Phạm Thị D',
    email: 'phamthid@example.com',
    phone: '0904567890',
    amount: 1500000,
    message: 'Yêu động vật!',
    paymentMethod: 'vnpay',
    transactionId: 'DONATE004',
    status: 'completed',
    isAnonymous: false,
    displayName: 'Phạm Thị D'
  },
  {
    name: 'Hoàng Văn E',
    email: 'hoangvane@example.com',
    phone: '0905678901',
    amount: 1000000,
    message: 'Chúc quỹ ngày càng phát triển',
    paymentMethod: 'vnpay',
    transactionId: 'DONATE005',
    status: 'completed',
    isAnonymous: false,
    displayName: 'Hoàng Văn E'
  },
  {
    name: 'Người ủng hộ ẩn danh',
    email: 'anonymous1@example.com',
    phone: '',
    amount: 2500000,
    message: '',
    paymentMethod: 'vnpay',
    transactionId: 'DONATE006',
    status: 'completed',
    isAnonymous: true,
    displayName: 'Người ủng hộ ẩn danh'
  },
  {
    name: 'Đỗ Thị F',
    email: 'dothif@example.com',
    phone: '0906789012',
    amount: 800000,
    message: 'Ủng hộ các bé!',
    paymentMethod: 'vnpay',
    transactionId: 'DONATE007',
    status: 'completed',
    isAnonymous: false,
    displayName: 'Đỗ Thị F'
  },
  {
    name: 'Vũ Văn G',
    email: 'vuvang@example.com',
    phone: '0907890123',
    amount: 1200000,
    message: 'Chúc các bé khỏe mạnh',
    paymentMethod: 'vnpay',
    transactionId: 'DONATE008',
    status: 'completed',
    isAnonymous: false,
    displayName: 'Vũ Văn G'
  },
  {
    name: 'Bùi Thị H',
    email: 'buithih@example.com',
    phone: '0908901234',
    amount: 500000,
    message: 'Ủng hộ một chút!',
    paymentMethod: 'vnpay',
    transactionId: 'DONATE009',
    status: 'completed',
    isAnonymous: false,
    displayName: 'Bùi Thị H'
  },
  {
    name: 'Đinh Văn I',
    email: 'dinhvani@example.com',
    phone: '0909012345',
    amount: 3500000,
    message: 'Yêu thú cưng!',
    paymentMethod: 'vnpay',
    transactionId: 'DONATE010',
    status: 'completed',
    isAnonymous: false,
    displayName: 'Đinh Văn I'
  },
  {
    name: 'Người ủng hộ ẩn danh',
    email: 'anonymous2@example.com',
    phone: '',
    amount: 1800000,
    message: '',
    paymentMethod: 'vnpay',
    transactionId: 'DONATE011',
    status: 'completed',
    isAnonymous: true,
    displayName: 'Người ủng hộ ẩn danh'
  },
  {
    name: 'Ngô Thị K',
    email: 'ngothik@example.com',
    phone: '0910123456',
    amount: 2200000,
    message: 'Chúc các bé may mắn!',
    paymentMethod: 'vnpay',
    transactionId: 'DONATE012',
    status: 'completed',
    isAnonymous: false,
    displayName: 'Ngô Thị K'
  }
];

async function seedSupporters() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Xóa dữ liệu cũ (tùy chọn)
    // await Supporter.deleteMany({});
    // console.log('🗑️  Cleared old supporters');

    // Thêm supporters mới
    await Supporter.insertMany(supporters);
    console.log(`✅ Seeded ${supporters.length} supporters successfully!`);

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding supporters:', error);
    process.exit(1);
  }
}

seedSupporters();
