require('dotenv').config();
const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: Number },
  experience: { type: String },
  availability: { type: String },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Volunteer = mongoose.models.Volunteer || mongoose.model('Volunteer', volunteerSchema);

const volunteers = [
  {
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@gmail.com',
    phone: '0901234567',
    age: 25,
    experience: 'Đã từng chăm sóc chó mèo tại nhà',
    availability: 'Cuối tuần',
    reason: 'Tôi yêu động vật và muốn giúp đỡ những bé cần mái ấm',
    status: 'approved',
    adminNote: 'Nhiệt tình, có kinh nghiệm'
  },
  {
    name: 'Trần Thị Bình',
    email: 'tranthibinh@gmail.com',
    phone: '0902345678',
    age: 22,
    experience: 'Chưa có kinh nghiệm nhưng rất muốn học hỏi',
    availability: 'Thứ 7, Chủ nhật',
    reason: 'Muốn đóng góp cho cộng đồng và học cách chăm sóc thú cưng',
    status: 'approved',
    adminNote: 'Có tinh thần học hỏi tốt'
  },
  {
    name: 'Lê Hoàng Cường',
    email: 'lehoangcuong@gmail.com',
    phone: '0903456789',
    age: 28,
    experience: 'Đã làm tình nguyện viên tại trại cứu hộ động vật 2 năm',
    availability: 'Linh hoạt',
    reason: 'Có kinh nghiệm và muốn tiếp tục công việc thiện nguyện',
    status: 'approved',
    adminNote: 'Rất có kinh nghiệm, nhiệt tình'
  },
  {
    name: 'Phạm Thị Dung',
    email: 'phamthidung@gmail.com',
    phone: '0904567890',
    age: 30,
    experience: 'Nuôi chó mèo tại nhà 5 năm',
    availability: 'Chiều thứ 7, Chủ nhật',
    reason: 'Yêu động vật và muốn giúp đỡ những bé bị bỏ rơi',
    status: 'approved',
    adminNote: 'Có kinh nghiệm nuôi thú cưng'
  },
  {
    name: 'Hoàng Văn Em',
    email: 'hoangvanem@gmail.com',
    phone: '0905678901',
    age: 24,
    experience: 'Tham gia các hoạt động cứu trợ động vật',
    availability: 'Cuối tuần',
    reason: 'Muốn đóng góp sức lực cho việc cứu hộ động vật',
    status: 'approved',
    adminNote: 'Nhiệt huyết, có trách nhiệm'
  },
  {
    name: 'Đỗ Thị Phương',
    email: 'dothiphuong@gmail.com',
    phone: '0906789012',
    age: 26,
    experience: 'Chưa có kinh nghiệm',
    availability: 'Thứ 7',
    reason: 'Muốn học cách chăm sóc và giúp đỡ động vật',
    status: 'pending',
    adminNote: ''
  },
  {
    name: 'Vũ Văn Giang',
    email: 'vuvangiang@gmail.com',
    phone: '0907890123',
    age: 27,
    experience: 'Đã nuôi chó mèo nhiều năm',
    availability: 'Linh hoạt',
    reason: 'Có thời gian rảnh và muốn làm việc thiện',
    status: 'pending',
    adminNote: ''
  },
  {
    name: 'Bùi Thị Hoa',
    email: 'buithihoa@gmail.com',
    phone: '0908901234',
    age: 23,
    experience: 'Tham gia câu lạc bộ yêu động vật',
    availability: 'Chủ nhật',
    reason: 'Yêu động vật và muốn bảo vệ chúng',
    status: 'approved',
    adminNote: 'Tích cực, nhiệt tình'
  },
  {
    name: 'Ngô Văn Inh',
    email: 'ngovanin@gmail.com',
    phone: '0909012345',
    age: 29,
    experience: 'Làm việc tại phòng khám thú y',
    availability: 'Cuối tuần',
    reason: 'Có kiến thức về y tế thú cưng và muốn giúp đỡ',
    status: 'approved',
    adminNote: 'Có kiến thức chuyên môn tốt'
  },
  {
    name: 'Đinh Thị Kim',
    email: 'dinhthikim@gmail.com',
    phone: '0910123456',
    age: 21,
    experience: 'Chưa có kinh nghiệm',
    availability: 'Thứ 7, Chủ nhật',
    reason: 'Muốn học hỏi và đóng góp cho cộng đồng',
    status: 'pending',
    adminNote: ''
  }
];

async function seedVolunteers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Xóa dữ liệu cũ
    await Volunteer.deleteMany({});
    console.log('🗑️  Cleared old volunteers');

    // Thêm dữ liệu mới
    const result = await Volunteer.insertMany(volunteers);
    console.log(`✅ Seeded ${result.length} volunteers`);
    
    // Thống kê
    const approved = await Volunteer.countDocuments({ status: 'approved' });
    const pending = await Volunteer.countDocuments({ status: 'pending' });
    console.log(`📊 Approved: ${approved}, Pending: ${pending}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding volunteers:', error);
    process.exit(1);
  }
}

seedVolunteers();
