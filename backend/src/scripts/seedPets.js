const mongoose = require('mongoose');
const Pet = require('../models/Pet');
const User = require('../models/User');
require('dotenv').config();

const seedPets = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Tìm admin user đầu tiên
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('Không tìm thấy admin user. Vui lòng tạo admin user trước.');
      return;
    }

    // Tìm categories
    const categorySchema = new mongoose.Schema({
      name: { type: String, required: true },
      description: { type: String },
      image: { type: String },
      type: { type: String, enum: ['pet', 'product'], default: 'pet' },
      createdAt: { type: Date, default: Date.now },
    }, { timestamps: true });

    const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
    
    const dogCategory = await Category.findOne({ name: 'Chó', type: 'pet' });
    const catCategory = await Category.findOne({ name: 'Mèo', type: 'pet' });
    const birdCategory = await Category.findOne({ name: 'Chim', type: 'pet' });

    const samplePets = [
      // ===== CHÓ =====
      {
        name: 'Lucky',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 2,
        gender: 'male',
        size: 'large',
        color: 'Golden',
        description: 'Lucky là chú chó Golden Retriever thân thiện, năng động và rất thích chơi đùa. Phù hợp với gia đình có trẻ em.',
        healthStatus: 'excellent',
        vaccinated: true,
        neutered: true,
        status: 'available',
        adoptionFee: 500000,
        location: 'Hà Nội',
        images: ['https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400'],
        categoryId: dogCategory?._id,
        createdBy: adminUser._id
      },
      {
        name: 'Max',
        species: 'dog',
        breed: 'Husky',
        age: 1,
        gender: 'male',
        size: 'large',
        color: 'Grey and White',
        description: 'Max là chú Husky năng động, thông minh và rất trung thành. Cần không gian rộng để vận động.',
        healthStatus: 'excellent',
        vaccinated: true,
        neutered: false,
        status: 'available',
        adoptionFee: 600000,
        location: 'Hà Nội',
        images: ['https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400'],
        categoryId: dogCategory?._id,
        createdBy: adminUser._id
      },
      {
        name: 'Buddy',
        species: 'dog',
        breed: 'Labrador',
        age: 3,
        gender: 'male',
        size: 'large',
        color: 'Brown',
        description: 'Buddy là chú Labrador hiền lành, thông minh và dễ huấn luyện. Rất thích bơi lội.',
        healthStatus: 'good',
        vaccinated: true,
        neutered: true,
        status: 'available',
        adoptionFee: 450000,
        location: 'TP.HCM',
        images: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'],
        categoryId: dogCategory?._id,
        createdBy: adminUser._id
      },
      {
        name: 'Bella',
        species: 'dog',
        breed: 'Poodle',
        age: 1,
        gender: 'female',
        size: 'small',
        color: 'White',
        description: 'Bella là cô chó Poodle xinh xắn, thông minh và rất dễ thương. Lông không rụng nhiều.',
        healthStatus: 'excellent',
        vaccinated: true,
        neutered: false,
        status: 'available',
        adoptionFee: 400000,
        location: 'Đà Nẵng',
        images: ['https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400'],
        categoryId: dogCategory?._id,
        createdBy: adminUser._id
      },
      {
        name: 'Rocky',
        species: 'dog',
        breed: 'Bulldog',
        age: 2,
        gender: 'male',
        size: 'medium',
        color: 'Brown and White',
        description: 'Rocky là chú Bulldog mạnh mẽ nhưng rất hiền lành. Thích ngủ và ít vận động.',
        healthStatus: 'good',
        vaccinated: true,
        neutered: true,
        status: 'available',
        adoptionFee: 550000,
        location: 'Hà Nội',
        images: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400'],
        categoryId: dogCategory?._id,
        createdBy: adminUser._id
      },
      {
        name: 'Luna',
        species: 'dog',
        breed: 'Corgi',
        age: 1,
        gender: 'female',
        size: 'small',
        color: 'Orange and White',
        description: 'Luna là cô Corgi đáng yêu với đôi chân ngắn đặc trưng. Rất năng động và thân thiện.',
        healthStatus: 'excellent',
        vaccinated: true,
        neutered: false,
        status: 'available',
        adoptionFee: 500000,
        location: 'TP.HCM',
        images: ['https://images.unsplash.com/photo-1612536616423-e5b39f4e5e7d?w=400'],
        categoryId: dogCategory?._id,
        createdBy: adminUser._id
      },
      {
        name: 'Charlie',
        species: 'dog',
        breed: 'Beagle',
        age: 2,
        gender: 'male',
        size: 'medium',
        color: 'Tricolor',
        description: 'Charlie là chú Beagle năng động, thích khám phá và có khứu giác tuyệt vời.',
        healthStatus: 'good',
        vaccinated: true,
        neutered: true,
        status: 'available',
        adoptionFee: 400000,
        location: 'Đà Nẵng',
        images: ['https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400'],
        categoryId: dogCategory?._id,
        createdBy: adminUser._id
      },

      // ===== MÈO =====
      {
        name: 'Miu Miu',
        species: 'cat',
        breed: 'Persian',
        age: 1,
        gender: 'female',
        size: 'small',
        color: 'White',
        description: 'Miu Miu là cô mèo Ba Tư xinh đẹp với bộ lông dài mượt mà. Tính cách hiền lành và thích được vuốt ve.',
        healthStatus: 'excellent',
        vaccinated: true,
        neutered: false,
        status: 'available',
        adoptionFee: 350000,
        location: 'Hà Nội',
        images: ['https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400'],
        categoryId: catCategory?._id,
        createdBy: adminUser._id
      },
      {
        name: 'Simba',
        species: 'cat',
        breed: 'British Shorthair',
        age: 2,
        gender: 'male',
        size: 'medium',
        color: 'Grey',
        description: 'Simba là chú mèo Anh lông ngắn với bộ lông xám xanh đẹp mắt. Tính cách độc lập nhưng rất thân thiện.',
        healthStatus: 'excellent',
        vaccinated: true,
        neutered: true,
        status: 'available',
        adoptionFee: 400000,
        location: 'TP.HCM',
        images: ['https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400'],
        categoryId: catCategory?._id,
        createdBy: adminUser._id
      },
      {
        name: 'Kitty',
        species: 'cat',
        breed: 'Munchkin',
        age: 1,
        gender: 'female',
        size: 'small',
        color: 'Orange and White',
        description: 'Kitty là cô mèo Munchkin với đôi chân ngắn đáng yêu. Rất hiếu động và thích chơi đùa.',
        healthStatus: 'good',
        vaccinated: true,
        neutered: false,
        status: 'available',
        adoptionFee: 450000,
        location: 'Đà Nẵng',
        images: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400'],
        categoryId: catCategory?._id,
        createdBy: adminUser._id
      },
      {
        name: 'Shadow',
        species: 'cat',
        breed: 'Siamese',
        age: 1,
        gender: 'male',
        size: 'small',
        color: 'Cream and Brown',
        description: 'Shadow là chú mèo Xiêm thông minh và năng động. Rất thích giao tiếp và kêu nhiều.',
        healthStatus: 'excellent',
        vaccinated: true,
        neutered: false,
        status: 'available',
        adoptionFee: 350000,
        location: 'Hà Nội',
        images: ['https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400'],
        categoryId: catCategory?._id,
        createdBy: adminUser._id
      },
      {
        name: 'Nala',
        species: 'cat',
        breed: 'Ragdoll',
        age: 2,
        gender: 'female',
        size: 'medium',
        color: 'Cream and Brown',
        description: 'Nala là cô mèo Ragdoll với tính cách cực kỳ hiền lành. Thích được bế và vuốt ve.',
        healthStatus: 'excellent',
        vaccinated: true,
        neutered: true,
        status: 'available',
        adoptionFee: 500000,
        location: 'TP.HCM',
        images: ['https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=400'],
        categoryId: catCategory?._id,
        createdBy: adminUser._id
      },
      {
        name: 'Tiger',
        species: 'cat',
        breed: 'Bengal',
        age: 1,
        gender: 'male',
        size: 'medium',
        color: 'Brown Spotted',
        description: 'Tiger là chú mèo Bengal với bộ lông đốm đẹp như báo. Rất năng động và thích leo trèo.',
        healthStatus: 'good',
        vaccinated: true,
        neutered: false,
        status: 'available',
        adoptionFee: 550000,
        location: 'Đà Nẵng',
        images: ['https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?w=400'],
        categoryId: catCategory?._id,
        createdBy: adminUser._id
      },
      {
        name: 'Whiskers',
        species: 'cat',
        breed: 'Maine Coon',
        age: 3,
        gender: 'male',
        size: 'large',
        color: 'Brown Tabby',
        description: 'Whiskers là chú mèo Maine Coon lớn với bộ lông dài. Tính cách hiền lành và thân thiện.',
        healthStatus: 'good',
        vaccinated: true,
        neutered: true,
        status: 'available',
        adoptionFee: 600000,
        location: 'Hà Nội',
        images: ['https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400'],
        categoryId: catCategory?._id,
        createdBy: adminUser._id
      },

      // ===== CHIM =====
      {
        name: 'Tweety',
        species: 'bird',
        breed: 'Cockatiel',
        age: 1,
        gender: 'male',
        size: 'small',
        color: 'Yellow and Grey',
        description: 'Tweety là chú vẹt Cockatiel thông minh, có thể học nói và huýt sáo. Rất thân thiện với người.',
        healthStatus: 'excellent',
        vaccinated: false,
        neutered: false,
        status: 'available',
        adoptionFee: 200000,
        location: 'Hà Nội',
        images: ['https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400'],
        categoryId: birdCategory?._id,
        createdBy: adminUser._id
      },
      {
        name: 'Rio',
        species: 'bird',
        breed: 'Macaw',
        age: 2,
        gender: 'male',
        size: 'large',
        color: 'Blue and Yellow',
        description: 'Rio là chú vẹt Macaw lớn với bộ lông sặc sỡ. Rất thông minh và có thể học nhiều từ.',
        healthStatus: 'excellent',
        vaccinated: false,
        neutered: false,
        status: 'available',
        adoptionFee: 800000,
        location: 'TP.HCM',
        images: ['https://images.unsplash.com/photo-1552728089-4e3d1b6f4c8e?w=400'],
        categoryId: birdCategory?._id,
        createdBy: adminUser._id
      },
      {
        name: 'Sunny',
        species: 'bird',
        breed: 'Lovebird',
        age: 1,
        gender: 'female',
        size: 'small',
        color: 'Green',
        description: 'Sunny là cô vẹt Lovebird nhỏ nhắn đáng yêu. Rất tình cảm và thích được chơi đùa.',
        healthStatus: 'good',
        vaccinated: false,
        neutered: false,
        status: 'available',
        adoptionFee: 150000,
        location: 'Đà Nẵng',
        images: ['https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400'],
        categoryId: birdCategory?._id,
        createdBy: adminUser._id
      },
      {
        name: 'Kiwi',
        species: 'bird',
        breed: 'Budgie',
        age: 1,
        gender: 'male',
        size: 'small',
        color: 'Blue',
        description: 'Kiwi là chú vẹt Budgie nhỏ xinh với giọng hót hay. Dễ chăm sóc và thân thiện.',
        healthStatus: 'excellent',
        vaccinated: false,
        neutered: false,
        status: 'available',
        adoptionFee: 100000,
        location: 'Hà Nội',
        images: ['https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=400'],
        categoryId: birdCategory?._id,
        createdBy: adminUser._id
      },
    ];

    // Xóa pets cũ trước khi thêm mới
    await Pet.deleteMany({});
    console.log('Đã xóa pets cũ');

    // Thêm pets mới
    await Pet.insertMany(samplePets);
    console.log(`Đã tạo thành công ${samplePets.length} pets mẫu!`);

  } catch (error) {
    console.error('Lỗi khi tạo pets mẫu:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedPets();
