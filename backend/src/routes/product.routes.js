const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const productController = require('../controllers/productController');

// Cấu hình multer upload ảnh sản phẩm
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-product${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Chỉ chấp nhận file ảnh'));
  },
});

// public
router.get('/', productController.listProducts);
router.get('/:id', productController.getProductById);

// upload ảnh (admin)
router.post('/upload-image', authenticate, isAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Không có file' });
  const imageUrl = `/uploads/${req.file.filename}`;
  return res.json({ success: true, imageUrl });
});

// admin CRUD
router.post('/', authenticate, isAdmin, productController.createProduct);
router.put('/:id', authenticate, isAdmin, productController.updateProduct);
router.delete('/:id', authenticate, isAdmin, productController.deleteProduct);

module.exports = router;

