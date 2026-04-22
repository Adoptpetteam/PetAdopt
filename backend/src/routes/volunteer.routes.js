const express = require('express');
const router = express.Router();
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

// GET /api/volunteer - Lấy danh sách (admin)
const { authenticate } = require('../middleware/authMiddleware');
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [volunteers, total] = await Promise.all([
      Volunteer.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Volunteer.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: volunteers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/volunteer/:id - Chi tiết (admin)
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn tình nguyện' });
    }
    res.json({ success: true, data: volunteer });
  } catch (error) {
    next(error);
  }
});

// POST /api/volunteer - Đăng ký tình nguyện viên (public)
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, age, experience, availability, reason } = req.body;

    if (!name || !email || !phone || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }

    const volunteer = await Volunteer.create({
      name, email, phone, age, experience, availability, reason
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký tình nguyện viên thành công!',
      data: volunteer
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/volunteer/:id/approve - Duyệt (admin)
router.put('/:id/approve', authenticate, async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn' });
    }
    if (volunteer.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Đơn này đã được xử lý' });
    }
    volunteer.status = 'approved';
    volunteer.adminNote = req.body.adminNote || '';
    await volunteer.save();
    res.json({ success: true, message: 'Đã duyệt đơn tình nguyện viên!', data: volunteer });
  } catch (error) {
    next(error);
  }
});

// PUT /api/volunteer/:id/reject - Từ chối (admin)
router.put('/:id/reject', authenticate, async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn' });
    }
    if (volunteer.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Đơn này đã được xử lý' });
    }
    volunteer.status = 'rejected';
    volunteer.adminNote = req.body.adminNote || '';
    await volunteer.save();
    res.json({ success: true, message: 'Đã từ chối đơn tình nguyện viên', data: volunteer });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
