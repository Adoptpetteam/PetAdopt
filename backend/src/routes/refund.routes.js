const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const ctrl = require('../controllers/refundController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-qrcode${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Chỉ chấp nhận file ảnh'));
  },
});

// Upload QR code
router.post('/upload-qr', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Không có file' });
  return res.json({ success: true, imageUrl: `/uploads/${req.file.filename}` });
});

// User routes
router.get('/me', authenticate, ctrl.getMyRefunds);
router.get('/me/:id', authenticate, ctrl.getMyRefundById);
router.put('/me/:id/submit-bank-info', authenticate, ctrl.submitBankInfo);

// Admin routes
router.get('/admin', authenticate, isAdmin, ctrl.adminListRefunds);
router.put('/admin/:id/process', authenticate, isAdmin, ctrl.adminProcessRefund);

module.exports = router;
