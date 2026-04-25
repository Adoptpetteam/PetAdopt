const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'replied', 'closed'], default: 'new' },
  reply: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

// GET /api/contact - Lấy danh sách (admin)
const { authenticate } = require('../middleware/authMiddleware');
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [contacts, total] = await Promise.all([
      Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Contact.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: contacts,
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

// POST /api/contact - Gửi liên hệ (public)
router.post('/', async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    const contact = await Contact.create({ name, email, message });

    res.status(201).json({
      success: true,
      message: 'Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.',
      data: contact
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/contact/:id/reply - Trả lời liên hệ (admin)
router.put('/:id/reply', authenticate, async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy liên hệ' });
    }
    contact.reply = req.body.reply || '';
    contact.status = 'replied';
    await contact.save();
    res.json({ success: true, message: 'Đã trả lời liên hệ!', data: contact });
  } catch (error) {
    next(error);
  }
});

// PUT /api/contact/:id/close - Đóng liên hệ (admin)
router.put('/:id/close', authenticate, async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy liên hệ' });
    }
    contact.status = 'closed';
    await contact.save();
    res.json({ success: true, message: 'Đã đóng liên hệ', data: contact });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
