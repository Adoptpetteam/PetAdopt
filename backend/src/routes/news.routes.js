const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  content: { type: String },
  image: { type: String },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const News = mongoose.models.News || mongoose.model('News', newsSchema);

// GET /api/news - Lấy danh sách tin tức
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = 'published' } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [news, total] = await Promise.all([
      News.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      News.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: news,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/news/:id - Lấy chi tiết tin tức
router.get('/:id', async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    }
    res.json({ success: true, data: news });
  } catch (error) {
    next(error);
  }
});

// POST /api/news - Tạo tin tức mới (admin)
const { authenticate } = require('../middleware/authMiddleware');
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { title, description, content, image, status } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Tiêu đề là bắt buộc' });
    }
    const news = await News.create({ title, description, content, image, status });
    res.status(201).json({ success: true, message: 'Tạo bài viết thành công!', data: news });
  } catch (error) {
    next(error);
  }
});

// PUT /api/news/:id - Cập nhật tin tức (admin)
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    }
    const { title, description, content, image, status } = req.body;
    if (title !== undefined) news.title = title;
    if (description !== undefined) news.description = description;
    if (content !== undefined) news.content = content;
    if (image !== undefined) news.image = image;
    if (status !== undefined) news.status = status;
    await news.save();
    res.json({ success: true, message: 'Cập nhật bài viết thành công!', data: news });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/news/:id - Xóa tin tức (admin)
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    }
    res.json({ success: true, message: 'Xóa bài viết thành công!' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
