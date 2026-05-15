const mongoose = require('mongoose');
require('dotenv').config();

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const categorySchema = new mongoose.Schema({
      name: { type: String, required: true },
      description: { type: String },
      image: { type: String },
      type: { type: String, enum: ['pet', 'product'], default: 'pet' },
      createdAt: { type: Date, default: Date.now },
    }, { timestamps: true });

    const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

    const sampleCategories = [
      {
        name: 'Chó',
        description: 'Các giống chó dễ thương',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
        type: 'pet'
      },
      {
        name: 'Mèo',
        description: 'Các giống mèo đáng yêu',
        image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
        type: 'pet'
      },
      {
        name: 'Chim',
        description: 'Các loại chim cảnh',
        image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400',
        type: 'pet'
      }
    ];

    // Xóa pet categories cũ trước khi thêm mới
    await Category.deleteMany({ type: 'pet' });
    console.log('Đã xóa pet categories cũ');

    await Category.insertMany(sampleCategories);
    console.log('Đã tạo thành công categories mẫu!');

  } catch (error) {
    console.error('Lỗi khi tạo categories mẫu:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedCategories();
