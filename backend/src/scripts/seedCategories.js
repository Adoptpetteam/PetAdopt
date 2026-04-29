const mongoose = require('mongoose');
require('dotenv').config();

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const categorySchema = new mongoose.Schema({
      name: { type: String, required: true, unique: true },
      description: { type: String },
      image: { type: String },
      createdAt: { type: Date, default: Date.now },
    }, { timestamps: true });

    const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

    const sampleCategories = [
      {
        name: 'Chó',
        description: 'Các giống chó dễ thương',
        image: 'https://example.com/dog-category.jpg'
      },
      {
        name: 'Mèo',
        description: 'Các giống mèo đáng yêu',
        image: 'https://example.com/cat-category.jpg'
      },
      {
        name: 'Chim',
        description: 'Các loại chim cảnh',
        image: 'https://example.com/bird-category.jpg'
      }
    ];

    await Category.insertMany(sampleCategories);
    console.log('Đã tạo thành công categories mẫu!');

  } catch (error) {
    console.error('Lỗi khi tạo categories mẫu:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedCategories();