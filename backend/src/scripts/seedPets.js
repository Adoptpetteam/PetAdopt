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
      name: { type: String, required: true, unique: true },
      description: { type: String },
      image: { type: String },
      createdAt: { type: Date, default: Date.now },
    }, { timestamps: true });

    const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
    
    const dogCategory = await Category.findOne({ name: 'Chó' });
    const catCategory = await Category.findOne({ name: 'Mèo' });

    const samplePets = [
      {
        name: 'Max',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 2,
        gender: 'male',
        size: 'large',
        color: 'Golden',
        description: 'Chú chó thân thiện, thích chơi đùa',
        healthStatus: 'excellent',
        vaccinated: true,
        neutered: true,
        status: 'available',
        adoptionFee: 500000,
        location: 'Hà Nội',
        images: ['https://example.com/dog1.jpg'],
        categoryId: dogCategory?._id,
        createdBy: adminUser._id
      },
      {
        name: 'Luna',
        species: 'cat',
        breed: 'Persian',
        age: 1,
        gender: 'female',
        size: 'small',
        color: 'White',
        description: 'Mèo con dễ thương, rất hiền lành',
        healthStatus: 'good',
        vaccinated: true,
        neutered: false,
        status: 'available',
        adoptionFee: 300000,
        location: 'TP.HCM',
        images: ['https://example.com/cat1.jpg'],
        categoryId: catCategory?._id,
        createdBy: adminUser._id
      },
      {
        name: 'Buddy',
        species: 'dog',
        breed: 'Beagle',
        age: 3,
        gender: 'male',
        size: 'medium',
        color: 'Brown and White',
        description: 'Chú chó năng động, thích đi dạo',
        healthStatus: 'good',
        vaccinated: true,
        neutered: true,
        status: 'available',
        adoptionFee: 400000,
        location: 'Đà Nẵng',
        images: ['https://example.com/dog2.jpg'],
        categoryId: dogCategory?._id,
        createdBy: adminUser._id
      }
    ];

    await Pet.insertMany(samplePets);
    console.log('Đã tạo thành công pets mẫu!');

  } catch (error) {
    console.error('Lỗi khi tạo pets mẫu:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedPets();