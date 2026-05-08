const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { sendEmail } = require('../utils/emailService');

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
console.log('Volunteer route module loaded');

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
    const { adminNote = '' } = req.body || {};
    volunteer.status = 'approved';
    volunteer.adminNote = adminNote;
    await volunteer.save();

    try {
      const subject = 'Bạn đã trúng tuyển tình nguyện viên';
      const html = `
        <p>Chào ${volunteer.name},</p>
        <p>Cảm ơn bạn đã đăng ký tham gia đội ngũ tình nguyện viên của chúng tôi.</p>
        <p>Đơn của bạn đã được <strong>chấp thuận</strong>.</p>
        <p><strong>Ghi chú admin:</strong> ${adminNote || 'Không có ghi chú.'}</p>
        <p>Chúng tôi sẽ liên hệ bạn trong thời gian sớm nhất để sắp xếp buổi phỏng vấn.</p>
        <p>Trân trọng,<br/>PetAdopt Team</p>
      `;
      await sendEmail(volunteer.email, subject, html);
    } catch (emailError) {
      console.error('Lỗi gửi email duyệt tình nguyện viên:', emailError.message || emailError);
    }

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
    const { adminNote = '' } = req.body || {};
    volunteer.status = 'rejected';
    volunteer.adminNote = adminNote;
    await volunteer.save();

    try {
      const subject = 'Đơn tình nguyện viên của bạn đã bị từ chối';
      const html = `
        <p>Chào ${volunteer.name},</p>
        <p>Cảm ơn bạn đã gửi đơn đăng ký tình nguyện viên.</p>
        <p>Rất tiếc, đơn của bạn hiện tại đã bị <strong>từ chối</strong>.</p>
        <p><strong>Ghi chú admin:</strong> ${adminNote || 'Không có ghi chú.'}</p>
        <p>Chúng tôi cảm ơn sự quan tâm của bạn và hy vọng có thể hợp tác cùng bạn trong dịp khác.</p>
        <p>Trân trọng,<br/>PetAdopt Team</p>
      `;
      await sendEmail(volunteer.email, subject, html);
    } catch (emailError) {
      console.error('Lỗi gửi email từ chối tình nguyện viên:', emailError.message || emailError);
    }

    res.json({ success: true, message: 'Đã từ chối đơn tình nguyện viên', data: volunteer });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/volunteer/:id - Xóa đơn tình nguyện viên (admin)
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn' });
    }

    await volunteer.deleteOne();
    res.json({ success: true, message: 'Đã xóa đơn tình nguyện viên' });
  } catch (error) {
    next(error);
  }
});

// POST /api/volunteer/:id/delete - Xóa đơn tình nguyện viên (admin, fallback)
router.post('/:id/delete', authenticate, async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn' });
    }

    await volunteer.deleteOne();
    res.json({ success: true, message: 'Đã xóa đơn tình nguyện viên' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
