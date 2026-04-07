const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// GET /api/category - Lấy danh sách (public)
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: categories.map(c => ({ id: c._id, _id: c._id, name: c.name, description: c.description, image: c.image })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/category/:id - Chi tiết
router.get('/:id', async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
});

// POST /api/category - Tạo (admin)
router.post('/', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { name, description, image } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Tên danh mục là bắt buộc' });
    }
    const category = await Category.create({ name, description, image });
    res.status(201).json({ success: true, message: 'Tạo danh mục thành công!', data: category });
  } catch (error) {
    next(error);
  }
});

// PUT /api/category/:id - Cập nhật (admin)
router.put('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }
    const { name, description, image } = req.body;
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    await category.save();
    res.json({ success: true, message: 'Cập nhật danh mục thành công!', data: category });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/category/:id - Xóa (admin)
router.delete('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }
    res.json({ success: true, message: 'Xóa danh mục thành công!' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
